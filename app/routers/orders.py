from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import io
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from .. import crud, schemas, database, models

# ✅ Router Instance
router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# =========================
# 📌 Create New Order
# =========================
@router.post("/", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    # check owner exists
    owner = db.query(models.Owner).filter(models.Owner.id == order.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    # check customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return crud.create_order(db, order)


# =========================
# 📌 Generate Invoice PDF
# =========================
@router.get("/{order_id}/invoice")
def generate_invoice(order_id: int, db: Session = Depends(database.get_db)):

    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    owner = order.owner  

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()
    story = []

    # 🏪 Store Header
    story.append(Paragraph("🛒 Store Invoice", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Owner ID: {owner.id}", styles['Normal']))
    story.append(Paragraph(f"Owner: {owner.name}", styles['Normal']))
    story.append(Paragraph(f"Shop: {owner.shop_name}", styles['Normal']))
    story.append(Paragraph(f"Address: {owner.address}", styles['Normal']))
    story.append(Paragraph(f"Contact: {owner.mobile}", styles['Normal']))
    story.append(Paragraph(f"Email: {owner.email}", styles['Normal']))
    story.append(Spacer(1, 12))

    # 📄 Invoice Meta Info
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    story.append(Paragraph(f"Invoice No: INV-{order.id}", styles['Normal']))
    story.append(Paragraph(f"Invoice Date/Time: {now}", styles['Normal']))
    story.append(Paragraph(f"Order ID: {order.id}", styles['Normal']))
    story.append(Paragraph(f"Payment Status: {order.status}", styles['Normal']))
    story.append(Spacer(1, 12))

    # 👤 Customer Info
    story.append(Paragraph("Customer Details:", styles['Heading2']))
    story.append(Paragraph(f"Name: {order.customer.name}", styles['Normal']))
    story.append(Paragraph(f"Mobile: {order.customer.phone}", styles['Normal']))
    story.append(Paragraph(f"Email: {order.customer.email}", styles['Normal']))
    if hasattr(order.customer, "address") and order.customer.address:
        story.append(Paragraph(f"Address: {order.customer.address}", styles['Normal']))
    story.append(Spacer(1, 20))

    # 📦 Table of Items
    data = [["Product ID", "Quantity", "Unit Price", "Subtotal"]]
    subtotal = 0.0
    for item in order.items:
        row_total = item.quantity * item.price
        subtotal += row_total
        data.append([
            str(item.product_id),
            str(item.quantity),
            f"₹{item.price:.2f}",
            f"₹{row_total:.2f}"
        ])

    # 💵 Tax, Discount, Grand Total
    tax = subtotal * 0.05
    discount = 0.0
    grand_total = subtotal + tax - discount

    data.append(["", "", "Subtotal", f"₹{subtotal:.2f}"])
    data.append(["", "", "GST (5%)", f"₹{tax:.2f}"])
    data.append(["", "", "Discount", f"-₹{discount:.2f}"])
    data.append(["", "", "Grand Total", f"₹{grand_total:.2f}"])

    table = Table(data, hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.gray),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
    ]))
    story.append(table)

    # 🙏 Footer
    story.append(Spacer(1, 15))
    story.append(Paragraph("Thank you for shopping with us! 🙏", styles['Italic']))
    story.append(Paragraph("Powered by Store Management System", styles['Normal']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)

    file_name = f"invoice_{order.id}.pdf"
    with open(file_name, "wb") as f:
        f.write(buffer.read())

    return FileResponse(file_name, media_type="application/pdf", filename=file_name)

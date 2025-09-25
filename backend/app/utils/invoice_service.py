import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from fastapi.responses import FileResponse

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_invoice(order):
    file_name = f"invoice_{order.id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 800, "INVOICE")

    c.setFont("Helvetica", 12)
    c.drawString(100, 770, f"Invoice No: {order.id}")
    c.drawString(100, 750, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
    
    # Customer details
    c.drawString(100, 730, f"Customer: {order.customer.name}")
    if order.customer.email:
        c.drawString(100, 710, f"Email: {order.customer.email}")
    if order.customer.phone:
        c.drawString(100, 690, f"Phone: {order.customer.phone}")
    if order.customer.address:
        c.drawString(100, 670, f"Address: {order.customer.address}")
    
    # Shop owner details
    c.drawString(400, 730, f"Store: {order.store.name}")
    if order.store.location:
        c.drawString(400, 710, f"Location: {order.store.location}")
    
    # Items table header
    y = 630
    c.drawString(100, y, "Product")
    c.drawString(300, y, "Quantity")
    c.drawString(380, y, "Price")
    c.drawString(450, y, "Total")
    y -= 20
    
    # Draw a line
    c.line(100, y, 500, y)
    y -= 20
    
    # Items
    subtotal = 0
    for item in order.items:
        item_total = item.quantity * item.price
        c.drawString(100, y, f"{item.product.name}")
        c.drawString(300, y, f"{item.quantity}")
        c.drawString(380, y, f"${item.price:.2f}")
        c.drawString(450, y, f"${item_total:.2f}")
        subtotal += item_total
        y -= 20
    
    # Draw a line
    y -= 10
    c.line(100, y, 500, y)
    y -= 20
    
    # Subtotal, discount and total
    c.drawString(350, y, f"Subtotal: ${subtotal:.2f}")
    y -= 20
    
    discount_amount = subtotal * (order.discount / 100) if order.discount else 0
    if order.discount:
        c.drawString(350, y, f"Discount ({order.discount:.1f}%): -${discount_amount:.2f}")
        y -= 20
    
    final_total = subtotal - discount_amount
    c.setFont("Helvetica-Bold", 12)
    c.drawString(350, y, f"TOTAL: ${final_total:.2f}")
    
    c.save()

    return file_path

def download_invoice(order_id):
    file_name = f"invoice_{order_id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename=file_name,
            media_type="application/pdf"
        )
    return None

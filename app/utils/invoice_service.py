from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import os
from datetime import datetime

UPLOAD_DIR = "invoices"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_invoice(order):
    file_name = f"invoice_{order.id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    doc = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # ---------------- Header ----------------
    story.append(Paragraph("<b>STORE MANAGEMENT SYSTEM</b>", styles['Title']))
    story.append(Paragraph("<b>Service / Sales Invoice</b>", styles['Heading2']))
    story.append(Spacer(1, 12))

    # ---------------- Invoice Meta ----------------
    meta_data = [
        ["Invoice No", f"INV-{order.id}", "Invoice Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ["Payment Status", getattr(order, 'status', 'Pending'), "Store Name", getattr(order.store, 'name', 'N/A')],
    ]
    table = Table(meta_data, colWidths=[100, 200, 100, 200])
    table.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black)]))
    story.append(table)
    story.append(Spacer(1, 12))

    # ---------------- Customer Info ----------------
    customer = getattr(order, 'customer', None)
    cust_data = [
        ["Customer Name", getattr(customer, 'name', 'N/A'), "Mobile", getattr(customer, 'phone', 'N/A')],
        ["Email", getattr(customer, 'email', 'N/A'), "Address", getattr(customer, 'address', 'N/A')],
    ]
    cust_table = Table(cust_data, colWidths=[100, 200, 100, 200])
    cust_table.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.black)]))
    story.append(Paragraph("<b>Customer Details</b>", styles['Heading3']))
    story.append(cust_table)
    story.append(Spacer(1, 12))

    # ---------------- Products Table ----------------
    data = [["Code", "Description", "Qty", "Price", "Discount", "CGST", "SGST", "Subtotal"]]
    total = 0
    for item in order.items:
        prod = getattr(item, 'product', None)
        product_id = getattr(prod, 'id', 'N/A')
        product_name = getattr(prod, 'name', 'Unknown Product')
        qty = item.quantity
        price = item.price
        discount = 0
        cgst = sgst = round(price * 0.09, 2)  # Example 9% CGST/SGST
        subtotal = (qty * price) + cgst + sgst - discount
        total += subtotal
        data.append([product_id, product_name, qty, f"{price:.2f}", f"{discount:.2f}", f"{cgst:.2f}", f"{sgst:.2f}", f"{subtotal:.2f}"])

    prod_table = Table(data, hAlign='RIGHT', colWidths=[50, 150, 50, 70, 70, 50, 50, 80])
    prod_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
        ('ALIGN',(0,0),(-1,-1),'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ]))
    story.append(Paragraph("<b>Products / Parts Description</b>", styles['Heading3']))
    story.append(prod_table)
    story.append(Spacer(1, 12))

    # ---------------- Totals ----------------
    story.append(Paragraph(f"<b>Total Amount: ₹ {total:.2f}</b>", styles['Heading2']))
    story.append(Spacer(1, 12))

    # ---------------- Footer ----------------
    story.append(Paragraph("<b>Terms & Conditions:</b>", styles['Normal']))
    story.append(Paragraph("1. Goods once sold cannot be returned.", styles['Normal']))
    story.append(Paragraph("2. Taxes are included as per applicable law.", styles['Normal']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Customer Signature ____________________", styles['Normal']))
    story.append(Paragraph("Authorized Signatory __________________", styles['Normal']))

    doc.build(story)
    return file_path

import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime

UPLOAD_DIR = "uploads"

def create_invoice(order):
    file_name = f"invoice_{order.id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 800, "INVOICE")

    c.setFont("Helvetica", 12)
    c.drawString(100, 770, f"Invoice No: {order.id}")
    c.drawString(100, 750, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
    c.drawString(100, 730, f"Customer: {order.customer.name}")
    c.drawString(100, 710, f"Email: {order.customer.email}")

    y = 680
    total = 0
    for item in order.items:
        line = f"{item.product.name} - Qty: {item.quantity} x {item.price} = {item.quantity * item.price}"
        c.drawString(100, y, line)
        total += item.quantity * item.price
        y -= 20

    c.drawString(100, y - 20, f"TOTAL: {total}")
    c.save()

    return file_path

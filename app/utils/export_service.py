from openpyxl import Workbook
import os

EXPORT_DIR = "exports"
os.makedirs(EXPORT_DIR, exist_ok=True)

def export_customers_to_excel(customers, file_name="customers.xlsx"):
    """
    Export customers list to Excel file
    customers = list of Customer model objects
    """
    wb = Workbook()
    ws = wb.active
    ws.title = "Customers"

    # Header Row
    headers = ["ID", "Name", "Email", "Phone", "Address", "Store ID"]
    ws.append(headers)

    # Data Rows
    for cust in customers:
        ws.append([
            cust.id,
            cust.name,
            cust.email,
            cust.phone,
            cust.address,
            cust.store_id
        ])

    # Save File
    file_path = os.path.join(EXPORT_DIR, file_name)
    wb.save(file_path)
    return file_path

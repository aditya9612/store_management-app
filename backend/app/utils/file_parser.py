import pandas as pd

def parse_file(file_path: str):
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    elif file_path.endswith((".xls", ".xlsx")):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Only CSV and Excel are allowed.")

    # Convert DataFrame rows to list of objects/dicts
    customers = []
    for _, row in df.iterrows():
        customers.append({
            "name": row["name"],
            "email": row["email"],
            "phone": row["phone"]
        })
    return customers

import os
import pandas as pd

# Define the folder containing the datasets
DATA_FOLDER = "data"

def check_csv_headers(file_name):
    """Loads a CSV file and prints the headers and first 5 rows."""
    file_path = os.path.join(DATA_FOLDER, file_name)
    
    try:
        df = pd.read_csv(file_path)
        print(f"\n✅ File: {file_name}")
        print("🔹 Headers:", list(df.columns))
        print("🔹 First 5 rows:")
        print(df.head(), "\n")
    except Exception as e:
        print(f"❌ Error reading {file_name}: {e}")

if __name__ == "__main__":
    # List all CSV files in the data directory
    csv_files = [f for f in os.listdir(DATA_FOLDER) if f.endswith(".csv")]

    if not csv_files:
        print("❌ No CSV files found in the 'data' folder.")
    else:
        print(f"📂 Found {len(csv_files)} CSV file(s) in '{DATA_FOLDER}': {csv_files}\n")

        # Check headers for each CSV file
        for file in csv_files:
            check_csv_headers(file)

import pandas as pd

csv_path = "data/megaGymDataset.csv"
df = pd.read_csv(csv_path)

unique_body_parts = df['BodyPart'].dropna().unique()

print("Unique Body Parts in the CSV:\n")
for body_part in sorted(unique_body_parts):
    print(body_part)

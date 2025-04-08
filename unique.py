import pandas as pd

df = pd.read_csv("megaGymDataset.csv") 
unique_body_parts = df['BodyPart'].unique()
for part in unique_body_parts:
    print(part)

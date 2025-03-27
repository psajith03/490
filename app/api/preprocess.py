import pandas as pd
import os

def load_and_preprocess():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(current_dir, "data", "megaGymDataset.csv"),
        os.path.join(current_dir, "..", "back", "data", "megaGymDataset.csv"),
        os.path.join(current_dir, "..", "..", "back", "data", "megaGymDataset.csv")
    ]
    
    dataset_path = None
    for path in possible_paths:
        if os.path.exists(path):
            dataset_path = path
            break
    
    if not dataset_path:
        raise FileNotFoundError(f"Could not find megaGymDataset.csv in any of these locations: {possible_paths}")
    
    df = pd.read_csv(dataset_path)
    
    df.drop(columns=['RatingDesc'], inplace=True, errors='ignore')
    df.rename(columns={'Title': 'exercise', 'Desc': 'description', 'BodyPart': 'muscle_group'}, inplace=True)
    df['exercise'] = df['exercise'].str.lower().str.strip()
    df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
    avg_rating = df['Rating'].mean()
    df['Rating'] = df['Rating'].fillna(avg_rating)
    text_columns = ['description', 'Type', 'muscle_group', 'Equipment', 'Level']
    df[text_columns] = df[text_columns].fillna("Unknown")

    return df

if __name__ == "__main__":
    df = load_and_preprocess()
    print(df.head())

import pandas as pd

def load_and_preprocess():
    df = pd.read_csv("data/megaGymDataset.csv")
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

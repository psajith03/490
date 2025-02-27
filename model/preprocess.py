import pandas as pd

def load_and_preprocess():
    """
    Loads and cleans the megaGymDataset.
    Fixes missing values and ensures correct data types.
    Returns a cleaned DataFrame.
    """
    # Load dataset
    df = pd.read_csv("data/megaGymDataset.csv")

    # Drop unnecessary columns
    df.drop(columns=['RatingDesc'], inplace=True, errors='ignore')

    # Convert column names for consistency
    df.rename(columns={'Title': 'exercise', 'Desc': 'description', 'BodyPart': 'muscle_group'}, inplace=True)

    # Convert exercise names to lowercase
    df['exercise'] = df['exercise'].str.lower().str.strip()

    # Convert Rating column to numeric
    df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')

    # Compute the average rating (ignoring NaN values)
    avg_rating = df['Rating'].mean()

    # Fill missing ratings with the average rating
    df['Rating'] = df['Rating'].fillna(avg_rating)

    # Fill missing values in text columns with "Unknown"
    text_columns = ['description', 'Type', 'muscle_group', 'Equipment', 'Level']
    df[text_columns] = df[text_columns].fillna("Unknown")

    return df

if __name__ == "__main__":
    df = load_and_preprocess()
    print(df.head())  # Check cleaned dataset

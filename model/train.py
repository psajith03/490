from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from preprocess import load_and_preprocess

def train_model():
    """
    Trains an item-based collaborative filtering model for workout recommendations.
    Returns a similarity matrix.
    """
    # Load the cleaned dataset
    df = load_and_preprocess()

    # Convert categorical features into numerical representations
    df_encoded = pd.get_dummies(df[['Type', 'muscle_group', 'Equipment', 'Level']], drop_first=True)

    # Include rating as a numeric column
    df_encoded['Rating'] = df['Rating']

    # Compute similarity between exercises
    similarity_matrix = cosine_similarity(df_encoded)

    # Convert to DataFrame for easier access (using lowercase exercise names)
    similarity_df = pd.DataFrame(similarity_matrix, index=df['exercise'], columns=df['exercise'])

    return similarity_df

if __name__ == "__main__":
    similarity_matrix = train_model()
    print(similarity_matrix.head())  # Check similarity scores

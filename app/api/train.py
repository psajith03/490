from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from preprocess import load_and_preprocess

def train_model():
    df = load_and_preprocess()

    df_encoded = pd.get_dummies(df[['Type', 'muscle_group', 'Equipment', 'Level']], drop_first=True)

    df_encoded['Rating'] = df['Rating']

    similarity_matrix = cosine_similarity(df_encoded)

    similarity_df = pd.DataFrame(similarity_matrix, index=df['exercise'], columns=df['exercise'])

    return similarity_df

if __name__ == "__main__":
    similarity_matrix = train_model()
    print(similarity_matrix.head())

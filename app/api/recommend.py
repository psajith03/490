import pandas as pd
from train import train_model
from preprocess import load_and_preprocess

similarity_matrix = train_model()

def recommend_exercises(exercise_name, top_n=5):
    """
    Returns the top N similar exercises, excluding the exercise itself.
    """
    exercise_name = exercise_name.lower().strip()

    if exercise_name not in similarity_matrix.index:
        print(f"Exercise '{exercise_name}' not found in dataset!")
        return []
    
    similar_exercises = similarity_matrix[exercise_name].drop(exercise_name).sort_values(ascending=False).head(top_n)
    
    return similar_exercises.index.tolist()

def get_popular_exercises(muscle_group, top_n=5):
    """
    Returns the most popular exercises for a given muscle group.
    """
    df = load_and_preprocess()
    muscle_group = muscle_group.lower().strip()

    if muscle_group not in df['muscle_group'].str.lower().values:
        print(f"Muscle group '{muscle_group}' not found in dataset!")
        return []
    
    popular_exercises = df[df['muscle_group'].str.lower() == muscle_group].sort_values(by="Rating", ascending=False)
    return popular_exercises['exercise'].head(top_n).tolist()

if __name__ == "__main__":
    test_exercise = "bench press"
    print(f"Exercises similar to '{test_exercise}':", recommend_exercises(test_exercise))

    test_muscle = "Chest"
    print(f"Most popular exercises for '{test_muscle}':", get_popular_exercises(test_muscle))

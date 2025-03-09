import pandas as pd
from preprocess import load_and_preprocess

df = load_and_preprocess()

muscle_column = "muscle_group"  

SPLIT_TYPES = {
    "total_body": [
        "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quadriceps", "Hamstrings", "Calves", "Abdominals"
    ],
    "upper_lower": {
        "upper": ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms"],
        "lower": ["Quadriceps", "Hamstrings", "Calves", "Glutes", "Abductors", "Adductors"]
    },
    "push_pull_legs": {
        "push": ["Chest", "Shoulders", "Triceps"],
        "pull": ["Back", "Lats", "Biceps", "Forearms"],
        "legs": ["Quadriceps", "Hamstrings", "Glutes", "Calves"]
    },
    "bro_split": {
        "chest_day": ["Chest"],
        "back_day": ["Back", "Lats", "Middle Back", "Lower Back"],
        "shoulder_day": ["Shoulders", "Traps"],
        "arm_day": ["Biceps", "Triceps", "Forearms"],
        "leg_day": ["Quadriceps", "Hamstrings", "Calves", "Glutes", "Abductors", "Adductors"],
        "core_day": ["Abdominals", "Neck"]
    }
}

def generate_full_workout_plan(split_type):
    workout_plan = {}

    if split_type == "total_body":
        workout_plan["total_body"] = (
            df[df[muscle_column].isin(SPLIT_TYPES["total_body"])]
            .groupby(muscle_column)
            .apply(lambda x: x.sample(n=min(len(x), 5)))
            .reset_index(drop=True)["exercise"]
            .tolist()
        )

    elif split_type == "upper_lower":
        for key in ["upper", "lower"]:
            workout_plan[key] = (
                df[df[muscle_column].isin(SPLIT_TYPES["upper_lower"][key])]
                .sample(n=min(len(df[df[muscle_column].isin(SPLIT_TYPES["upper_lower"][key])]), 5))
                ["exercise"]
                .tolist()
            )

    elif split_type == "push_pull_legs":
        for key in ["push", "pull", "legs"]:
            workout_plan[key] = (
                df[df[muscle_column].isin(SPLIT_TYPES["push_pull_legs"][key])]
                .sample(n=min(len(df[df[muscle_column].isin(SPLIT_TYPES["push_pull_legs"][key])]), 5))
                ["exercise"]
                .tolist()
            )

    elif split_type == "bro_split":
        for day, muscles in SPLIT_TYPES["bro_split"].items():
            workout_plan[day] = (
                df[df[muscle_column].isin(muscles)]
                .sample(n=min(len(df[df[muscle_column].isin(muscles)]), 5))
                ["exercise"]
                .tolist()
            )

    return workout_plan

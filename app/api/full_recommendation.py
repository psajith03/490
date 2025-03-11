import pandas as pd
import os
from preprocess import load_and_preprocess

df = load_and_preprocess()

muscle_column = "muscle_group"  

SPLIT_TYPES = {
    "total_body": [
        "Chest", "Shoulders", "Triceps", "Lats", "Middle Back", "Lower Back", 
        "Traps", "Biceps", "Forearms", "Quadriceps", "Hamstrings", "Glutes", 
        "Calves", "Abductors", "Adductors", "Abdominals", "Neck"
    ],
    "upper_lower": {
        "upper": ["Chest", "Shoulders", "Traps", "Triceps", "Biceps", "Lats", 
                 "Middle Back", "Lower Back", "Forearms", "Neck"],
        "lower": ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Adductors", 
                 "Abductors", "Abdominals"]
    },
    "push_pull_legs": {
        "push": ["Chest", "Shoulders", "Triceps"],
        "pull": ["Lats", "Middle Back", "Lower Back", "Biceps", "Traps", "Forearms"],
        "legs": ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Abdominals", 
                "Adductors", "Abductors"]
    },
    "bro_split": {
        "chest_day": ["Chest"],
        "back_day": ["Lats", "Middle Back", "Lower Back"],
        "shoulder_day": ["Shoulders", "Traps"],
        "arm_day": ["Biceps", "Triceps", "Forearms"],
        "leg_day": ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors"],
        "core_day": ["Abdominals", "Neck"]
    }
}

def generate_full_workout_plan(split_type, equipment_list=None, exercise_type_list=None):
    if equipment_list is None:
        equipment_list = []
    if exercise_type_list is None:
        exercise_type_list = []
        
    workout_plan = {}
    filtered_df = df.copy()
    
    print(f"Original dataset size: {len(filtered_df)}")
    print(f"Equipment filter: {equipment_list}")
    print(f"Exercise type filter: {exercise_type_list}")
    
    print(f"Columns in dataframe: {filtered_df.columns.tolist()}")
    unique_muscles = filtered_df[muscle_column].unique()
    print(f"\nUnique muscle groups in dataset: {unique_muscles.tolist()}")

    all_expected_muscles = set()
    for split_type_muscles in SPLIT_TYPES.values():
        if isinstance(split_type_muscles, list):
            all_expected_muscles.update(split_type_muscles)
        elif isinstance(split_type_muscles, dict):
            for muscles in split_type_muscles.values():
                all_expected_muscles.update(muscles)
    
    print("\nChecking if expected muscle groups exist in the dataset:")
    missing_muscles = []
    for muscle in all_expected_muscles:
        matching_rows = filtered_df[filtered_df[muscle_column].str.lower() == muscle.lower()]
        print(f"  {muscle}: {len(matching_rows)} exercises")
        if len(matching_rows) == 0:
            missing_muscles.append(muscle)
    
    if missing_muscles:
        print(f"\nWARNING: The following muscle groups are not found in the dataset: {missing_muscles}")
        print("Creating a muscle group mapping for fallback...")
        
        muscle_mapping = {
            "Chest": ["chest", "pectorals"],
            "Back": ["back", "lats", "middle back", "lower back"],
            "Shoulders": ["shoulders", "delts", "deltoids"],
            "Biceps": ["biceps", "arms"],
            "Triceps": ["triceps", "arms"],
            "Quadriceps": ["quadriceps", "quads", "legs"],
            "Hamstrings": ["hamstrings", "legs"],
            "Calves": ["calves", "legs"],
            "Abdominals": ["abdominals", "abs", "core"],
            "Lats": ["lats", "back"],
            "Middle Back": ["middle back", "back"],
            "Lower Back": ["lower back", "back"],
            "Traps": ["traps", "trapezius", "shoulders"],
            "Forearms": ["forearms", "arms"],
            "Glutes": ["glutes", "buttocks", "legs"],
            "Abductors": ["abductors", "legs"],
            "Adductors": ["adductors", "legs"],
            "Neck": ["neck", "traps"]
        }
    
    print("\nSample data (first 3 rows):")
    for i, row in filtered_df.head(3).iterrows():
        print(f"Row {i}:")
        print(f"  Exercise: {row['exercise']}")
        print(f"  Equipment: {row['Equipment']}")
        print(f"  Type: {row['Type']}")
        print(f"  Muscle Group: {row[muscle_column]}")
    
    if equipment_list:
        equipment_lower = [equip.lower() for equip in equipment_list]
        
        unique_equipment = filtered_df['Equipment'].str.lower().unique().tolist()
        print(f"\nUnique equipment values in dataset: {unique_equipment}")
        print(f"Looking for equipment in: {equipment_lower}")
        
        for equip in equipment_lower:
            matching_rows = filtered_df[filtered_df['Equipment'].str.lower() == equip]
            print(f"Equipment '{equip}' matches {len(matching_rows)} rows")
            if len(matching_rows) > 0:
                print(f"Sample matching exercises: {matching_rows['exercise'].head(3).tolist()}")
        
        filtered_df = filtered_df[filtered_df['Equipment'].str.lower().isin(equipment_lower)]
        print(f"After equipment filter, dataset size: {len(filtered_df)}")
        if len(filtered_df) == 0:
            print(f"Warning: No exercises found with equipment in {equipment_list}")
    
    if exercise_type_list and len(filtered_df) > 0:
        exercise_type_lower = [ex_type.lower() for ex_type in exercise_type_list]
        
        unique_types = filtered_df['Type'].str.lower().unique().tolist()
        print(f"\nUnique exercise type values in dataset: {unique_types}")
        print(f"Looking for exercise types in: {exercise_type_lower}")
        
        for ex_type in exercise_type_lower:
            matching_rows = filtered_df[filtered_df['Type'].str.lower() == ex_type]
            print(f"Exercise type '{ex_type}' matches {len(matching_rows)} rows")
            if len(matching_rows) > 0:
                print(f"Sample matching exercises: {matching_rows['exercise'].head(3).tolist()}")
        
        filtered_df = filtered_df[filtered_df['Type'].str.lower().isin(exercise_type_lower)]
        
        print(f"After exercise type filter, dataset size: {len(filtered_df)}")
        
        if len(filtered_df) == 0:
            print(f"Warning: No exercises found with exercise type in {exercise_type_list}")
    
    if len(filtered_df) == 0:
        print(f"No exercises found with the specified filters. Using all exercises.")
        filtered_df = df.copy()
    else:
        print("\nSample filtered exercises:")
        for i, row in filtered_df.head(5).iterrows():
            print(f"  {row['exercise']} - Equipment: {row['Equipment']}, Type: {row['Type']}")

    if split_type == "total_body":
        muscle_exercises = {}
        for muscle in SPLIT_TYPES["total_body"]:
            muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == muscle.lower()]
            
            if len(muscle_df) == 0 and 'muscle_mapping' in locals():
                print(f"Using muscle mapping fallback for {muscle}")
                for alt_muscle in muscle_mapping.get(muscle, []):
                    alt_muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == alt_muscle.lower()]
                    if len(alt_muscle_df) > 0:
                        print(f"  Found {len(alt_muscle_df)} exercises for alternative muscle: {alt_muscle}")
                        muscle_df = alt_muscle_df
                        break
            
            if len(muscle_df) > 0:
                muscle_exercises[muscle] = muscle_df.sample(n=min(len(muscle_df), 2))["exercise"].tolist()
            else:
                print(f"No exercises found for muscle group: {muscle}")
                muscle_exercises[muscle] = []
        
        all_exercises = []
        for muscle, exercises in muscle_exercises.items():
            all_exercises.extend(exercises)
        
        if all_exercises:
            workout_plan["total_body"] = all_exercises
        else:
            workout_plan["total_body"] = []

    elif split_type == "upper_lower":
        for key in ["upper", "lower"]:
            muscle_exercises = {}
            
            for muscle in SPLIT_TYPES["upper_lower"][key]:
                muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == muscle.lower()]
                
                if len(muscle_df) == 0 and 'muscle_mapping' in locals():
                    print(f"Using muscle mapping fallback for {muscle} in {key} split")
                    for alt_muscle in muscle_mapping.get(muscle, []):
                        alt_muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == alt_muscle.lower()]
                        if len(alt_muscle_df) > 0:
                            print(f"  Found {len(alt_muscle_df)} exercises for alternative muscle: {alt_muscle}")
                            muscle_df = alt_muscle_df
                            break
                
                if len(muscle_df) > 0:
                    muscle_exercises[muscle] = muscle_df.sample(n=min(len(muscle_df), 2))["exercise"].tolist()
                else:
                    print(f"No exercises found for muscle group: {muscle} in {key} split")
                    muscle_exercises[muscle] = []
            
            split_exercises = []
            for muscle, exercises in muscle_exercises.items():
                split_exercises.extend(exercises)
            
            workout_plan[key] = split_exercises

    elif split_type == "push_pull_legs":
        for key in ["push", "pull", "legs"]:
            muscle_exercises = {}
            
            for muscle in SPLIT_TYPES["push_pull_legs"][key]:
                muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == muscle.lower()]
                
                if len(muscle_df) == 0 and 'muscle_mapping' in locals():
                    print(f"Using muscle mapping fallback for {muscle} in {key} split")
                    for alt_muscle in muscle_mapping.get(muscle, []):
                        alt_muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == alt_muscle.lower()]
                        if len(alt_muscle_df) > 0:
                            print(f"  Found {len(alt_muscle_df)} exercises for alternative muscle: {alt_muscle}")
                            muscle_df = alt_muscle_df
                            break

                if len(muscle_df) > 0:
                    muscle_exercises[muscle] = muscle_df.sample(n=min(len(muscle_df), 2))["exercise"].tolist()
                else:
                    print(f"No exercises found for muscle group: {muscle} in {key} split")
                    muscle_exercises[muscle] = []
            
            split_exercises = []
            for muscle, exercises in muscle_exercises.items():
                split_exercises.extend(exercises)
            
            workout_plan[key] = split_exercises

    elif split_type == "bro_split":
        for day, muscles in SPLIT_TYPES["bro_split"].items():
            muscle_exercises = {}
            
            for muscle in muscles:
                muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == muscle.lower()]
                
                if len(muscle_df) == 0 and 'muscle_mapping' in locals():
                    print(f"Using muscle mapping fallback for {muscle} in {day}")
                    for alt_muscle in muscle_mapping.get(muscle, []):
                        alt_muscle_df = filtered_df[filtered_df[muscle_column].str.lower() == alt_muscle.lower()]
                        if len(alt_muscle_df) > 0:
                            print(f"  Found {len(alt_muscle_df)} exercises for alternative muscle: {alt_muscle}")
                            muscle_df = alt_muscle_df
                            break
                
                if len(muscle_df) > 0:
                    muscle_exercises[muscle] = muscle_df.sample(n=min(len(muscle_df), 3))["exercise"].tolist()
                else:
                    print(f"No exercises found for muscle group: {muscle} in {day}")
                    muscle_exercises[muscle] = []
            
            day_exercises = []
            for muscle, exercises in muscle_exercises.items():
                day_exercises.extend(exercises)
            
            workout_plan[day] = day_exercises
    
    print("\nFinal workout plan:")
    for category, exercises in workout_plan.items():
        print(f"  {category}: {len(exercises)} exercises")
        if exercises:
            print(f"    Sample: {exercises[:2]}")

    return workout_plan

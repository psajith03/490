from recommend import recommend_exercises, get_popular_exercises

if __name__ == "__main__":
    # Test recommendations
    print("Replacements for 'Bench Press':", recommend_exercises("Bench Press"))
    print("Most popular chest exercises:", get_popular_exercises("Chest"))

import pandas as pd
df = pd.read_csv('workout_fitness_tracker_data.csv')
print(df.head())
print(df.info())
print(df.describe())
print(df.isnull().sum())

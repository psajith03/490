from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from recommend import recommend_exercises, get_popular_exercises
from full_recommendation import generate_full_workout_plan

load_dotenv()
app = Flask(__name__)
CORS(app)

USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = os.getenv("USDA_BASE_URL")

if not USDA_API_KEY or not USDA_BASE_URL:
    raise ValueError("Missing USDA_API_KEY or USDA_BASE_URL in .env file")

SPLIT_TYPES = {
    "total_body": ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
    "upper_lower": {
        "upper": ["Chest", "Back", "Shoulders", "Arms"],
        "lower": ["Legs", "Core"]
    },
    "push_pull_legs": {
        "push": ["Chest", "Shoulders", "Triceps"],
        "pull": ["Back", "Biceps"],
        "legs": ["Legs", "Core"]
    },
    "bro_split": {
        "chest_day": ["Chest"],
        "back_day": ["Back"],
        "shoulder_day": ["Shoulders"],
        "arm_day": ["Biceps", "Triceps"],
        "leg_day": ["Legs"],
        "core_day": ["Core"]
    }
}

NUTRIENT_IDS = {
    "Total Fat": 1004,
    "Saturated Fat": 1258,
    "Trans Fat": 1257,
    "Cholesterol": 1253,
    "Sodium": 1093,
    "Total Carbohydrates": 1005,
    "Dietary Fiber": 1079,
    "Total Sugars": 2000,
    "Added Sugars": 1235,
    "Protein": 1003,
    "Energy": 2048
}

def get_fdc_id(food_query):
    url = f"{USDA_BASE_URL}/foods/search?api_key={USDA_API_KEY}"
    payload = {
        "query": food_query,
        "dataType": ["Foundation", "SR Legacy"],
        "pageSize": 1
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if "foods" in data and data["foods"]:
            return data["foods"][0].get("fdcId")

    return None

def get_nutrition_by_fdc(fdc_id):
    url = f"{USDA_BASE_URL}/foods?fdcIds={fdc_id}&format=full&api_key={USDA_API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            food_item = data[0]
            nutrients = food_item.get("foodNutrients", [])

            macronutrients = {}
            for nutrient in nutrients:
                nutrient_id = nutrient.get("nutrient", {}).get("id")
                amount = nutrient.get("amount", 0)
                unit = nutrient.get("nutrient", {}).get("unitName", "")

                for name, nid in NUTRIENT_IDS.items():
                    if nutrient_id == nid:
                        macronutrients[name] = f"{amount} {unit}"

            return {
                "Food": food_item.get("description", "Unknown"),
                "Nutrients": macronutrients
            }

    return None

@app.route('/recommend', methods=['GET'])
def recommend():
    exercise = request.args.get('exercise', '').lower().strip()
    top_n = int(request.args.get('top_n', 5))

    if not exercise:
        return jsonify({"error": "Missing exercise parameter"}), 400

    recommendations = recommend_exercises(exercise, top_n)
    
    return jsonify({"exercise": exercise, "recommended": recommendations})

@app.route('/popular', methods=['GET'])
def popular():
    muscle = request.args.get('muscle', '').lower().strip()
    top_n = int(request.args.get('top_n', 5))

    if not muscle:
        return jsonify({"error": "Missing muscle group parameter"}), 400

    popular_exercises = get_popular_exercises(muscle, top_n)
    
    return jsonify({"muscle_group": muscle, "popular_exercises": popular_exercises})

@app.route('/full_recommendation', methods=['GET'])
def full_recommendation():
    split_type = request.args.get('split_type', '').lower().strip()
    
    equipment_str = request.args.get('equipment', '').strip()
    exercise_type_str = request.args.get('exercise_type', '').strip()
    equipment_list = [e.strip() for e in equipment_str.split(',')] if equipment_str else []
    exercise_type_list = [t.strip() for t in exercise_type_str.split(',')] if exercise_type_str else []
    
    print(f"Equipment list: {equipment_list}")
    print(f"Exercise type list: {exercise_type_list}")

    if split_type not in SPLIT_TYPES:
        return jsonify({"error": "Invalid split type. Choose from total_body, upper_lower, push_pull_legs, bro_split"}), 400

    plan = generate_full_workout_plan(split_type, equipment_list, exercise_type_list)
    return jsonify({"split_type": split_type, "workout_plan": plan})

@app.route('/get_nutrition', methods=['GET'])
def get_nutrition():
    food_query = request.args.get("food", "").strip()

    if not food_query:
        return jsonify({"error": "No food query provided"}), 400

    fdc_id = get_fdc_id(food_query)
    if not fdc_id:
        return jsonify({"error": "Food item not found"}), 404

    nutrition_data = get_nutrition_by_fdc(fdc_id)
    if not nutrition_data:
        return jsonify({"error": "Failed to fetch nutrition data"}), 500

    return jsonify(nutrition_data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)

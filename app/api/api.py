from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import recommend_exercises, get_popular_exercises
from full_recommendation import generate_full_workout_plan

app = Flask(__name__)
CORS(app)

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

    if split_type not in SPLIT_TYPES:
        return jsonify({"error": "Invalid split type. Choose from total_body, upper_lower, push_pull_legs, bro_split"}), 400

    plan = generate_full_workout_plan(split_type)
    return jsonify({"split_type": split_type, "workout_plan": plan})


if __name__ == '__main__':
    app.run(debug=True, port=5001)

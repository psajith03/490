from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import recommend_exercises, get_popular_exercises

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from React

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

if __name__ == '__main__':
    app.run(debug=True, port=5001)

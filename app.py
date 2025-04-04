from flask import Flask, render_template, request, redirect, url_for, jsonify, session # type: ignore
from flask_cors import CORS # type: ignore
from datetime import datetime
import os
import json

app = Flask(__name__)
app.secret_key = 'fitness_calculator_secret_key'
CORS(app)  # Enable CORS for all routes

# Data storage - in a real application, this would be a database
WORKOUT_DATA_FILE = 'workout_data.json'

MEALS = {
    "veg": [
        {"name": "Lentil Soup", "calories": 150, "protein": 10},
        {"name": "Paneer Tikka", "calories": 250, "protein": 18},
        {"name": "Tofu Stir-Fry", "calories": 180, "protein": 15}
    ],
    "non-veg": [
        {"name": "Grilled Chicken", "calories": 200, "protein": 25},
        {"name": "Salmon Fillet", "calories": 280, "protein": 30}
    ],
    "mixed": [
        {"name": "Chicken & Rice", "calories": 300, "protein": 30},
        {"name": "Paneer & Egg Curry", "calories": 280, "protein": 22}
    ]
}

# Exercise database
EXERCISES = {
    "chest": ["Bench Press", "Push-Ups", "Chest Fly", "Incline Press", "Cable Crossovers"],
    "back": ["Pull-Ups", "Bent-Over Row", "Lat Pulldown", "Deadlift", "Seated Row"],
    "legs": ["Squats", "Lunges", "Leg Press", "Calf Raises", "Leg Curl"],
    "bicep": ["Bicep Curls", "Hammer Curls", "Chin-Ups", "Preacher Curls", "Concentration Curls"],
    "tricep": ["Tricep Dips", "Pushdowns", "Overhead Extension", "Close-Grip Bench", "Skull Crushers"],
    "abs": ["Plank", "Crunches", "Leg Raises", "Russian Twists", "Bicycle Crunches"]
}

def save_workout_data(user_id, data):
    """Save workout data to file"""
    if not os.path.exists(WORKOUT_DATA_FILE):
        with open(WORKOUT_DATA_FILE, 'w') as f:
            json.dump({}, f)
    
    with open(WORKOUT_DATA_FILE, 'r') as f:
        all_data = json.load(f)
    
    all_data[str(user_id)] = data
    
    with open(WORKOUT_DATA_FILE, 'w') as f:
        json.dump(all_data, f)

def load_workout_data(user_id):
    """Load workout data from file"""
    if not os.path.exists(WORKOUT_DATA_FILE):
        return init_workout_data()
    
    with open(WORKOUT_DATA_FILE, 'r') as f:
        all_data = json.load(f)
    
    return all_data.get(str(user_id), init_workout_data())

def init_workout_data():
    """Initialize workout data structure"""
    return {
        'days': {
            'Monday': {'workout': '', 'completed': False},
            'Tuesday': {'workout': '', 'completed': False},
            'Wednesday': {'workout': '', 'completed': False},
            'Thursday': {'workout': '', 'completed': False},
            'Friday': {'workout': '', 'completed': False},
            'Saturday': {'workout': '', 'completed': False},
            'Sunday': {'workout': '', 'completed': False}
        },
        'workout_count': 0,
        'last_updated': datetime.now().strftime('%Y-%m-%d')
    }

@app.route('/api/calculate', methods=['POST'])
def calculate():
    """Calculate fitness metrics based on user input"""
    data = request.get_json()
    weight = float(data['weight'])
    height = float(data['height'])
    age = int(data['age'])
    gender = data['gender']
    activity = float(data['activity'])
    goal = data['goal']
    
    # Convert if needed
    weight_unit = data['weight_unit']
    height_unit = data['height_unit']
    
    if weight_unit == 'lbs':
        weight = weight * 0.453592  # Convert pounds to kg
    
    if height_unit == 'in':
        height = height * 2.54  # Convert inches to cm
    
    # Calculate BMI
    height_m = height / 100  # Convert cm to m
    bmi = weight / (height_m * height_m)
    
    # Calculate BMR using Mifflin-St Jeor Equation
    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Calculate TDEE (Total Daily Energy Expenditure)
    tdee = bmr * activity
    
    # Adjust calories based on goal
    if goal == 'lose':
        calories = tdee - 500  # 500 calorie deficit (about 0.5kg/week)
    elif goal == 'gain':
        calories = tdee + 500  # 500 calorie surplus
    else:  # maintain
        calories = tdee
    
    # Calculate protein needs (g per kg of bodyweight)
    if goal == 'lose':
        protein_factor = 2.0  # Higher protein for weight loss
    elif goal == 'gain':
        protein_factor = 1.8  # High protein for muscle gain
    else:  # maintain
        protein_factor = 1.6  # Moderate protein for maintenance
    
    protein = weight * protein_factor
    
    result = {
        'bmi': round(bmi, 1),
        'bmr': round(bmr),
        'calories': round(calories),
        'protein': round(protein),
        'bmi_category': get_bmi_category(bmi)
    }
    
    return jsonify(result)

def get_bmi_category(bmi):
    """Return BMI category based on value"""
    if bmi<18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    
    else:
        return "Obese"
    

@app.route('/api/meals/<diet_type>', methods=['POST'])
def get_meals(diet_type):
    data = request.get_json()
    target_calories = data.get('calories', 2000)
    target_protein = data.get('protein', 100)
    available_meals = MEALS.get(diet_type, [])
    selected_meals = []
    total_calories = 0
    total_protein = 0

    for meal in available_meals:
        if total_calories < target_calories * 0.9 and total_protein < target_protein * 0.9:
            selected_meals.append(meal)
            total_calories += meal['calories']
            total_protein += meal['protein']

    return jsonify({'meals': selected_meals, 'total_calories': total_calories, 'total_protein': total_protein})

@app.route('/api/exercises/<body_part>')
def get_exercises(body_part):
    available_exercises = EXERCISES.get(body_part, [])
    return jsonify(available_exercises[:5])  # Return up to 5 exercises

@app.route('/api/workout/<user_id>', methods=['GET'])
def get_workout(user_id):
    """Get workout data for user"""
    workout_data = load_workout_data(user_id)
    return jsonify(workout_data)

@app.route('/api/workout/<user_id>', methods=['POST'])
def update_workout(user_id):
    """Update workout data"""
    data = request.get_json()
    workout_data = load_workout_data(user_id)
    
    day = data['day']
    workout_type = data['workout_type']
    completed = data['completed']
    
    workout_data['days'][day]['workout'] = workout_type
    
    # If workout was previously not completed and now is completed, increment counter
    if not workout_data['days'][day]['completed'] and completed:
        workout_data['workout_count'] += 1
    # If workout was previously completed and now is not completed, decrement counter
    elif workout_data['days'][day]['completed'] and not completed:
        workout_data['workout_count'] -= 1
    
    workout_data['days'][day]['completed'] = completed
    workout_data['last_updated'] = datetime.now().strftime('%Y-%m-%d')
    
    save_workout_data(user_id, workout_data)
    
    return jsonify({
        'success': True, 
        'workout_count': workout_data['workout_count']
    })

if __name__ == '__main__':
    app.run(debug=True)


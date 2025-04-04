// Global variable for user ID - in a real app, this would come from authentication
const USER_ID = '1';
const API_URL = 'http://127.0.0.1:5000/api';

// DOM Elements
// Enhanced JavaScript for the improved UI
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.getElementById('calculator-nav').addEventListener('click', function(e) {
        e.preventDefault();
        showCalculator();
    });
    
    document.getElementById('diet-nav').addEventListener('click', function(e) {
        e.preventDefault();
        showDiet();
    });
    
    document.getElementById('tracker-nav').addEventListener('click', function(e) {
        e.preventDefault();
        showTracker();
    });
    
    // Calculator form
    document.getElementById('calculator-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleCalculatorSubmit();
    });
    
    // Init based on hash
    if (window.location.hash === '#tracker') {
        showTracker();
    } else if (window.location.hash === '#diet') {
        showDiet();
    } else {
        showCalculator();
    }
    
    // Initialize workout data
    initWorkoutDays();
});

function showCalculator() {
    document.getElementById('calculator-section').style.display = 'block';
    document.getElementById('diet-section').style.display = 'none';
    document.getElementById('tracker-section').style.display = 'none';
    
    document.getElementById('calculator-nav').classList.add('active');
    document.getElementById('diet-nav').classList.remove('active');
    document.getElementById('tracker-nav').classList.remove('active');
    
    window.location.hash = '';
}

function showDiet() {
    document.getElementById('calculator-section').style.display = 'none';
    document.getElementById('diet-section').style.display = 'block';
    document.getElementById('tracker-section').style.display = 'none';
    
    document.getElementById('calculator-nav').classList.remove('active');
    document.getElementById('diet-nav').classList.add('active');
    document.getElementById('tracker-nav').classList.remove('active');
    
    window.location.hash = 'diet';
}

function showTracker() {
    document.getElementById('calculator-section').style.display = 'none';
    document.getElementById('diet-section').style.display = 'none';
    document.getElementById('tracker-section').style.display = 'block';
    
    document.getElementById('calculator-nav').classList.remove('active');
    document.getElementById('diet-nav').classList.remove('active');
    document.getElementById('tracker-nav').classList.add('active');
    
    window.location.hash = 'tracker';
}

function handleCalculatorSubmit() {
    // Get form values
    const weight = parseFloat(document.getElementById('weight').value);
    const weightUnit = document.getElementById('weight-unit').value;
    const height = parseFloat(document.getElementById('height').value);
    const heightUnit = document.getElementById('height-unit').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;
    
    // Convert units if necessary
    let weightKg = weight;
    if (weightUnit === 'lbs') {
        weightKg = weight * 0.453592;
    }
    
    let heightCm = height;
    if (heightUnit === 'in') {
        heightCm = height * 2.54;
    }
    
    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    
    // Calculate daily calorie needs based on activity level
    let calories = bmr * activity;
    
    // Adjust calories based on goal
    if (goal === 'lose') {
        calories -= 500; // Deficit for weight loss
    } else if (goal === 'gain') {
        calories += 500; // Surplus for weight gain
    }
    
    // Calculate protein needs (g/kg of body weight)
    let protein;
    if (goal === 'lose') {
        protein = weightKg * 2.0; // Higher protein for weight loss
    } else if (goal === 'gain') {
        protein = weightKg * 2.2; // Higher protein for muscle gain
    } else {
        protein = weightKg * 1.6; // Maintenance
    }
    
    // Display results
    document.getElementById('bmi-result').textContent = bmi.toFixed(1);
    document.getElementById('bmr-result').textContent = Math.round(bmr);
    document.getElementById('calorie-result').textContent = Math.round(calories);
    document.getElementById('protein-result').textContent = Math.round(protein);
    
    // Set BMI category and badge
    const bmiCategory = document.getElementById('bmi-category');
    if (bmi < 18.5) {
        bmiCategory.textContent = 'Underweight';
        bmiCategory.className = 'badge badge-underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        bmiCategory.textContent = 'Normal';
        bmiCategory.className = 'badge badge-normal';
    } else if (bmi >= 25 && bmi < 30) {
        bmiCategory.textContent = 'Overweight';
        bmiCategory.className = 'badge badge-overweight';
    } else {
        bmiCategory.textContent = 'Obese';
        bmiCategory.className = 'badge badge-obese';
    }
    
    // Show results
    const results = document.getElementById('results');
    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth' });
    
    // Save values to local storage for use in diet plan
    localStorage.setItem('calories', Math.round(calories));
    localStorage.setItem('protein', Math.round(protein));
}

function loadMeals(dietType) {
    // Set active button
    const buttons = document.querySelectorAll('.btn-category');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Get stored calorie and protein targets
    const calorieTarget = parseInt(localStorage.getItem('calories')) || 2000;
    const proteinTarget = parseInt(localStorage.getItem('protein')) || 150;
    
    // Sample meal data
    const meals = {
        'veg': [
            {
                name: 'Breakfast',
                description: 'Greek Yogurt Parfait with Berries and Granola',
                calories: Math.round(calorieTarget * 0.25),
                protein: Math.round(proteinTarget * 0.25),
                carbs: '40g',
                fat: '15g'
            },
            {
                name: 'Morning Snack',
                description: 'Protein Smoothie with Banana and Almond Milk',
                calories: Math.round(calorieTarget * 0.15),
                protein: Math.round(proteinTarget * 0.15),
                carbs: '25g',
                fat: '5g'
            },
            {
                name: 'Lunch',
                description: 'Quinoa Bowl with Roasted Vegetables and Tofu',
                calories: Math.round(calorieTarget * 0.3),
                protein: Math.round(proteinTarget * 0.3),
                carbs: '45g',
                fat: '18g'
            },
            {
                name: 'Afternoon Snack',
                description: 'Edamame and Mixed Nuts',
                calories: Math.round(calorieTarget * 0.1),
                protein: Math.round(proteinTarget * 0.1),
                carbs: '15g',
                fat: '10g'
            },
            {
                name: 'Dinner',
                description: 'Lentil Curry with Brown Rice and Spinach',
                calories: Math.round(calorieTarget * 0.2),
                protein: Math.round(proteinTarget * 0.2),
                carbs: '40g',
                fat: '12g'
            }
        ],
        'non-veg': [
            {
                name: 'Breakfast',
                description: 'Scrambled Eggs with Spinach and Whole Grain Toast',
                calories: Math.round(calorieTarget * 0.25),
                protein: Math.round(proteinTarget * 0.25),
                carbs: '30g',
                fat: '18g'
            },
            {
                name: 'Morning Snack',
                description: 'Protein Shake with Berries',
                calories: Math.round(calorieTarget * 0.15),
                protein: Math.round(proteinTarget * 0.15),
                carbs: '20g',
                fat: '5g'
            },
            {
                name: 'Lunch',
                description: 'Grilled Chicken Salad with Avocado',
                calories: Math.round(calorieTarget * 0.3),
                protein: Math.round(proteinTarget * 0.3),
                carbs: '25g',
                fat: '20g'
            },
            {
                name: 'Afternoon Snack',
                description: 'Greek Yogurt with Almonds',
                calories: Math.round(calorieTarget * 0.1),
                protein: Math.round(proteinTarget * 0.1),
                carbs: '10g',
                fat: '8g'
            },
            {
                name: 'Dinner',
                description: 'Baked Salmon with Sweet Potato and Broccoli',
                calories: Math.round(calorieTarget * 0.2),
                protein: Math.round(proteinTarget * 0.2),
                carbs: '35g',
                fat: '15g'
            }
        ],
        'mixed': [
            {
                name: 'Breakfast',
                description: 'Protein Oatmeal with Peanut Butter and Banana',
                calories: Math.round(calorieTarget * 0.25),
                protein: Math.round(proteinTarget * 0.25),
                carbs: '45g',
                fat: '15g'
            },
            {
                name: 'Morning Snack',
                description: 'Cottage Cheese with Berries',
                calories: Math.round(calorieTarget * 0.15),
                protein: Math.round(proteinTarget * 0.15),
                carbs: '15g',
                fat: '5g'
            },
            {
                name: 'Lunch',
                description: 'Turkey and Veggie Wrap with Hummus',
                calories: Math.round(calorieTarget * 0.3),
                protein: Math.round(proteinTarget * 0.3),
                carbs: '40g',
                fat: '15g'
            },
            {
                name: 'Afternoon Snack',
                description: 'Protein Bar and Apple',
                calories: Math.round(calorieTarget * 0.1),
                protein: Math.round(proteinTarget * 0.1),
                carbs: '25g',
                fat: '8g'
            },
            {
                name: 'Dinner',
                description: 'Stir-Fried Tofu and Vegetables with Brown Rice',
                calories: Math.round(calorieTarget * 0.2),
                protein: Math.round(proteinTarget * 0.2),
                carbs: '35g',
                fat: '12g'
            }
        ]
    };
    
    // Get the selected meal set
    const selectedMeals = meals[dietType];
    
    // Generate meal cards HTML
    let mealCardsHTML = '';
    let totalCalories = 0;
    let totalProtein = 0;
    
    selectedMeals.forEach(meal => {
        totalCalories += meal.calories;
        totalProtein += meal.protein;
        
        mealCardsHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="meal-card">
                    <div class="meal-card-header">
                        <h5 class="mb-0">${meal.name}</h5>
                    </div>
                    <div class="meal-card-body">
                        <p class="mb-2">${meal.description}</p>
                        <div class="meal-nutrition">
                            <span><i class="fas fa-fire-alt"></i> ${meal.calories} cal</span>
                            <span><i class="fas fa-drumstick-bite"></i> ${meal.protein}g</span>
                        </div>
                    </div>
                    <div class="meal-card-footer">
                        <span><i class="fas fa-bread-slice"></i> Carbs: ${meal.carbs}</span>
                        <span><i class="fas fa-oil-can"></i> Fat: ${meal.fat}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Update HTML and show results
    document.getElementById('meal-cards-container').innerHTML = mealCardsHTML;
    document.getElementById('total-calories').textContent = totalCalories;
    document.getElementById('total-protein').textContent = totalProtein;
    document.getElementById('diet-results').style.display = 'block';
}

// Workout tracker functions
function initWorkoutDays() {
    // Initialize workout days table
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let workoutRows = '';
    
    // Load saved workouts from local storage or use empty template
    let savedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    // If there are no saved workouts, create an empty template
    if (savedWorkouts.length === 0) {
        savedWorkouts = daysOfWeek.map(day => ({
            day: day,
            workout: '',
            completed: false
        }));
    }
    
    // Generate table rows
    savedWorkouts.forEach((workout, index) => {
        workoutRows += `
            <tr ${workout.completed ? 'class="completed-day"' : ''}>
                <td>${workout.day}</td>
                <td>${workout.workout || 'Rest day - click Generate Workout to add'}</td>
                <td class="text-center">
                    <div class="form-check d-flex justify-content-center">
                        <input class="form-check-input" type="checkbox" ${workout.completed ? 'checked' : ''} 
                            onchange="updateWorkoutCompletion(${index}, this.checked)">
                    </div>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('workout-table-body').innerHTML = workoutRows;
    updateWorkoutProgress();
    
    // Save workouts button event
    document.getElementById('save-workouts').addEventListener('click', function() {
        localStorage.setItem('workouts', JSON.stringify(savedWorkouts));
        alert('Your workout plan has been saved!');
    });
}

function updateWorkoutCompletion(index, completed) {
    // Get saved workouts
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    // If workouts array is empty, initialize it
    if (workouts.length === 0) {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        workouts = daysOfWeek.map(day => ({
            day: day,
            workout: '',
            completed: false
        }));
    }
    
    // Update completed status
    workouts[index].completed = completed;
    
    // Update row styling
    const rows = document.getElementById('workout-table-body').querySelectorAll('tr');
    if (completed) {
        rows[index].classList.add('completed-day');
    } else {
        rows[index].classList.remove('completed-day');
    }
    
    // Save to local storage
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    // Update progress
    updateWorkoutProgress();
}

function updateWorkoutProgress() {
    // Get saved workouts
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    // Count completed workouts
    const completedCount = workouts.filter(workout => workout.completed).length;
    const totalCount = workouts.length;
    const progressPercentage = (completedCount / totalCount) * 100;
    
    // Update progress bar and counter
    document.getElementById('workout-counter').textContent = `${completedCount}/${totalCount}`;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.round(progressPercentage)}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
}

function generateWorkout() {
    const bodyPart = document.getElementById('body-part').value;
    
    // Workout templates based on body part
    const workoutTemplates = {
        'chest': [
            '4 sets x 8-12 reps Bench Press',
            '3 sets x 10-15 reps Incline Dumbbell Press',
            '3 sets x 12-15 reps Chest Flyes',
            '3 sets x 15-20 reps Push-ups'
        ].join('<br>'),
        'back': [
            '4 sets x 8-12 reps Pull-ups/Lat Pulldowns',
            '3 sets x 10-12 reps Bent-over Rows',
            '3 sets x 12-15 reps Seated Cable Rows',
            '3 sets x 15-20 reps Superman Exercises'
        ].join('<br>'),
        'legs': [
            '4 sets x 8-12 reps Squats',
            '3 sets x 10-12 reps Leg Press',
            '3 sets x 12-15 reps Lunges',
            '3 sets x 15-20 reps Leg Extensions',
            '3 sets x 15-20 reps Leg Curls'
        ].join('<br>'),
        'bicep': [
            '4 sets x 8-12 reps Barbell Curls',
            '3 sets x 10-12 reps Hammer Curls',
            '3 sets x 12-15 reps Concentration Curls',
            '3 sets x 15-20 reps Cable Curls'
        ].join('<br>'),
        'tricep': [
            '4 sets x 8-12 reps Tricep Dips',
            '3 sets x 10-12 reps Skull Crushers',
            '3 sets x 12-15 reps Tricep Pushdowns',
            '3 sets x 15-20 reps Overhead Tricep Extensions'
        ].join('<br>'),
        'abs': [
            '3 sets x 15-20 reps Crunches',
            '3 sets x 30-60 seconds Planks',
            '3 sets x 15-20 reps Russian Twists',
            '3 sets x 15-20 reps Leg Raises'
        ].join('<br>')
    };
    
    // Get the workout template for selected body part
    const workout = `<strong>${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Workout:</strong><br>${workoutTemplates[bodyPart]}`;
    
    // Show dialog to select day
    const dayIndex = prompt(`Which day would you like to add this ${bodyPart} workout to? (Enter 1-7 for Monday-Sunday)`);
    
    if (dayIndex && !isNaN(dayIndex) && dayIndex >= 1 && dayIndex <= 7) {
        // Get saved workouts
        let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
        
        // If workouts array is empty, initialize it
        if (workouts.length === 0) {
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            workouts = daysOfWeek.map(day => ({
                day: day,
                workout: '',
                completed: false
            }));
        }
        
        // Update workout for selected day
        workouts[dayIndex - 1].workout = workout;
        
        // Save to local storage
        localStorage.setItem('workouts', JSON.stringify(workouts));
        
        // Refresh the table
        initWorkoutDays();
        
        alert(`${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} workout added to ${workouts[dayIndex - 1].day}!`);
    } else if (dayIndex) {
        alert('Please enter a valid day number (1-7).');
    }
}
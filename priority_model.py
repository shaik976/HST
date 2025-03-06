from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression
import pickle

class TaskPrioritizer:
    def __init__(self):
        # Define weights for subjects (modify as needed)
        self.subject_weights = {
            'math': 1.5,      # Higher weight for math
            'science': 1.3,   # Medium weight for science
            'history': 1.1,   # Lower weight for history
            'default': 1.0    # Default weight for other subjects
        }

        # Initialize a simple linear regression model for AI-based prioritization
        self.model = LinearRegression()

        # Train the model with example data (replace with real data)
        self.train_model()

    def train_model(self):
        """
        Train the AI model using example data.
        Replace this with real historical data for better results.
        """
        # Example training data
        X_train = np.array([
            [5, 2, 1.5],  # Days until due: 5, Duration: 2 hours, Subject weight: 1.5 (Math)
            [10, 1, 1.3], # Days until due: 10, Duration: 1 hour, Subject weight: 1.3 (Science)
            [3, 3, 1.1],  # Days until due: 3, Duration: 3 hours, Subject weight: 1.1 (History)
        ])
        y_train = np.array([0.9, 0.7, 0.6])  # User-defined priority scores

        # Train the model
        self.model.fit(X_train, y_train)

        # Save the model to a file (optional)
        with open('priority_model.pkl', 'wb') as model_file:
            pickle.dump(self.model, model_file)

    def calculate_priority(self, session):
        """
        Calculate the priority score for a session using AI.
        Priority is based on:
        1. Days until the session date (urgency)
        2. Duration of the session (shorter sessions are prioritized)
        3. Subject weight (importance of the subject)
        """
        try:
            # Calculate days until the session date
            due_date = datetime.strptime(session['date'], '%Y-%m-%d')
            days_until_due = (due_date - datetime.now()).days
            
            # Calculate duration in hours
            time_from = datetime.strptime(session['timeFrom'], '%H:%M')
            time_to = datetime.strptime(session['timeTo'], '%H:%M')
            duration = (time_to - time_from).seconds / 3600  # Convert seconds to hours
            
            # Get subject weight (default to 1.0 if subject not found)
            subject = session['subject'].lower()
            subject_weight = self.subject_weights.get(subject, self.subject_weights['default'])
            
            # Prepare features for the AI model
            features = np.array([[days_until_due, duration, subject_weight]])
            
            # Predict priority using the AI model
            priority_score = self.model.predict(features)[0]
            
            return priority_score
        except Exception as e:
            print(f"Error calculating priority: {e}")
            return None

    def prioritize_tasks(self, sessions):
        """
        Prioritize a list of sessions based on their AI-calculated priority scores.
        """
        try:
            # Calculate priority for each session
            for session in sessions:
                session['priority'] = self.calculate_priority(session)
            
            # Sort sessions by priority (highest first)
            return sorted(sessions, key=lambda x: x['priority'], reverse=True)
        except Exception as e:
            print(f"Error prioritizing tasks: {e}")
            return sessions
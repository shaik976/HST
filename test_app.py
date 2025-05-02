import pytest
from app import app
from priority_model import PriorityModel
import json
import os

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_session():
    return {
        'subject': 'Math',
        'date': '2024-04-25',
        'startTime': '14:00',
        'duration': 60,
        'description': 'Study calculus'
    }

def test_add_session(client, sample_session):
    response = client.post('/add-session', json=sample_session)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Session added successfully'

def test_get_sessions(client):
    response = client.get('/get-sessions')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_delete_session(client, sample_session):
    # First add a session
    client.post('/add-session', json=sample_session)
    
    # Then delete it
    response = client.post('/delete-session', json={'index': 0})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Session deleted successfully'

def test_prioritize_tasks(client, sample_session):
    # Add a session
    client.post('/add-session', json=sample_session)
    
    # Get prioritized tasks
    response = client.get('/prioritize-tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    if data:
        assert 'priority' in data[0]

def test_invalid_session(client):
    invalid_session = {
        'subject': 'Math',
        'date': 'invalid-date',
        'startTime': 'invalid-time',
        'duration': -1
    }
    response = client.post('/add-session', json=invalid_session)
    assert response.status_code == 400

def test_priority_model():
    model = PriorityModel()
    session = {
        'subject': 'Math',
        'date': '2024-04-25',
        'startTime': '14:00',
        'duration': 60,
        'description': 'Study calculus'
    }
    priority = model.calculate_priority(session)
    assert 0 <= priority <= 1

def test_model_retraining():
    model = PriorityModel()
    sessions = [
        {
            'subject': 'Math',
            'date': '2024-04-25',
            'startTime': '14:00',
            'duration': 60,
            'description': 'Study calculus',
            'priority': 0.8
        },
        {
            'subject': 'Science',
            'date': '2024-04-26',
            'startTime': '15:00',
            'duration': 90,
            'description': 'Study physics',
            'priority': 0.6
        }
    ]
    success = model.retrain_model(sessions)
    assert success is True

def test_rate_limiting(client):
    # Make multiple requests quickly
    for _ in range(101):  # Assuming rate limit is 100
        client.get('/get-sessions')
    
    # The next request should be rate limited
    response = client.get('/get-sessions')
    assert response.status_code == 429 
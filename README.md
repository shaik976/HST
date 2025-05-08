# Smart Study Scheduler

A web application that helps students manage their study sessions using AI-powered task prioritization.

## Features

- Create and manage study sessions
- AI-powered task prioritization
- Email reminders
- Responsive web interface
- Session tracking and analytics

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-study-scheduler.git
cd smart-study-scheduler
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration settings.

## Configuration

The application can be configured using environment variables in the `.env` file:

- `FLASK_DEBUG`: Enable/disable debug mode
- `FLASK_HOST`: Host to run the application on
- `FLASK_PORT`: Port to run the application on
- `SMTP_SERVER`: SMTP server for email notifications
- `SMTP_PORT`: SMTP port for email notifications
- `SENDER_EMAIL`: Email address for sending notifications
- `SENDER_PASSWORD`: Password for the sender email
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `LOG_FILE`: Path to the log file
- `RATE_LIMIT`: Maximum number of requests per time window
- `RATE_LIMIT_WINDOW`: Time window for rate limiting in seconds

## Usage

1. Start the application:
```bash
python app.py
```

2. Open your browser and navigate to `http://localhost:5000`

3. Create study sessions by filling out the form

4. View and manage your sessions in the dashboard

5. Receive email reminders for upcoming sessions

## Development

### Code Style

The project uses:
- Black for code formatting
- Flake8 for linting
- MyPy for type checking

Run the following commands to ensure code quality:
```bash
black .
flake8
mypy .
```

### Testing

Run tests using pytest:
```bash
pytest
```

### Documentation

The application is documented using docstrings. Generate documentation using:
```bash
pdoc --html .
```

## Security

- Input validation and sanitization
- Rate limiting
- Secure email handling
- Error handling and logging
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flask for the web framework
- scikit-learn for the AI model
- All contributors and users

## Dashboard Task Statistics

- **Tasks Completed:** Increments when you click the Done button for a session. Tracked persistently in `session_stats.json`.
- **Tasks Deleted:** Increments when you click the Delete button for a session. Tracked persistently in `session_stats.json`.
- **Tasks Ignored:** Counts sessions whose date is in the past and are neither completed nor deleted.

The file `session_stats.json` is automatically created and updated to store hashes of completed and deleted sessions, ensuring your stats persist even if the server restarts.
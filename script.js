document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('schedule-form');

    // Function to show error or success messages
    function showMessage(message, isError = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isError ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Remove the message after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Function to show the loading spinner
    function showSpinner() {
        document.getElementById('loading-spinner').style.display = 'block';
    }

    // Function to hide the loading spinner
    function hideSpinner() {
        document.getElementById('loading-spinner').style.display = 'none';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevents default form submission

        // Get form data
        const subject = document.getElementById('subject').value;
        const date = document.getElementById('date').value;
        const timeFrom = document.getElementById('timeFrom').value;
        const timeTo = document.getElementById('timeTo').value;

        // Validate time range
        if (timeFrom >= timeTo) {
            showMessage('End time must be after start time.');
            return;
        }

        // Prepare session data
        const sessionData = { subject, date, timeFrom, timeTo };

        showSpinner(); // Show spinner before the API call

        try {
            // Send session data to the backend
            const response = await fetch('http://127.0.0.1:5000/add-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });

            if (!response.ok) throw new Error('Failed to add session');

            // Show success message and redirect after 1 second
            showMessage('Session added successfully! Redirecting...', false);
            setTimeout(() => {
                window.location.href = "sessions.html";
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to add session. Please try again.');
        } finally {
            hideSpinner(); // Hide spinner after the API call (whether it succeeds or fails)
        }
    });
});
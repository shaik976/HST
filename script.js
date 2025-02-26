document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('schedule-form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevents default form submission

        const subject = document.getElementById('subject').value;
        const date = document.getElementById('date').value;
        const timeFrom = document.getElementById('timeFrom').value;
        const timeTo = document.getElementById('timeTo').value;

        const sessionData = { subject, date, timeFrom, timeTo };

        try {
            const response = await fetch('http://127.0.0.1:5000/add-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData),
            });

            if (!response.ok) throw new Error('Failed to add session');

            window.location.href = "sessions.html"; // Redirect after successful submission
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
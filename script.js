document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('schedule-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevents default form submission

        const subject = document.getElementById('subject').value;
        const date = document.getElementById('date').value;
        const timeFrom = document.getElementById('timeFrom').value;
        const timeTo = document.getElementById('timeTo').value;

        let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

        // Add new session
        sessions.push({ subject, date, timeFrom, timeTo });

        // Save to localStorage
        localStorage.setItem('sessions', JSON.stringify(sessions));

        // Wait for storage to update, then redirect
        setTimeout(() => {
            window.location.href = "sessions.html";
        }, 100); // Small delay ensures data is saved before redirecting
    });
});


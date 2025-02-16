document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('schedule-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const subject = document.getElementById('subject').value;
        const date = document.getElementById('date').value;
        const timeFrom = document.getElementById('timeFrom').value;
        const timeTo = document.getElementById('timeTo').value;

        // Create session object
        const session = {
            subject,
            date,
            timeFrom,
            timeTo
        };

        // Retrieve existing sessions from localStorage
        let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        sessions.push(session);
        localStorage.setItem('sessions', JSON.stringify(sessions));

        // Redirect to the View Sessions page
        window.location.href = '/sessions';
    });
});

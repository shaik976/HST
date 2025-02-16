document.addEventListener('DOMContentLoaded', function () {
    const sessionsList = document.getElementById('sessions-list');

    // Retrieve sessions from localStorage
    let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

    if (sessions.length === 0) {
        sessionsList.innerHTML = '<li>No scheduled sessions found.</li>';
    } else {
        sessions.forEach(session => {
            const li = document.createElement('li');
            li.textContent = `${session.subject} - ${session.date} | ${session.timeFrom} to ${session.timeTo}`;
            sessionsList.appendChild(li);
        });
    }
});

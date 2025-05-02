document.addEventListener('DOMContentLoaded', function() {
    // Display current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', options);

    // Get today's classes
    fetch('/get-timetable')
        .then(response => response.json())
        .then(data => {
            const todayClasses = getTodayClasses(data, currentDate);
            displayClasses(todayClasses);
        })
        .catch(error => {
            console.error('Error fetching timetable:', error);
            document.getElementById('today-classes').innerHTML = '<p class="error">Error loading classes. Please try again later.</p>';
        });
});

function getTodayClasses(timetable, currentDate) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[currentDate.getDay()];
    
    // Find today's schedule
    const todaySchedule = timetable.find(day => day.day === today);
    if (!todaySchedule) {
        return [];
    }

    return todaySchedule.classes || [];
}

function displayClasses(classes) {
    const container = document.getElementById('today-classes');
    
    if (classes.length === 0) {
        container.innerHTML = '<p class="no-classes">No classes scheduled for today.</p>';
        return;
    }

    const classesHTML = classes.map(classItem => `
        <div class="class-card">
            <div class="class-time">${classItem.time}</div>
            <div class="class-details">
                <h3>${classItem.subject}</h3>
                <p>${classItem.teacher || 'No teacher assigned'}</p>
                <p>${classItem.room || 'No room assigned'}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = classesHTML;
} 
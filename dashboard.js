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

    loadDashboardStats();
    setInterval(loadDashboardStats, 5000); // Refresh every 5 seconds
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

function loadDashboardStats() {
    fetch('/get-dashboard-stats')
        .then(response => response.json())
        .then(data => {
            updateStats(data);
            updateChart(data);
            updateScore(data);
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
            showError('Failed to load dashboard statistics');
        });
}

function updateStats(data) {
    document.getElementById('completed-tasks').textContent = data.completed;
    document.getElementById('deleted-tasks').textContent = data.deleted;
    document.getElementById('ignored-tasks').textContent = data.ignored;

    const total = data.completed + data.deleted + data.ignored;
    if (total > 0) {
        document.getElementById('completed-percentage').textContent = 
            `${Math.round((data.completed / total) * 100)}%`;
        document.getElementById('deleted-percentage').textContent = 
            `${Math.round((data.deleted / total) * 100)}%`;
        document.getElementById('ignored-percentage').textContent = 
            `${Math.round((data.ignored / total) * 100)}%`;
    }
}

function updateChart(data) {
    const ctx = document.getElementById('taskDistributionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.taskChart) {
        window.taskChart.destroy();
    }

    window.taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Deleted', 'Ignored'],
            datasets: [{
                data: [data.completed, data.deleted, data.ignored],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',  // Green for completed
                    'rgba(231, 76, 60, 0.8)',   // Red for deleted
                    'rgba(241, 196, 15, 0.8)'   // Yellow for ignored
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(231, 76, 60, 1)',
                    'rgba(241, 196, 15, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ecf0f1',
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function updateScore(data) {
    const total = data.completed + data.deleted + data.ignored;
    let score = 0;
    let description = '';

    if (total > 0) {
        // Calculate score based on completed tasks (70% weight) and deleted tasks (30% weight)
        // Ignored tasks negatively impact the score
        const completionRate = data.completed / total;
        const deletionRate = data.deleted / total;
        const ignoreRate = data.ignored / total;

        score = Math.round((completionRate * 0.7 + deletionRate * 0.3 - ignoreRate * 0.2) * 100);
        score = Math.max(0, Math.min(100, score)); // Ensure score is between 0 and 100
    }

    // Set score description based on value
    if (score >= 90) {
        description = 'Outstanding! Keep up the excellent work!';
    } else if (score >= 70) {
        description = 'Great progress! You\'re doing well!';
    } else if (score >= 50) {
        description = 'Good effort! Keep pushing forward!';
    } else if (score >= 30) {
        description = 'You\'re getting there! Keep trying!';
    } else {
        description = 'Every small step counts. You can do it!';
    }

    document.getElementById('user-score').textContent = score;
    document.getElementById('score-description').textContent = description;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
} 
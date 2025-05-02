document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('sessionForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    let timetableData = null;

    // Add loading state management
    let isLoading = false;

    // Function to show error or success messages
    function showMessage(message, isError = true) {
        const messageDiv = document.getElementById(isError ? 'errorMessage' : 'successMessage');
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        // Hide the message after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // Function to show the loading spinner
    function showSpinner() {
        loadingSpinner.style.display = 'block';
    }

    // Function to hide the loading spinner
    function hideSpinner() {
        loadingSpinner.style.display = 'none';
    }

    // Function to validate form data
    function validateFormData(data) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const selectedDate = new Date(data.date);
        selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day
        
        // Validate date is not in the past
        if (selectedDate < currentDate) {
            return { isValid: false, message: 'Date cannot be in the past' };
        }
        
        // Validate duration
        if (data.duration <= 0) {
            return { isValid: false, message: 'Duration must be positive' };
        }
        
        // Validate subject
        if (!data.subject.trim()) {
            return { isValid: false, message: 'Subject cannot be empty' };
        }
        
        return { isValid: true, message: 'Valid data' };
    }

    // Function to get priority class based on priority value
    function getPriorityClass(priority) {
        if (priority >= 0.9) return 'high';
        if (priority >= 0.4) return 'medium';
        return 'low';
    }

    // Function to get priority text based on priority value
    function getPriorityText(priority) {
        if (priority >= 0.9) return 'High Priority';
        if (priority >= 0.4) return 'Medium Priority';
        return 'Low Priority';
    }

    // Function to load timetable data
    async function loadTimetableData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/get-timetable');
            const data = await response.json();
            timetableData = processTimetableData(data);
            updateCurrentPeriod();
        } catch (error) {
            console.error('Error loading timetable:', error);
        }
    }

    // Function to process timetable data into the required format
    function processTimetableData(data) {
        const processedData = new Array(7).fill(null);  // 0-6 for Sunday-Saturday
        
        // Convert the flat timetable data into a structured format by day
        data.forEach(entry => {
            const day = getDayIndex(entry.day);
            if (!processedData[day]) {
                processedData[day] = [];
            }
            
            const [startTime, endTime] = entry.time.split(' - ').map(time => convertTo24Hour(time.trim()));
            
            processedData[day].push({
                subject: entry.subject,
                startTime,
                endTime
            });
        });

        // Sort periods by start time for each day
        processedData.forEach(day => {
            if (day) {
                day.sort((a, b) => {
                    return convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime);
                });
            }
        });

        return processedData;
    }

    // Helper function to convert 12-hour format to 24-hour format
    function convertTo24Hour(time) {
        const [hours, minutes] = time.split(':').map(Number);
        if (hours < 9) {  // Assuming all afternoon times are less than 9
            return `${hours + 12}:${minutes.toString().padStart(2, '0')}`;
        }
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    // Helper function to convert day name to index
    function getDayIndex(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(day);
    }

    // Helper function to convert time string to minutes since midnight
    function convertTimeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Function to add a session
    window.addSession = async function() {
        // Get form data
        const formData = {
            subject: document.getElementById('subject').value.trim(),
            date: document.getElementById('date').value,
            startTime: document.getElementById('startTime').value,
            duration: parseInt(document.getElementById('duration').value),
            description: document.getElementById('description').value.trim()
        };

        // Validate form data
        const validation = validateFormData(formData);
        if (!validation.isValid) {
            showMessage(validation.message);
            return;
        }

        showSpinner();

        try {
            const response = await fetch('http://127.0.0.1:5000/add-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add session');
            }

            showMessage('Session added and prioritized successfully!', false);
            
            // Reset form
            form.reset();
            
            // Only refresh sessions list if we're on the sessions page
            if (window.location.pathname.includes('sessions.html')) {
                loadSessions();
            }

        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message || 'Failed to add session. Please try again.');
        } finally {
            hideSpinner();
        }
    };

    // Function to load sessions
    window.loadSessions = async function() {
        // Only load sessions if we're on the sessions page
        if (!window.location.pathname.includes('sessions.html')) {
            return;
        }

        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/get-sessions');
            const sessions = await response.json();
            
            const sessionsList = document.getElementById('sessionsList');
            sessionsList.innerHTML = '';
            
            if (sessions.length === 0) {
                sessionsList.innerHTML = '<p class="no-sessions">No sessions found</p>';
                return;
            }
            
            sessions.forEach((session, index) => {
                const priorityClass = getPriorityClass(session.priority);
                const priorityText = getPriorityText(session.priority);
                
                const sessionDiv = document.createElement('div');
                sessionDiv.className = `session-item ${priorityClass}`;
                sessionDiv.innerHTML = `
                    <div class="session-header">
                        <h3>${session.subject}</h3>
                        <span class="priority-badge ${priorityClass}">${priorityText}</span>
                    </div>
                    <div class="session-details">
                        <p><strong>Date:</strong> ${session.date}</p>
                        <p><strong>Time:</strong> ${session.startTime}</p>
                        <p><strong>Duration:</strong> ${session.duration} minutes</p>
                        <p><strong>Description:</strong> ${session.description}</p>
                        <p><strong>Priority Score:</strong> ${(session.priority * 100).toFixed(1)}%</p>
                    </div>
                    <button class="delete-btn" onclick="deleteSession(${index})">Delete</button>
                `;
                sessionsList.appendChild(sessionDiv);
            });
        } catch (error) {
            console.error('Error:', error);
            showMessage('Failed to load sessions. Please try again.');
        } finally {
            hideSpinner();
        }
    };

    // Function to delete a session
    window.deleteSession = async function(index) {
        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/delete-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ index })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete session');
            }

            showMessage('Session deleted successfully!', false);
            loadSessions();
        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message || 'Failed to delete session. Please try again.');
        } finally {
            hideSpinner();
        }
    };

    // Function to send reminder
    window.sendReminder = async function() {
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showMessage('Please enter an email address');
            return;
        }

        showSpinner();
        try {
            const response = await fetch('http://127.0.0.1:5000/send-reminder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reminder');
            }

            showMessage('Reminder sent successfully!', false);
            document.getElementById('email').value = '';
        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message || 'Failed to send reminder. Please try again.');
        } finally {
            hideSpinner();
        }
    };

    // Only load sessions if we're on the sessions page
    if (window.location.pathname.includes('sessions.html')) {
        loadSessions();
    }

    function updateCurrentPeriod() {
        if (!timetableData) {
            const currentPeriodElement = document.getElementById('currentPeriod');
            if (currentPeriodElement) {
                currentPeriodElement.textContent = 'Loading timetable...';
                currentPeriodElement.className = 'no-class';
            }
            return;
        }

        const now = new Date();
        const currentTime = now.toLocaleTimeString();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const currentTimeElement = document.getElementById('currentTime');
        if (currentTimeElement) {
            currentTimeElement.textContent = `Current Time: ${currentTime}`;
        }

        // Convert current time to minutes since midnight
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Get the timetable for the current day
        const dayTimetable = timetableData[currentDay];
        const currentPeriodElement = document.getElementById('currentPeriod');

        if (!dayTimetable || dayTimetable.length === 0) {
            if (currentPeriodElement) {
                currentPeriodElement.textContent = 'No Classes Today';
                currentPeriodElement.className = 'no-class';
            }
            return;
        }

        // Find current period
        let currentPeriod = null;
        let nextPeriod = null;

        for (let i = 0; i < dayTimetable.length; i++) {
            const period = dayTimetable[i];
            const startTimeInMinutes = convertTimeToMinutes(period.startTime);
            const endTimeInMinutes = convertTimeToMinutes(period.endTime);

            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                currentPeriod = period;
                nextPeriod = dayTimetable[i + 1] || null;
                break;
            }

            // Check if we're in a break between this period and the next
            if (i < dayTimetable.length - 1) {
                const nextPeriodStart = convertTimeToMinutes(dayTimetable[i + 1].startTime);
                if (currentTimeInMinutes >= endTimeInMinutes && currentTimeInMinutes < nextPeriodStart) {
                    const breakTimeLeft = getTimeLeft(dayTimetable[i + 1].startTime);
                    if (currentPeriodElement) {
                        currentPeriodElement.textContent = `Break Time (${breakTimeLeft} until ${dayTimetable[i + 1].subject})`;
                        currentPeriodElement.className = 'break';
                    }
                    return;
                }
            }
        }

        if (currentPeriodElement) {
            if (currentPeriod) {
                const timeLeft = getTimeLeft(currentPeriod.endTime);
                let displayText = `Current Period: ${currentPeriod.subject} (${timeLeft} left)`;
                
                if (nextPeriod) {
                    displayText += ` | Next: ${nextPeriod.subject} at ${nextPeriod.startTime}`;
                }
                
                currentPeriodElement.textContent = displayText;
                currentPeriodElement.className = 'active';
            } else {
                // Check if before first class or after last class
                const firstClass = dayTimetable[0];
                const lastClass = dayTimetable[dayTimetable.length - 1];
                
                if (currentTimeInMinutes < convertTimeToMinutes(firstClass.startTime)) {
                    const timeUntilStart = getTimeLeft(firstClass.startTime);
                    currentPeriodElement.textContent = `Classes start in ${timeUntilStart} (First class: ${firstClass.subject})`;
                    currentPeriodElement.className = 'no-class';
                } else if (currentTimeInMinutes >= convertTimeToMinutes(lastClass.endTime)) {
                    currentPeriodElement.textContent = 'Classes have ended for today';
                    currentPeriodElement.className = 'no-class';
                }
            }
        }
    }

    function getTimeLeft(endTime) {
        const now = new Date();
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);
        
        const diff = end - now;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    // Load timetable data and start updates
    loadTimetableData();
    setInterval(updateCurrentPeriod, 60000);
});
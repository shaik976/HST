document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton");
    const inputs = document.querySelectorAll("input[type='text']");
    let isEditMode = true;  // Track if we're in edit mode
    let savedTimetableData = null;  // Store the timetable data

    // Time slots configuration
    const timeSlots = [
        { start: "09:20", end: "10:10", index: 1 },
        { start: "10:10", end: "11:00", index: 2 },
        { start: "11:00", end: "11:50", index: 3 },
        { start: "11:50", end: "12:40", index: 4 },
        { start: "13:30", end: "14:20", index: 5 },
        { start: "14:20", end: "15:10", index: 6 },
        { start: "15:10", end: "15:50", index: 7 }
    ];

    // Function to convert time string to minutes since midnight
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Function to update current time
    function updateCurrentTime() {
        const currentTimeElement = document.getElementById('currentTime');
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        currentTimeElement.textContent = timeString;
    }

    // Function to get current period
    function getCurrentPeriod() {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // If it's Sunday
        if (currentDay === 0) {
            return { status: 'no-class', text: 'Sunday - No Classes' };
        }

        // Convert time slots to minutes for comparison
        const periodSlots = timeSlots.map(slot => ({
            start: timeToMinutes(slot.start),
            end: timeToMinutes(slot.end),
            index: slot.index
        }));

        // Find current period
        for (const slot of periodSlots) {
            if (currentTimeInMinutes >= slot.start && currentTimeInMinutes < slot.end) {
                if (!savedTimetableData) {
                    return { status: 'loading', text: 'Loading timetable...' };
                }

                // Find the current subject from saved timetable data
                const currentDayData = savedTimetableData.filter(entry => 
                    entry.day === getDayName(currentDay) && 
                    entry.time.startsWith(timeSlots[slot.index - 1].start)
                );

                if (currentDayData.length > 0) {
                    const subject = currentDayData[0].subject;
                    const timeLeft = getTimeLeft(timeSlots[slot.index - 1].end);
                    return { 
                        status: 'active', 
                        text: `Current Period: ${subject} (${timeLeft} left)` 
                    };
                }
            }
        }

        // Check for break times between periods
        for (let i = 0; i < periodSlots.length - 1; i++) {
            if (currentTimeInMinutes >= periodSlots[i].end && currentTimeInMinutes < periodSlots[i + 1].start) {
                const nextPeriodData = savedTimetableData?.filter(entry => 
                    entry.day === getDayName(currentDay) && 
                    entry.time.startsWith(timeSlots[i + 1].start)
                );
                
                const nextSubject = nextPeriodData?.[0]?.subject || 'next class';
                const timeToNext = getTimeLeft(timeSlots[i + 1].start);
                return { 
                    status: 'break', 
                    text: `Break Time (${timeToNext} until ${nextSubject})` 
                };
            }
        }

        // Before first class
        if (currentTimeInMinutes < periodSlots[0].start) {
            const timeToStart = getTimeLeft(timeSlots[0].start);
            return { 
                status: 'no-class', 
                text: `Classes start in ${timeToStart}` 
            };
        }

        // After last class
        if (currentTimeInMinutes >= periodSlots[periodSlots.length - 1].end) {
            return { 
                status: 'no-class', 
                text: 'Classes have ended for today' 
            };
        }

        return { status: 'no-class', text: 'No class scheduled' };
    }

    // Helper function to get day name
    function getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }

    // Function to calculate time left
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

    // Function to update current period display
    function updateCurrentPeriod() {
        const currentPeriodElement = document.getElementById('currentPeriod');
        const { status, text } = getCurrentPeriod();
        
        // Remove all existing status classes
        currentPeriodElement.classList.remove('active', 'break', 'no-class');
        // Add the current status class
        currentPeriodElement.classList.add(status);
        
        currentPeriodElement.textContent = text;
    }

    // Function to toggle between edit and view modes
    function toggleEditMode() {
        isEditMode = !isEditMode;
        
        // Update button text and class
        saveButton.textContent = isEditMode ? 'Save Timetable' : 'Edit Timetable';
        saveButton.className = isEditMode ? 'save-button' : 'edit-button';

        // Toggle input editability and appearance
        inputs.forEach(input => {
            if (!isEditMode) {
                // Convert input to span when saving
                const value = input.value.trim();
                const span = document.createElement('span');
                span.className = 'subject-text';
                span.textContent = value || '-';
                input.parentElement.appendChild(span);
                input.style.display = 'none';
            } else {
                // Show inputs and remove spans when editing
                input.style.display = 'block';
                const span = input.parentElement.querySelector('.subject-text');
                if (span) {
                    span.remove();
                }
            }
        });

        // Save edit state to localStorage
        localStorage.setItem('timetableEditMode', JSON.stringify(!isEditMode));
    }

    // Load saved timetable data from local storage
    function loadTimetable() {
        // Load edit mode state
        const savedEditMode = localStorage.getItem('timetableEditMode');
        if (savedEditMode !== null) {
            isEditMode = !JSON.parse(savedEditMode);
            if (!isEditMode) {
                toggleEditMode(); // Apply view mode if it was saved
            }
        }

        // Load timetable data
        fetch('http://127.0.0.1:5000/get-timetable')
            .then(response => response.json())
            .then(data => {
                savedTimetableData = data;
                updateCurrentPeriod();
            })
            .catch(error => console.error('Error loading timetable:', error));

        inputs.forEach((input) => {
            const key = `row-${input.parentElement.parentElement.rowIndex}-col-${input.parentElement.cellIndex}`;
            const savedValue = localStorage.getItem(key);
            if (savedValue) {
                input.value = savedValue;
            }
        });
    }

    // Show loading state
    function setLoading(isLoading) {
        if (isLoading) {
            saveButton.classList.add('loading');
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        } else {
            saveButton.classList.remove('loading');
            saveButton.disabled = false;
            saveButton.textContent = isEditMode ? 'Save Timetable' : 'Edit Timetable';
        }
    }

    // Show success/error message
    function showMessage(message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isError ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Save timetable data to local storage and send to backend
    async function saveTimetable() {
        if (!isEditMode) {
            // If we're in view mode, switch to edit mode
            toggleEditMode();
            return;
        }

        setLoading(true);
        const timetableData = [];

        inputs.forEach((input) => {
            const key = `row-${input.parentElement.parentElement.rowIndex}-col-${input.parentElement.cellIndex}`;
            const value = input.value.trim();

            if (value) {
                localStorage.setItem(key, value);

                // Extract day, time, and subject
                const day = input.parentElement.parentElement.cells[0].textContent;
                const timeSlot = input.parentElement.parentElement.parentElement.parentElement.rows[0].cells[input.parentElement.cellIndex].textContent;
                const subject = value;

                timetableData.push({ day, time: timeSlot, subject });
            }
        });

        try {
            const response = await fetch('http://127.0.0.1:5000/add-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timetable: timetableData }),
            });

            if (!response.ok) throw new Error('Failed to save timetable to backend');
            
            savedTimetableData = timetableData;
            showMessage("Timetable saved successfully!");
            toggleEditMode(); // Switch to view mode after successful save
            updateCurrentPeriod(); // Update current period display
        } catch (error) {
            console.error('Error:', error);
            showMessage("Failed to save timetable to backend. Please try again.", true);
        } finally {
            setLoading(false);
        }
    }

    // Attach event listener to the save button
    saveButton.addEventListener("click", saveTimetable);

    // Update current period every minute
    setInterval(() => {
        updateCurrentTime();
        updateCurrentPeriod();
    }, 60000);

    // Load saved data when the page loads
    loadTimetable();
    // Initial update of current period
    updateCurrentPeriod();
});
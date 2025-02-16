const form = document.getElementById('schedule-form');
const scheduleList = document.getElementById('schedule-list');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const date = document.getElementById('date').value;
    const timeFrom = document.getElementById('timeFrom').value;
    const timeTo = document.getElementById('timeTo').value;
    
    // Create a new list item
    const li = document.createElement('li');
    li.textContent = `${subject} - ${date} | ${timeFrom} to ${timeTo}`;
    
    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('delete-btn');
    
    // Add event listener to the delete button
    deleteButton.addEventListener('click', function() {
        scheduleList.removeChild(li);
    });
    
    // Append the delete button to the list item
    li.appendChild(deleteButton);
    
    // Append the list item to the schedule list
    scheduleList.appendChild(li);
    
    // Optionally, clear the form fields after submission
    form.reset();
});

// Check if the browser supports Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// If not supported, show an alert
if (!SpeechRecognition) {
    alert("Sorry, your browser doesn't support Speech Recognition.");
} else {
    // Create a new SpeechRecognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';                 // Set language to English (United States)
    recognition.continuous = false;             // Listen for one command at a time
    recognition.interimResults = false;         // Only final results, not partial guesses

    // Get the start button and task list elements from the page
    const startButton = document.getElementById('start-record-btn');
    const taskList = document.getElementById('task-list');

    // Function to add a new task to the list
    function addTask(taskName) {
        const li = document.createElement('li');              // Create a new list item
        li.textContent = taskName;                            // Set the task text
        li.setAttribute('data-task', taskName.toLowerCase()); // Store task name in lowercase for easy search
        taskList.appendChild(li);                             // Add the task to the list
        speak(`Task added: ${taskName}`);                     // Give voice feedback
    }

    // Function to mark a task as complete
    function completeTask(taskName) {
        const items = taskList.querySelectorAll('li'); // Get all tasks
        for (let item of items) {
            if (item.getAttribute('data-task') === taskName.toLowerCase()) {
                item.style.textDecoration = 'line-through'; // Cross out the completed task
                speak(`Task completed: ${taskName}`);       // Voice feedback
                return;                                     // Stop after completing the task
            }
        }
        speak(`Task not found: ${taskName}`); // If no matching task is found
    }

    // Function to delete a task from the list
    function deleteTask(taskName) {
        const items = taskList.querySelectorAll('li');  // Get all tasks
        for (let item of items) {
            if (item.getAttribute('data-task') === taskName.toLowerCase()) {
                item.remove();                          // Remove the matching task
                speak(`Task deleted: ${taskName}`);     // Voice feedback
                return;                                 // Stop after deleting
            }
        }
        speak(`Task not found: ${taskName}`);           // If no matching task is found
    }

    // Function to make the app "speak" a message back to the user
    function speak(text) {
        const synth = window.speechSynthesis;                 // Access the SpeechSynthesis API
        const utterance = new SpeechSynthesisUtterance(text); // Create a speech message
        synth.speak(utterance);                               // Speak the message
    }

    // Function to handle the voice command and decide what to do
    function handleVoiceCommand(command) {
        if (command.startsWith("add task")) {
            const taskName = command.replace("add task", "").trim();     // Get the task name
            addTask(taskName);      // Add the task

            
        } else if (command.startsWith("complete task")) {
            const taskName = command.replace("complete task", "").trim(); // Get the task name
            completeTask(taskName); // Complete the task
        } else if (command.startsWith("delete task")) {
            const taskName = command.replace("delete task", "").trim();   // Get the task name
            deleteTask(taskName);   // Delete the task
        } else {
            speak("Sorry, I didn't understand the command.");             // Speak if command is not recognized
        }
    }

    let isListening = false // Track if web is currently listening

    // When user clicks the "Start Listening" button, start voice recognition
    startButton.addEventListener('click', () => {
        if (!isListening) {
            //recognition.start();

            //NOTE : temporary
            isListening = !isListening
            startButton.textContent = "Stop Listening"
            startButton.classList.add('listening-btn'); // Turn button red
            document.querySelector('.todo-container').classList.add('listening-container'); // Glow the container
        } else {
            //recognition.stop();

            //NOTE : temporary
            isListening = !isListening
            startButton.textContent = "Start Listening"
            startButton.classList.remove('listening-btn'); // Restore green button
            document.querySelector('.todo-container').classList.remove('listening-container'); // Remove container glow
        }
    });

    // smooth text transition
    function smoothTextChange(newText) {
        startButton.style.opacity = 0; // Fade out
        setTimeout(() => {
            startButton.textContent = newText; // Change text when faded
            startButton.style.opacity = 1; // Fade back in
        }, 150); // 150ms fade
    }
    
    // when recognition start
    recognition.addEventListener("start", () => {
        isListening = true;
        smoothTextChange("Stop Listening");
        startButton.classList.add('listening-btn'); // Turn button red
        document.querySelector('.todo-container').classList.add('listening-container'); // Glow the container
    })

    // when recognition stop
    recognition.addEventListener("end",() => {
        isListening = false;
        smoothTextChange("Start Listening");
        startButton.classList.remove('listening-btn'); // Restore green button
        document.querySelector('.todo-container').classList.remove('listening-container'); // Remove container glow
    })

    // When a voice command is successfully recognized
    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim(); // Get the spoken text
        console.log("Heard:", transcript);    // Log it for debugging
        handleVoiceCommand(transcript);       // Process the spoken command
    });

    // Handle any recognition errors (like microphone issues)
    recognition.addEventListener('error', (event) => {
        console.error("Error:", event.error); // Log the error
    });
}
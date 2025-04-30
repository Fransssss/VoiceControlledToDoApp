// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition){
    alert("Sorry, Your browser does not support speech recognition")
} else {
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US';                 // Set language to English (United States)
    recognition.continuous = false;             // Listen for one command at a time
    recognition.interimResults = false;         // Only final results, not partial guesses

    // Get the start button and task list elements from the page
    const startButton = document.getElementById("start-listen-btn")
    const taskList = document.getElementById("task-list")

    // Show/ hide empty message
    function updateEmptyMessage() {
        const emptyMessage = document.getElementById('empty-message');
        if (taskList.children.length === 0) {
          emptyMessage.style.display = "block"; // Show message if no tasks
        } else {
          emptyMessage.style.display = "none"; // Hide message if there are tasks
        }
    }      

    // Friendly Visual Feedback / Message 
    function showFriendlyError(message = "Sorry, I didn’t catch that. Try again?") {
        const feedback = document.getElementById("voice-feedback");
        feedback.textContent = message;
        feedback.style.display = "block";
    
        setTimeout(() => {
            feedback.style.display = "none";
        }, 3000);
    }
    
    // Prevent empty / bad^ tasks
    function isValidTask(taskName) {
        let cleanName = taskName.trim();               // Remove extra spaces
        cleanName = cleanName.replace(/^[\W_]+/g, ""); // Remove all non-word chars from start
        cleanName = cleanName.replace(/[\W_]+$/g, ""); // Remove all non-word chars from end
        cleanName = cleanName.replace(/\s{2,}/g, " "); // Fix double spaces
    
        // Final validation
        if (
            cleanName.length === 0 ||
            /^[\W\d]+$/g.test(cleanName)               // Reject if it's just symbols or numbers
        ) {
            showFriendlyError()                        // Ask user to say the prompt again
            return false;
        }
    
        return true;
    }
    

    // Function to add a new task to the list
    function addTask(taskName) {
        if (isValidTask(taskName)){
            // Validate taskName again
            let cleanName = taskName.trim();
            cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize

            const li = document.createElement("li");
        
            const taskCount = taskList.children.length + 1;                   // Count how many tasks already
            taskName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize first letter
            li.textContent = `${taskCount}. ${cleanName}`;                     // Add number before task name
        
            li.setAttribute("data-task", cleanName.toLowerCase()); // Keep hidden original task name
            taskList.appendChild(li);
        
            updateEmptyMessage();                                 // hide 'empty message' text when task added
            // speak(`Task added: ${taskName}`); // Optional voice feedback
        } else {
            console.log("! Ignored empty / bad task.");
        }
    }
    
    // Function to mark a task as complete
    // TBA

    // Function to remove a task from the list
    function removeTask(taskName){
        if(isValidTask(taskName)){
            let cleanName = taskName.trim();
            cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize
            
            const items = taskList.includes(cleanName);

            for (let item of items) {
                if (item.textContent.includes(cleanName)){
                    item.remove();
                    updateEmptyMessage(); // check if list is empty now
                    // speak("Task removed: ${cleanName}")
                    return
                }
            }
        }
        console.log("! Sorry, ",taskName, " is not in the list");
    }

    // Function to show / list task

    // Function to handle the voice command and decide what to do
    function handleVoiceCommand(command) {
        // add task
        if (command.startsWith("add task")){
            const taskName = command.replace("add task","").trim();
            addTask(taskName);
        }
        // delete task
        else if (command.startsWith("delete task") || command.startsWith("remove task")) {
            const taskName = command.replace(/(delete task|remove task)/, "").trim();
            removeTask(taskName);
        } 

        // complete task 

        // show task

    }

    let isListening = false                    // Track if web is currently listening

    function smoothTextChange(newText){
        startButton.style.opacity = 0;         // Fade out 
        setTimeout( () => {
            startButton.textContent = newText; // Change text
            startButton.style.opacity = 1; 
        }, 150);                               // 150ms fade
    }
    
    // When user clicks 'start listening' button
    startButton.addEventListener("click", () => {
        recognition.start()
    })

    // When recognition start
    recognition.addEventListener("start", () => {
        isListening = true; 
        smoothTextChange("Stop Listening");
        startButton.classList.add("listening-btn");
        document.querySelector(".todo-container").classList.add("listening-container");

        showFriendlyError("Try saying 'Add task walk the dog'.");
    })

    // When recognition stop
    recognition.addEventListener("end", () => {
        isListening = false; 
        smoothTextChange("Start Listening");
        startButton.classList.remove("listening-btn");
        document.querySelector(".todo-container").classList.remove("listening-container");
        
        showFriendlyError("Done listening. Try again if needed!");
    })

    // When something is said 
    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("> I heard you said: ",transcript);
        handleVoiceCommand(transcript)
    })

    // Handle any recognition error (i.e. microphone issue, etc)
    recognition.addEventListener("error", (event) => {
        console.log("! Error: ", event.error);
        showFriendlyError();
        // speak("Sorry, I didn’t catch that. Try again.");
    });

}




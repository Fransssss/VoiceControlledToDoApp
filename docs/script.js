// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Pop up Instruction
const popup = document.getElementById("instruction-popup");
const popupTitle = document.getElementById("popup-title")
const closeBtn = document.getElementById("close-popup-btn");

// Show popup only once per session 
if (!sessionStorage.getItem("instructionSeen")) {
    popup.style.display = "flex";
    popupTitle.textContent = "Welcome! 👋";
    sessionStorage.setItem("instructionSeen", "true");
}

// Show Instruction button
const showBtn = document.getElementById("show-instructions-btn");

showBtn.addEventListener("click", () => {
    popup.style.display = "flex";
    popupTitle.textContent = "Instructions 📘";
});

closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

// Handle task duplication confirmation
let isWaitingForDuplicationConfirmation = false;
let pendingTaskName = "";

// Handle all task deletion
let pendingAction = ""; // track what the "yes" will trigger


// Main voice controlled app
if (!SpeechRecognition){
    alert("Sorry, Your browser does not support speech recognition")
} else {
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US';                 // Set language to English (United States)
    recognition.continuous = false;             // Listen for one command at a time
    recognition.interimResults = false;         // Only final results, not partial guesses
    recognition.continuous = true;              // Keep listening until user stop it manually

    // Re-trigger if 'end' is fired unexpectedly
    if (isListening && !awaitingConfirmation) {
        recognition.start();                    // Auto-restart if user didn't stop it
    }

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
    function showFriendlyFeedback(message = "Sorry, I didn’t catch that. Try again?") {
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
    
    // Function to check if a task has already exist
    function isTaskDuplicated(taskName){
        if(isValidTask){
            let cleanName = taskName.trim()
            .replace(/^[\W_]+/g, "")
            .replace(/[\W_]+$/g, "")
            .replace(/\s{2,}/g, " ");

            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const items = taskList.querySelectorAll('li');
            for (let item of items) {
                if (item.textContent.includes(cleanName)) {
                    // Task already exists → ask for confirmation
                    isWaitingForDuplicationConfirmation = true;
                    pendingTaskName = cleanName;
                    pendingAction = "add-duplicate";
                    document.getElementById("confirm-popup").style.display = "flex";
                    // speak(`Task "${cleanName}" already exists. Say yes to add it anyway.`);
                    return; // yes, task has already existed
                }
            }
            addTask(cleanName);
        } 
    }

    // Function to add a new task to the list
    function addTask(taskName){
        if(isValidTask(taskName)){
            let cleanName = taskName.trim()
            .replace(/^[\W_]+/g, "")
            .replace(/[\W_]+$/g, "")
            .replace(/\s{2,}/g, " ");

            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const li = document.createElement("li");
            const taskCount = taskList.children.length + 1;
            li.textContent  = `${taskCount}. ${cleanName}`;
            li.setAttribute("data-task",cleanName.toLowerCase());
            taskList.appendChild(li);
            updateEmptyMessage();
            // speak("Task added: ${cleanName}")
        }
    }
    
    // Function to mark a task as complete
    function completeTask(taskName){
        if(isValidTask(taskName)){
            let cleanName = taskName.trim();
            cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize

            const items = taskList.querySelectorAll("li");

            for (let item of items){
                if (item.textContent.includes(cleanName)){
                    item.classList.add("completed");
                    // speak("Task marked complete: ${cleanName}")
                    return
                }
            }
        }
        console.log("! Task is not recognized");
    }

    // Function to remove a task from the list
    function removeTask(taskName){
        if(isValidTask(taskName)){
            let cleanName = taskName.trim();
            cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize
            
            const items = taskList.querySelectorAll("li");

            for (let item of items) {
                if (item.textContent.includes(cleanName)){
                    item.remove();
                    updateEmptyMessage(); // check if list is empty now
                    // speak("Task removed: ${cleanName}")
                    showFriendlyFeedback("Task is removed.")
                    return
                }
            }
        }
        // speak(`Sorry, I couldn't find the task: ${cleanName}`);
        console.log("! Sorry, ",taskName, " is not in the list");
    }

    // Function to clear all task 
    function clearTasks() {
        const items = taskList.querySelectorAll("li");
        if (items.length === 0){
            // speak("You have no tasks to clear")
            console.log("! You have no tasks to clear");
            return
        }

        // Ask for confirmation
        awaitingConfirmation = true;
        pendingAction = "clear-all";
        document.getElementById("confirm-message").textContent = "Are you sure you want to clear all tasks?";
        document.getElementById("confirm-popup").style.display = "flex";
        speak("Are you sure you want to clear all tasks? Say yes or click Yes to confirm.");
    }

    // Function to show / list task

    // Function to handle the voice command and decide what to do
    function handleVoiceCommand(command) {
        command = command.toLowerCase().trim();

        // check if duplication confirmation is on
        if(isWaitingForDuplicationConfirmation){
            if (command === "yes") {
                if (pendingAction === "add-duplicate") {
                    addTask(pendingTaskName);
                    // speak(`Task added: ${pendingTaskName}`);
                } else if (pendingAction === "clear-all") {
                    clearTasks();
                    updateEmptyMessage();
                    // speak("All tasks have been cleared.");
                }
                closeConfirmPopup();
            } else {
                speak("Action canceled.");
                closeConfirmPopup();
            }
            return; /
        }

        // add task
        if (command.startsWith("add task")){
            const taskName = command.replace("add task","").trim();
            isTaskDuplicated(taskName);
        }
        
        // delete task
        else if (command.startsWith("delete task") || command.startsWith("remove task")) {
            const taskName = command.replace(/(delete task|remove task)/, "").trim();
            removeTask(taskName);
        } 

        // complete task 
        else if (command.startsWith("complete task") || command.startsWith("mark task complete")) {
            const taskName = command.replace(/(complete task|mark task complete)/, "").trim();
            completeTask(taskName);
        }
        
        // clear task 
        if (command == "clear tasks" || command === "clear task" || command == "remove all tasks" ) {
            clearTasks();
        }

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
    
    // *Handle when user clicks 'start listening' button
    startButton.addEventListener("click", () => {
        recognition.start()
    })

    // *Handle when recognition start
    recognition.addEventListener("start", () => {
        isListening = true; 
        smoothTextChange("Stop Listening");
        startButton.classList.add("listening-btn");
        document.querySelector(".todo-container").classList.add("listening-container");

        showFriendlyFeedback("Try saying 'Add task walk the dog'.");
    })

    // *Handle When recognition stop
    recognition.addEventListener("end", () => {
        isListening = false; 
        smoothTextChange("Start Listening");
        startButton.classList.remove("listening-btn");
        document.querySelector(".todo-container").classList.remove("listening-container");
        
        showFriendlyFeedback("Done listening. Try again if needed!");
    })

    // *Handle case when something is said 
    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("> I heard you said: ",transcript);
        handleVoiceCommand(transcript)
    })

    // *Handle any recognition error (i.e. microphone issue, etc)
    recognition.addEventListener("error", (event) => {
        console.log("! Error: ", event.error);
        showFriendlyFeedback();
        // speak("Sorry, I didn’t catch that. Try again.");
    });

    // *Handle button for duplication confirmation pop up
    function closeDuplicateConfirmPopup(){
        pendingTaskName = "";
        isWaitingForDuplicationConfirmation = false; 
        document.getElementById("confirm-duplicate").style.display = "none";
    }

    // *Handle 'yes' btn
    document.getElementById("confirm-yes").addEventListener("click", () => {
        if (pendingAction === "add-duplicate") {
            addTask(pendingTaskName);
            // speak(`Task added: ${pendingTaskName}`);
        } else if (pendingAction === "clear-all") {
            clearTasks();
            updateEmptyMessage();
            // speak("All tasks have been cleared.");
        }
        closeConfirmPopup();
    });
    
    // *Handle 'no' btn
    document.getElementById("confirm-no").addEventListener("click",() => {
        // speak("Task not added.");
        closeDuplicateConfirmPopup();
    });
}




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

// *** updated script ***
// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// // Pop up Instruction
// const popup = document.getElementById("instruction-popup");
// const popupTitle = document.getElementById("popup-title")
// const closeBtn = document.getElementById("close-popup-btn");

// // Handle listener tracker if web is currently listening
// let isListening = false;
// let stopRequested = false;

// // Show popup only once per session 
// if (!sessionStorage.getItem("instructionSeen")) {
//     popup.style.display = "flex";
//     popupTitle.textContent = "Welcome! 😊";
//     sessionStorage.setItem("instructionSeen", "true");
// }

// // Show Instruction button
// const showBtn = document.getElementById("show-instructions-btn");

// showBtn.addEventListener("click", () => {
//     popup.style.display = "flex";
//     popupTitle.textContent = "Instructions 📘";
// });

// closeBtn.addEventListener("click", () => {
//     popup.style.display = "none";
// });

// // Handle task duplication confirmation
// let isWaitingForDuplicationConfirmation = false;
// let pendingTaskName = "";

// // Handle all task deletion
// let pendingAction = ""; // track what the "yes" will trigger

// // Main voice controlled app
// if (!SpeechRecognition){
//     alert("Sorry, Your browser does not support speech recognition")
// } else {
//     const recognition = new SpeechRecognition()
//     recognition.lang = 'en-US';                 // Set language to English (United States)
//     recognition.continuous = true;              // Listen for one command at a time
//     recognition.interimResults = false;         // Only final results, not partial guesses

//     recognition.addEventListener("start", () => {
//         isListening = true;
//     });

//     // Re-trigger if 'end' is fired unexpectedly
//     if (isListening && !awaitingConfirmation) {
//         recognition.start();                    // Auto-restart if user didn't stop it
//     }

//     // Get the start button and task list elements from the page
//     const startButton = document.getElementById("start-listen-btn")
//     const taskList = document.getElementById("task-list")

//     // Show/ hide empty message
//     function updateEmptyMessage() {
//         const emptyMessage = document.getElementById('empty-message');
//         if (taskList.children.length === 0) {
//           emptyMessage.style.display = "block"; // Show message if no tasks
//         } else {
//           emptyMessage.style.display = "none"; // Hide message if there are tasks
//         }
//     }      

//     // Friendly Visual Feedback / Message 
//     function showFriendlyFeedback(message = "Sorry, I didn’t catch that. Try again?") {
//         const feedback = document.getElementById("voice-feedback");
//         feedback.textContent = message;
//         feedback.style.display = "block";
    
//         setTimeout(() => {
//             feedback.style.display = "none";
//         }, 3000);
//     }

//     // Detect when user says a number
//     function getTaskByNumber(index) {
//         const items = taskList.querySelectorAll("li");
//         const i = parseInt(index.trim());
//         console.log("This is items > i: ",i);
//         if (isNaN(i) || i < 1 || i > items.length) {
//             return null;
//         }
    
//         return items[i - 1]; // e.g., 1 returns items[0]
//     }
    
//     // Prevent empty / bad^ tasks
//     function isValidTask(taskName) {
//         let cleanName = taskName.trim();               // Remove extra spaces
//         cleanName = cleanName.replace(/^[\W_]+/g, ""); // Remove all non-word chars from start
//         cleanName = cleanName.replace(/[\W_]+$/g, ""); // Remove all non-word chars from end
//         cleanName = cleanName.replace(/\s{2,}/g, " "); // Fix double spaces
    
//         // Final validation
//         if (
//             cleanName.length === 0 ||
//             /^[\W\d]+$/g.test(cleanName)               // Reject if it's just symbols or numbers
//         ) {
//             showFriendlyFeedback();                        // Ask user to say the prompt again
//             return false;
//         }
    
//         return true;
//     }
    
//     // Function to check if a task has already exist
//     function isTaskDuplicated(taskName){
//         if(isValidTask(taskName)){
//             let cleanName = taskName.trim()
//             .replace(/^[\W_]+/g, "")
//             .replace(/[\W_]+$/g, "")
//             .replace(/\s{2,}/g, " ");

//             cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

//             const items = taskList.querySelectorAll('li');
//             for (let item of items) {
//                 if (item.textContent.includes(cleanName)) {
//                     // Task already exists → ask for confirmation
//                     isWaitingForDuplicationConfirmation = true;
//                     pendingTaskName = cleanName;
//                     pendingAction = "add-duplicate";
//                     document.getElementById("confirm-message").textContent = "Task already exists. Add it anyway?";
//                     document.getElementById("confirm-popup").style.display = "flex";

//                     // Clears the buffer and forces the app to listen only for "yes" or "no" next.
//                     recognition.abort(); // stops any active recognition, fresh start after
//                     setTimeout(() => {
//                         recognition.start(); // restart clean
//                     }, 100);

//                     // speak(`Task "${cleanName}" already exists. Say yes to add it anyway.`);
//                     return; // yes, task has already existed
//                 }
//             }
//             addTask(cleanName);
//         } 
//     }

//     // Function to add a new task to the list
//     function addTask(taskName){
//         if(isValidTask(taskName)){
//             let cleanName = taskName.trim()
//             .replace(/^[\W_]+/g, "")
//             .replace(/[\W_]+$/g, "")
//             .replace(/\s{2,}/g, " ");

//             cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

//             const li = document.createElement("li");
//             const taskCount = taskList.children.length + 1;
//             li.textContent  = `${taskCount}. ${cleanName}`;
//             li.setAttribute("data-task",cleanName.toLowerCase());
//             taskList.appendChild(li);
//             updateEmptyMessage();
//             // speak("Task added: ${cleanName}")
//         }
//     }
    
//     // Function to mark a task as complete
//     function completeTask(taskNameOrNumber){
//         let item = getTaskByNumber(taskNameOrNumber);
//         console.log("> This is item: ",item);
//         if(item){
//             item.style.textDecoration = "line-through";
//             item.style.opacity = "0.6";
//             // speak("Task marked complete")
//             console.log("task marked complete");

//         } else if(isValidTask(taskNameOrNumber)){
//             let cleanName = taskNameOrNumber.trim();
//             cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
//             cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize

//             const items = taskList.querySelectorAll("li");

//             for (let item of items){
//                 if (item.textContent.includes(cleanName)){
//                     item.classList.add("completed");
//                     // speak("task marked complete: ${cleanName}");
//                     return
//                 }
//             }
//         }

//         // speak("sorry, I couldn't find that task.");
//         console.log("! Sorry, I couldn't find that task.");
//     }

//     // Function to remove a task from the list
//     function removeTask(taskNameOrNumber){
//         let item = getTaskByNumber(taskNameOrNumber);

//         if(item){
//             item.remove();
//             updateEmptyMessage();
//             // speak("Task removed.")
//             console.log("Task removed");
//         } else if(isValidTask(taskNameOrNumber)){
//             let cleanName = taskNameOrNumber.trim();
//             cleanName = cleanName.replace(/^[\W_]+/g, "").replace(/[\W_]+$/g, "").replace(/\s{2,}/g, " ");
//             cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1); // Capitalize
            
//             const items = taskList.querySelectorAll("li");

//             for (let item of items) {
//                 if (item.textContent.includes(cleanName)){
//                     item.remove();
//                     updateEmptyMessage(); // check if list is empty now
//                     // speak("Task removed: ${cleanName}")
//                     showFriendlyFeedback("Task is removed.")
//                     return
//                 }
//             }
//         }

//     //     // speak(`Sorry, I couldn't find the task: ${cleanName}`);
//         console.log("! Sorry, ",taskName, " is not in the list");
//     }

//     // Function to clear all task 
//     function clearTasks() {
//         const items = taskList.querySelectorAll("li");
//         if (items.length === 0){
//             // speak("You have no tasks to clear")
//             console.log("! You have no tasks to clear");
//             return
//         }

//     //     // Ask for confirmation
//         isWaitingForDuplicationConfirmation = true;
//         pendingAction = "clear-all";
//         pendingTaskName = "";
//         document.getElementById("confirm-message").textContent = "Are you sure you want to clear all tasks?";
//         document.getElementById("confirm-popup").style.display = "flex";
//         // speak("Are you sure you want to clear all tasks? Say yes or click Yes to confirm.");

//         // Reset recognition so we only catch "yes"/"no"
//         try {
//             recognition.abort(); // Stop current recognition
//         } catch (e) {
//             console.warn("Abort error:", e);
//         }
        
//         setTimeout(() => {
//             try {
//                 recognition.start(); // Restart fresh
//             } catch (e) {
//                 console.warn("Start error:", e);
//             }
//         }, 100);
//     }

//     // *Handle button for duplication confirmation pop up
//     function closeConfirmPopup(){
//         pendingTaskName = "";
//         pendingAction = "";
//         isWaitingForDuplicationConfirmation = false; 
//         document.getElementById("confirm-popup").style.display = "none";

//         // Optional: flush recognition buffer
//         try {
//             recognition.abort(); // Stop current recognition if still active
//         } catch (e) {
//             console.warn("Recognition abort failed:", e);
//         }

//         // Restart fresh
//         setTimeout(() => {
//             try {
//             recognition.start();
//             } catch (e) {
//             console.warn("Recognition already active:", e);
//             }
//         }, 300); // slight delay for smoother restart
//     }

//     // Function to show / list task

//     // Function to handle the voice command and decide what to do
//     function handleVoiceCommand(command) {
//         command = command.toLowerCase().trim();
//         console.log("> I heard: ",command);

//         // check if duplication confirmation is true
//         console.log("! is waiting !",isWaitingForDuplicationConfirmation);
//         if (isWaitingForDuplicationConfirmation) {
//             command = command.replace(/\.$/, ""); // remove period
//             if (command === "yes") {
//                 if (pendingAction === "add-duplicate") {
//                     console.log("Initiate duplication...");
//                     addTask(pendingTaskName); // allow duplicate
//                 } else if (pendingAction === "clear-all") {
//                     console.log("Clearing task...");
//                     taskList.innerHTML = "";
//                     updateEmptyMessage();
//                 }
//                 // speak("Action confirmed.");
//                 closeConfirmPopup();
//             } else if (command === "no") {
//                 // speak("Okay, no action taken.");
//                 closeConfirmPopup();
//             } else {
//                 console.log("! Say 'yes' to confirm, or 'no' to cancel. ");
//                 // speak("Say 'yes' to confirm, or 'no' to cancel.");
//             }
//             return; // Don't handle normal commands while waiting
//         }        

//         // Add task
//         if (command.startsWith("add task")){
//             const taskName = command.replace("add task","").trim();
//             console.log("Initiate add task...");
//             isTaskDuplicated(taskName);
//         }
        
//         // Delete task
//         else if (command.startsWith("delete task") || command.startsWith("remove task")) {
//             const taskName = command.replace(/(delete task|remove task)/, "").trim();
//             console.log("Initiate delete task...");
//             removeTask(taskName);
//         } 

//         // Complete task 
//         else if (command.startsWith("complete task") || command.startsWith("mark task complete")) {
//             const taskName = command.replace(/(complete task|mark task complete)/, "").trim();
//             console.log("Initiate complete task...");
//             completeTask(taskName);
//         }
        
//         // Clear task 
//         else if (command.startsWith("clear tasks") || command.startsWith("clear task") || command.startsWith("remove all tasks")) {
//             console.log("Initiate clear task...");
//             clearTasks();
//         }

//         else if (command.startsWith("stop") || command === "stop"){
//             console.log("Shutting down listener...");
//             isListening = false; 
//             stopRequested = true;
//             recognition.stop();

//             smoothTextChange("Start Listening");
//             startButton.classList.remove("listening-btn");
//             document.querySelector(".todo-container").classList.remove("listening-container");
//         }

//         // Show task

//     }

//     function smoothTextChange(newText){
//         startButton.style.opacity = 0;         // Fade out 
//         setTimeout( () => {
//             startButton.textContent = newText; // Change text
//             startButton.style.opacity = 1; 
//         }, 150);                               // 150ms fade
//     }
    
//     // *Handle when user clicks 'start listening' button
//     startButton.addEventListener("click", () => {
//         if (!isListening) {
//             try {
//             recognition.start();
//             } catch (e) {
//             console.warn("! Recognition already started.");
//             }
//         } else {
//             stopRequested = true; // block auto-restart
//             recognition.stop();   // stops listening
//         }
//     });

//     // *Handle when recognition start
//     recognition.addEventListener("start", () => {
//         isListening = true; 
//         stopRequested = false;
//         smoothTextChange("Stop Listening");
//         startButton.classList.add("listening-btn");
//         document.querySelector(".todo-container").classList.add("listening-container");

//         showFriendlyFeedback("Try saying 'Add task walk the dog'.");
//     })

//     // *Handle When recognition stop
//     recognition.addEventListener("end", () => {
//         isListening = false; 
//         smoothTextChange("Start Listening");
//         startButton.classList.remove("listening-btn");
//         document.querySelector(".todo-container").classList.remove("listening-container");
        
//         // Restart only when not in confirmation
//         if (!stopRequested && !isWaitingForDuplicationConfirmation){
//             try {
//                 recognition.start();
//             } catch (e) {
//                 console.log("Recognition is running...");
//             }
//         }

//         showFriendlyFeedback("Done listening. Try again if needed!");
//     })

//     // *Handle case when something is said 
//     recognition.addEventListener("result", (event) => {
//         const transcript = event.results[0][0].transcript.toLowerCase().trim();
//         handleVoiceCommand(transcript)
//     })

//     // *Handle any recognition error (i.e. microphone issue, etc)
//     recognition.addEventListener("error", (event) => {
//         console.log("! Error: ", event.error);
//         showFriendlyFeedback();
//         // speak("Sorry, I didn’t catch that. Try again.");
//     });

//     // *Handle 'yes' btn
//     document.getElementById("confirm-yes").addEventListener("click", () => {
//         if (pendingAction === "add-duplicate") {
//             addTask(pendingTaskName);
//             // speak(`Task added: ${pendingTaskName}`);
//         } else if (pendingAction === "clear-all") {
//             clearTasks();
//             // speak("All tasks have been cleared.");
//         }
//         closeConfirmPopup();
//     });
    
//     // *Handle 'no' btn
//     document.getElementById("confirm-no").addEventListener("click",() => {
//         // speak("Task not added.");
//         closeConfirmPopup();
//     });
// }

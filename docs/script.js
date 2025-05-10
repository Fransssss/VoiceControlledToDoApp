const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
    // TODO: use custom pop-up instead for friendly outlook
    alert("Oops, sorry your browser does not seem to support speech recognition")
    console.log("! Oops, sorry your browser does not seem to support speech recognition");
} else {
    console.log("> Hey, speech recognition initiated");

    // 1. Add task 
    // When task exist, allow duplication ?
        // Yes, add duplicate
        // No,  do not do anything
    
    // 2. Complete task
        // Complete by (full) task name
        // Complete task by number
            // Remove associated task if exist
            // Popup shows up - 'task does not exist'
    
    // 3. Remove a task 
        // Remove by (full) task name 
        // Remove by associated number 
            // Remove associated task if exist
            // Popup shows up - 'task does not exist'
    
    // 4. Clear all task 
        // Is there at least one task ?
            // Yes - shows popup confirmation to clear all 
            // No - skip task 
        
}
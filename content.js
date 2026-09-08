// content.js

// --- CONFIGURATION FOR SRM PROTOTYPE ---
// You MUST inspect the webpage (Right Click -> Inspect) to find the exact classes or elements.
const SELECTORS = {
  // --- Quiz/MCQ Selectors ---
  // The element containing the question text
  PROMPT_TEXT: 'YOUR_QUESTION_SELECTOR', 
  
  // The elements containing the answer choices
  OPTION_LABELS: 'YOUR_OPTIONS_SELECTOR', 
  
  // The submit or next button in the quiz
  SUBMIT_BUTTON: 'YOUR_SUBMIT_SELECTOR',
  
  // --- Dashboard/Chart Selectors ---
  // The red/yellow segments in the circular chart. 
  // Since it's likely an SVG chart, you might need to target `<path>` elements by their fill color.
  // Example: 'path[fill="#ff0000"], .learning-not-started, .learning-in-progress'
  UNFINISHED_MODULES: 'YOUR_RED_OR_YELLOW_SEGMENT_SELECTOR' 
};

// --- STATE ---
let isProcessing = false;

// --- DOM OBSERVATION ---
const observer = new MutationObserver((mutations) => {
  if (isProcessing) return;

  const promptElement = document.querySelector(SELECTORS.PROMPT_TEXT);
  const optionsElements = document.querySelectorAll(SELECTORS.OPTION_LABELS);

  // 1. Detect if we are inside a Quiz/Data-entry module
  if (promptElement && optionsElements.length > 0) {
      console.log("[QA Agent] MCQ/Quiz module detected.");
      processTask(promptElement, optionsElements);
  } else {
      // 2. If not in a quiz, check if we are on the dashboard and have pending tasks
      checkForPendingTasks();
  }
});

// Start observing the entire document body for DOM changes
observer.observe(document.body, { childList: true, subtree: true });

// --- AGENT LOGIC (QUIZ SOLVING) ---
async function processTask(promptElement, optionsElements) {
  isProcessing = true;
  
  try {
    const directive = promptElement.innerText.trim();
    const options = Array.from(optionsElements).map(el => el.innerText.trim());
    
    console.log(`[QA Agent] Question: "${directive}"`);
    console.log(`[QA Agent] Options:`, options);

    // LLM Evaluation via background.js
    const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: "evaluatePrompt", directive: directive, options: options },
            (response) => resolve(response)
        );
    });

    if (response.error) {
        console.error("[QA Agent] Error from API:", response.error);
        isProcessing = false;
        return;
    }

    const chosenOptionText = response.answer;
    console.log(`[QA Agent] Gemini chose: "${chosenOptionText}"`);

    // Find the corresponding DOM element
    let targetElement = Array.from(optionsElements).find(
        el => el.innerText.trim().toLowerCase() === chosenOptionText.toLowerCase()
    );

    // Fallback: Fuzzy matching
    if (!targetElement) {
        targetElement = Array.from(optionsElements).find(
            el => el.innerText.trim().toLowerCase().includes(chosenOptionText.toLowerCase())
        );
    }

    if (targetElement) {
        console.log("[QA Agent] Clicking chosen answer...");
        targetElement.click(); // Click the radio button/label
        
        // Wait a moment to simulate reading/clicking
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

        const submitBtn = document.querySelector(SELECTORS.SUBMIT_BUTTON);
        if (submitBtn) {
             console.log("[QA Agent] Clicking submit/next...");
             submitBtn.click();
        } else {
             console.error("[QA Agent] Submit button not found!");
        }

    } else {
        console.error(`[QA Agent] Could not match Gemini's answer to a DOM element: "${chosenOptionText}"`);
    }

  } catch (err) {
      console.error("[QA Agent] Exception during processing:", err);
  } finally {
      // Release lock and check for the next task or return to dashboard
      setTimeout(() => {
          isProcessing = false;
          checkForPendingTasks();
      }, 3000); // 3 second delay after submission
  }
}

// --- AUTONOMOUS LOOP (DASHBOARD NAVIGATION) ---
function checkForPendingTasks() {
    if (isProcessing) return;

    // Look for all unfinished modules (Red or Yellow segments in the chart)
    const unfinishedModules = document.querySelectorAll(SELECTORS.UNFINISHED_MODULES);
    
    if (unfinishedModules && unfinishedModules.length > 0) {
        // Pick the first available unfinished module
        const nextTask = unfinishedModules[0];
        
        console.log("[QA Agent] Found an unfinished module (Red/Yellow). Clicking to start...");
        isProcessing = true; 
        
        // Sometimes SVG paths need their parent <g> clicked, or dispatchEvent
        try {
            nextTask.click();
        } catch(e) {
            // Fallback for SVG elements that don't support standard .click()
            nextTask.dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
        }
        
        // Reset processing state after navigation delay
        setTimeout(() => {
            isProcessing = false;
            // The MutationObserver will catch the new quiz if it loads dynamically,
            // but we can force a check here too.
            const prompt = document.querySelector(SELECTORS.PROMPT_TEXT);
            if (prompt) {
                const options = document.querySelectorAll(SELECTORS.OPTION_LABELS);
                processTask(prompt, options);
            }
        }, 3000);
    }
}

// Initial check on script load
setTimeout(checkForPendingTasks, 2000);

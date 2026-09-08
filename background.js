// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "evaluatePrompt") {
    
    // Fetch the API key from storage (or use a placeholder for testing)
    chrome.storage.local.get(['geminiApiKey'], async (result) => {
      // NOTE: For testing, you can temporarily hardcode your key here, 
      // e.g., const apiKey = "AIzaSy...";
      const apiKey = result.geminiApiKey || 'YOUR_GEMINI_API_KEY_HERE';
      
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
          console.error("[QA Agent BG] Gemini API key not found. Please update background.js or extension storage.");
          sendResponse({ error: "API Key not configured." });
          return;
      }

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a QA automation bot. Based on the following directive, select the most logical option from the list provided. Output ONLY the exact text of your chosen option. Directive: ${request.directive}, Options: ${JSON.stringify(request.options)}`
              }]
            }],
            generationConfig: {
                temperature: 0.1 // Low temperature for more deterministic/factual selection
            }
          })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("[QA Agent BG] API Error:", data.error.message);
            sendResponse({ error: data.error.message });
        } else if (data.candidates && data.candidates.length > 0) {
            const answer = data.candidates[0].content.parts[0].text.trim();
            sendResponse({ answer: answer });
        } else {
             sendResponse({ error: "No response from Gemini API." });
        }

      } catch (error) {
        console.error("[QA Agent BG] Fetch exception:", error);
        sendResponse({ error: error.message });
      }
    });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

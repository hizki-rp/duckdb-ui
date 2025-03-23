// contentScript.js

// Send a message to the background script
chrome.runtime.sendMessage(
	{
		action: "getFlag", // Action to perform
		flagName: "activeTabTimeoutExtendIfRemainingTimeLessThanSeconds", // Flag to retrieve
	},
	(response) => {
		// Handle errors
		if (chrome.runtime.lastError) {
			console.error("Error:", chrome.runtime.lastError);
		} else {
			// Handle the response
			console.log("Flag value:", response);
		}
	}
);

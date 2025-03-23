// background.js

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getFlag") {
    // Retrieve the flag value
    const flagValue = getFlagValue(request.flagName);

    // Send the response back to the content script
    sendResponse(flagValue);

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

// Function to retrieve flag values
function getFlagValue(flagName) {
  // Replace this with your actual logic to retrieve flag values
  const flags = {
    activeTabTimeoutExtendIfRemainingTimeLessThanSeconds: 30,
    activeTabVisibilityTimeoutExtensionSeconds: 60,
    applyBestCodeMaxRetries: 3,
    testSuites: ["suite1", "suite2"],
  };

  // Return the flag value
  return flags[flagName];
}
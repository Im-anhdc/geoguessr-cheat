window.addEventListener('message', function (event) {
    if (event.source !== window || event.origin !== window.location.origin) {
        return;
    }

    const message = event.data;
    if (!message || message.type !== 'geolens-send-map') {
        return;
    }

    chrome.runtime.sendMessage(message).catch((error) => {
        console.error('Map upload request failed:', error);
    });
});
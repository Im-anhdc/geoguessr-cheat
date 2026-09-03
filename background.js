const TELEGRAM_BOT_TOKEN = '';
const TELEGRAM_CHAT_ID = '';

function getMapImageUrl(latitude, longitude) {
    const coordinates = `${longitude},${latitude}`;
    const params = new URLSearchParams({
        ll: coordinates,
        z: '5',
        size: '600,400',
        l: 'map',
        pt: `${coordinates},pm2rdm`
    });

    return `https://static-maps.yandex.ru/1.x/?${params}`;
}

chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== 'geolens-send-map') {
        return;
    }

    sendMapToTelegram(message).catch((error) => {
        console.error('Map upload failed:', error);
    });
});

async function sendMapToTelegram({ latitude, longitude, caption }) {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Invalid map coordinates');
    }

    const imageResponse = await fetch(getMapImageUrl(latitude, longitude));
    if (!imageResponse.ok) {
        throw new Error(`Map image request failed: ${imageResponse.status}`);
    }

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', await imageResponse.blob(), 'location-map.png');
    formData.append('caption', caption);

    const telegramResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        { method: 'POST', body: formData }
    );

    if (!telegramResponse.ok) {
        throw new Error(`Telegram rejected map image: ${await telegramResponse.text()}`);
    }
}

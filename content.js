let lat = 999;
let long = 999;
let coordInfo = '';
let strCoord = null;

(function (xhr) {
    var XHR = XMLHttpRequest.prototype;
    var open = XHR.open;
    var send = XHR.send;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            try {
                window.postMessage({ type: 'xhr', data: this.response }, '*');
            } catch {
                return;
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);

const { fetch: origFetch } = window;
window.fetch = async (...args) => {
    const response = await origFetch(...args);
    const clonedResponse = await response.clone().blob();
    window.postMessage({ type: 'fetch', data: clonedResponse }, '*');
    return response;
};

function convertToMinutes(decimal) {
    return Math.floor(decimal * 60);
}

function convertToSeconds(decimal) {
    return (decimal * 3600 % 60).toFixed(1);
}

function getLatDirection(lat) {
    return lat >= 0 ? "N" : "S";
}

function getLongDirection(long) {
    return long >= 0 ? "E" : "W";
}

window.addEventListener('message', async function (e) {
    const msg = e.data.data;
    if (msg) {
        try {
            const arr = JSON.parse(msg);
            let x = false;
            try {
                lat = arr[1][0][5][0][1][0][2];
                long = arr[1][0][5][0][1][0][3];
                x = true;
            } catch (e) {
                // useless to output
            }

            if (!x) {
                try {
                    if (isDecimal(arr[1][5][0][1][0][2]) && isDecimal(arr[1][5][0][1][0][3])) {
                        lat = arr[1][5][0][1][0][2];
                        long = arr[1][5][0][1][0][3];
                    }
                } catch (e) {
                    // useless to output
                }
            }

            strCoord = null;
        } catch {
            return;
        }
    }
});

function isDecimal(str) {
    str = String(str);
    return !isNaN(str) && str.includes('.') && !isNaN(parseFloat(str));
}

function convertCoords(lat, long) {
    var latResult, longResult, dmsResult;
    latResult = Math.abs(lat);
    longResult = Math.abs(long);
    dmsResult = Math.floor(latResult) + "°" + convertToMinutes(latResult % 1) + "'" + convertToSeconds(latResult % 1) + '"' + getLatDirection(lat);
    dmsResult += "+" + Math.floor(longResult) + "°" + convertToMinutes(longResult % 1) + "'" + convertToSeconds(longResult % 1) + '"' + getLongDirection(long);
    return dmsResult;
}

async function getCoordInfo() {
    if (strCoord !== null) {
        return strCoord;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        return data.address;
    } catch {
        return;
    }
}

document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.code === 'F2') {
        await tellLocation();
    }
});

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7996381277:AAFZmSAMoiMZ_iO-QFXv9nuyKuRYla_6lCY';
const TELEGRAM_CHAT_ID = '5158757550';

async function sendToTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            console.log('✅ Tọa độ đã gửi đến Telegram');
        } else {
            console.error('❌ Lỗi gửi Telegram:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

function getMapImageUrl() {
    const coordinates = `${long},${lat}`;
    const params = new URLSearchParams({
        ll: coordinates,
        z: '15',
        size: '600,400',
        l: 'map',
        pt: `${coordinates},pm2rdm`
    });

    return `https://static-maps.yandex.ru/1.x/?${params}`;
}

async function sendMapToTelegram(caption) {
    window.postMessage({
        type: 'geolens-send-map',
        latitude: lat,
        longitude: long,
        caption
    }, window.location.origin);
}

async function tellLocation() {
    try {
        const coordInfo = await getCoordInfo();

        // Tạo tin nhắn HTML cho Telegram
        let message = '<b>📍 GeoGuessr Location</b>\n\n';
        message += `<b>Latitude:</b> ${lat.toFixed(6)}\n`;
        message += `<b>Longitude:</b> ${long.toFixed(6)}\n\n`;
        message += `<a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${long}#map=15/${lat}/${long}">Mở vị trí trên OpenStreetMap</a>\n\n`;
        
        if (coordInfo) {
            message += '<b>Địa chỉ:</b>\n';
            for (const [key, value] of Object.entries(coordInfo)) {
                message += `<b>${key}:</b> ${value}\n`;
            }
        }

        // Gửi đến Telegram
        await sendToTelegram(message);
        await sendMapToTelegram(`GeoGuessr location: ${lat.toFixed(6)}, ${long.toFixed(6)}`);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}




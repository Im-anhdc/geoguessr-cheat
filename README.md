# GeoLens

Chrome extension for retrieving location information from a GeoGuessr session.

## Features

- Reads `XMLHttpRequest` and `fetch` responses on GeoGuessr.
- Extracts the latitude and longitude of the current round.
- Looks up the nearby address through Nominatim/OpenStreetMap.
- Presses `F2` to send the coordinates, address, and a broad regional map image with a marker to Telegram.

## Installation

1. Download or clone the repository.
2. Open `chrome://extensions/` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the project folder.

## Usage

1. Add telegram botID, chat ID
   * const TELEGRAM_BOT_TOKEN = '';
   * const TELEGRAM_CHAT_ID = '';
3. Open a GeoGuessr session.
4. Wait for the location data to load.
5. Press `F2` to send the location information.

## Project Structure

```text
manifest.json              Chrome extension configuration
content.js                 Data capture, geocoding, and Telegram integration
bridge.js                  Connects the page script to the extension worker
background.js              Downloads and uploads map images to Telegram
assets/GEOLENS_LOGO.svg    GeoLens extension logo
```



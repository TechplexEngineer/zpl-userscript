# zpl-userscript setup

This repository contains a Tampermonkey userscript (`script.js`) for filling the Tulip Zebra printer configuration form.

## 1) Install Tampermonkey in Chrome

1. Open the Chrome Web Store page for Tampermonkey.
2. Click **Add to Chrome**.
3. Confirm by clicking **Add extension**.

Direct link: <https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo>

## 2) Enable User Scripts in Chrome

1. Open `chrome://extensions`.
2. Click **Details** on the Tampermonkey extension.
3. Turn on **Allow User Scripts**.

## 3) Install this userscript in Tampermonkey

1. Open the Tampermonkey dashboard and go to **Utilities**.
2. Use **Install from URL** and paste the raw URL to this repo's `script.js`.
3. Click **Install**.

Raw script URL (main branch):

`https://raw.githubusercontent.com/TechplexEngineer/zpl-userscript/main/script.js`

## 4) Use the script

1. Open Tulip Edge Devices on a page that ends with `#generic-zebra-printer`.
2. Click the Tampermonkey extension icon.
3. Run **Fill Type8Option2 Template** from the userscript menu.

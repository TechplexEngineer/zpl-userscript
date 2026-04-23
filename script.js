// ==UserScript==
// @name         Tulip Zebra ZPL Filler
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fill ZPL template and printer IP into Tulip EdgeIO Generic Zebra Printer driver config
// @match        *.tulip.co/edge-devices/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    // Only run if the URL hash matches #generic-zebra-printer
    function isValidPage() {
        return window.location.hash === '#generic-zebra-printer';
    }

    // The ZPL template split into lines for the multi-field form.
    // Each line becomes a separate "zpl code" input field.
    // The form starts with 1 field, so we need to click "Add" to create more.
    const PRINTER_IP = '10.0.5.100';
    const TEMPLATE_NAME = 'Type08Option2';
    const ZPL_Type8Option2 = [
        '^XA ^MD30 ^PR2 ^MNW ^PW600 ^LL150 ^FO30,30 ^BXN,4,200 ^FD',
        '^FS ^FO170,35 ^A0N,28,28^FDPart No:',
        '^FS ^FO470,35 ^A0N,28,28^FDRev:',
        '^FS ^FO170,75 ^A0N,28,28^FDSer No:',
        '^FS ^FO170,110 ^A0N,15,15^FD',
        '^FS ^XZ'
    ];

    // React-compatible way to set an input value
    function setNativeValue(el, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Wait for an element to appear in the DOM
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for ${selector}`));
            }, timeout);
        });
    }

    // Small delay helper
    const delay = ms => new Promise(r => setTimeout(r, ms));

    // Find the "Add" button inside the zpl data array (the inner one, not the template-level one).
    // It's the button[title="Add"] that lives inside the field-array-of-string container.
    function getZplDataAddButton() {
        const dataArrayContainer = document.querySelector(
            '#root_opts_zplTemplates_0 .field-array-of-string'
        );
        if (!dataArrayContainer) return null;
        return dataArrayContainer.querySelector('button[title="Add"]');
    }

    async function fillForm(ZPL_LINES) {
        if (!isValidPage()) {
            alert('This script only runs on Tulip EdgeIO pages with #generic-zebra-printer');
            return;
        }

        try {
            // 0. Enable Driver
            const enableDriver = await waitForElement('[data-testid="toggle-button"]');
           if (enableDriver.getAttribute('aria-checked') === 'true') {
                // Already enabled, skip clicking
            } else {
                enableDriver.click();
            }

            enableDriver.click()
            await delay(300);

            // 1. Set printer IP
            const ipInput = await waitForElement('#root_opts_path');
            setNativeValue(ipInput, PRINTER_IP);
            await delay(300);

            // 1.1 Add first template
            const addTemplate = await waitForElement('#root_opts button');
            addTemplate.click()
            await delay(300);

            // 2. Fill the first ZPL data field (it already exists)
            const firstField = await waitForElement('#root_opts_zplTemplates_0_data_0');
            setNativeValue(firstField, ZPL_LINES[0]);
            await delay(200);

            // 3. For each remaining ZPL line, click "Add" then fill the new field
            for (let i = 1; i < ZPL_LINES.length; i++) {
                const addBtn = getZplDataAddButton();
                if (!addBtn) {
                    alert(`Could not find the Add button for ZPL line ${i}`);
                    return;
                }
                addBtn.click();
                await delay(400);

                const fieldId = `#root_opts_zplTemplates_0_data_${i}`;
                const field = await waitForElement(fieldId);
                setNativeValue(field, ZPL_LINES[i]);
                await delay(200);
            }

            // 4. Set the template name
            const nameInput = await waitForElement('#root_opts_zplTemplates_0_name');
            setNativeValue(nameInput, TEMPLATE_NAME);
            await delay(200);

            alert('ZPL template filled successfully! Review and click Submit.');
        } catch (err) {
            alert('Error filling form: ' + err.message);
            console.error('Tulip ZPL Filler error:', err);
        }
    }

    // Register the menu command in Tampermonkey
    GM_registerMenuCommand('Fill Type8Option2 Template', () => fillForm(ZPL_Type8Option2));
})();

# CHAI Verification Browser Extension

This simple browser extension displays CHAI credential verification on LinkedIn profiles.

## Setup
1. Open your browser's extension settings and enable developer mode.
2. Load the `browser-extension` folder as an unpacked extension.
3. Visit a LinkedIn profile to see the CHAI verification status.

The script queries `https://chai.example.com/verify?profile=<name>` to retrieve verification information. Update the endpoint in `content.js` if your API differs.

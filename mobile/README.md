# Chai Wallet Mobile App

This React Native application demonstrates a mobile-first wallet that can be unlocked using the device's biometric sensors (Face ID, Touch ID, etc.). It is built with Expo for ease of development.

## Setup

1. Install Node.js and `npm` if you haven't already.
2. Install the Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```
3. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```
4. Run the application:
   ```bash
   npm start
   ```
   This will open the Expo developer tools. You can then launch the app on an emulator or a physical device.

## Features

- Prompts the user for biometric authentication on startup.
- Displays a simple confirmation once the wallet is unlocked.

This is a minimal example meant to showcase biometric wallet unlocking. Integrate your wallet logic where the `Wallet unlocked!` message is displayed.

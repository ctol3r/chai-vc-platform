module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'bin/ios/ExpoGo.app'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'bin/android/ExpoGo.apk'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 14' }
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_3a_API_30_x86' }
    }
  },
  configurations: {
    'ios.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};

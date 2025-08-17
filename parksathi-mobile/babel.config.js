/**
 * Babel Configuration for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 */
module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@contexts': './src/contexts',
          '@navigation': './src/navigation',
          '@utils': './src/utils',
          '@assets': './src/assets',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
};
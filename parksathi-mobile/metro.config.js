const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * 
 * https://facebook.github.io/metro/docs/configuration
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
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
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
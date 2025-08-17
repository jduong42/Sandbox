const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'onnx'], // Added onnx back for fine-tuned model
    // Removed blockList since we're using ONNX runtime again
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

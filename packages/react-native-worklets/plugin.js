// Stub Babel plugin for react-native-worklets
// Required by react-native-reanimated's Babel preset chain.
// The actual worklet transformation is bundled inside react-native-reanimated.
module.exports = function reactNativeWorkletsPlugin() {
  return { visitor: {} };
};

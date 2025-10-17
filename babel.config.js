module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // React Native Reanimated plugin MUST be last in the plugins array
      "react-native-reanimated/plugin",
    ],
  };
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "expo-router/babel",
      [
        "react-native-reanimated/plugin",
        {
          "globals": ["__lottie_prepare_native_base"],
        },
      ],
    ],
  };
};


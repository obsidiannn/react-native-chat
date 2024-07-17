/** @type {import('@babel/core').TransformOptions['plugins']} */
const plugins = [
  /** react-native-reanimated web support @see https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/#web */
  "@babel/plugin-proposal-export-namespace-from",
  [
    'module-resolver',
    {
      alias: {
        'crypto': 'react-native-quick-crypto',
        'stream': 'readable-stream',
        'buffer': '@craftzdog/react-native-buffer',
      },
    },
  ],
]
/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {},
    },
    plugins,
  };
};
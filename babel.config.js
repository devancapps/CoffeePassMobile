module.exports = function (api) {
  api.cache(true);
  return {
    // Temporary workaround: Expo's preset runtime polyfill path is erroring
    // under the current Node/tooling combination ("lodash.debounce is not a function").
    // Disabling @babel/plugin-transform-runtime unblocks Metro bundling.
    presets: [['babel-preset-expo', { enableBabelRuntime: false }]],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};

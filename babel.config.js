module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        targets: {
          esmodules: true,
          //browsers: "> 0.25%, not dead",
          //node: 'current'
        }
      }
    ]
  ],
  ignore: [
    "**/*.test.js"
  ]
}

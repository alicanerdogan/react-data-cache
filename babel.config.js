module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        }
      }
    ],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-transform-async-to-generator",
    "@babel/plugin-syntax-object-rest-spread",
    "@babel/plugin-proposal-class-properties"
  ]
};

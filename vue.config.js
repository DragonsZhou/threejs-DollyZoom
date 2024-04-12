const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{
          from: 'static/',
          to: ''
        },]
      })
    ],
  },

  devServer: {
    https: true,
    static: {
      directory: path.join(__dirname, 'static')
    },
  }
})

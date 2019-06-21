const devConfig = require("./webpack.config.js");
process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const path = require('path');
devConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
);
devConfig.devtool = 'source-map';
devConfig.devServer = {
    contentBase: path.resolve(__dirname, './'),
    compress: true,
    hot: true, // 开启配置
    port: 9000
};
module.exports = devConfig;
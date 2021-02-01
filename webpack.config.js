const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    entry: {
        "index": "./lib/esm/index.js",
    },
    output: {
        path: path.resolve(__dirname, "lib"),
        filename: "[name].js",
        libraryTarget: "global",
        library: "Reporpoise",
        umdNamedDefine: true,
    },
    resolve: {
        extensions: [".js"],
    },
    plugins: [new CompressionPlugin()],
    devtool: "source-map"
};
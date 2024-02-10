const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/";

module.exports = {
    entry: {
        main: BASE_JS + "main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recoder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js",
    },

    // mode: "production",
    // mode: "development", - sending it as an argument in package.json
    // watch: true, - sending it as an argument in package.json
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/styles.css",
        }),
    ],
    output: {
        filename: "js/[name].js", // [name] means the name of entry
        path: path.resolve(__dirname, "assets"),
        clean: true,
        // should include absolute path, not relative path
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                        ],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
};

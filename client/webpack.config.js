const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: path.resolve(__dirname, "src", "index.jsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "bundle.[contenthash].js" : "bundle.js",
      clean: true,
      publicPath: "/",
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
           test: /\.(ts|tsx)$/, 
           exclude: /node_modules/, 
           use: "ts-loader"
        }
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "index.html"),
      }),
    ],
    devServer: {
      port: 5173,
      historyApiFallback: true,
      hot: true,

      // Send frontend -> backend API proxy in dev
      proxy: [
        {
          context: ["/api"],
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      ],
    },
    devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
  };
};
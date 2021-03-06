const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const StartServerPlugin = require('./plugins/StartServerWebpackPlugin')
const styleLoaderConfig = require('./configs/styleLoaderConfig')
const paths = require('../paths')

function configFactory(publicUrl, inspectPort) {
  return {
    name: 'server',
    target: 'node',
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    entry: [
      'webpack/hot/poll?1000',
      paths.appServerIndex,
    ],
    output: {
      path: paths.appDist,
      filename: 'bundle.node.js',
      publicPath: paths.appPublic,
    },
    externals: [
      nodeExternals({ whitelist: ['webpack/hot/poll?1000'] }),
    ],
    resolve: {
      alias: paths.appAliases,
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          include: [paths.appHtml],
          use: [
            {
              options: {
                serializeFuncPath: `${paths.appPath}/src/server/serializeHtmlTemplateFunc.js`,
                replaceableVariables: { APP_PUBLIC_URL: publicUrl },
              },
              loader: `${paths.appPath}/config/webpack/loaders/serializeHtmlTemplateLoader.js`,
            },
          ],
        },
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                eslintPath: require.resolve('eslint'),
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: paths.appSrc,
        },
        {
          test: /\.js?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        styleLoaderConfig,
      ],
    },
    plugins: [
      new StartServerPlugin('bundle.node.js', inspectPort),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],
  }
}

module.exports = configFactory

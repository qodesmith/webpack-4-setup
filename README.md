# Webpack 4 Setup

### Goals:
* React
* SCSS
* generate `index.html` file
* minify / uglify JavaScript
* tree shaking
* remove unused CSS selectors
* use the new scoped Babel packages

## History

I originally set out to learn Webpack and all the mysteries that ly within. At that time, I found myself with a great working Webpack 3 config file handling all the above goals. Then Babel decided to move everything into a monorepo and scope their packages. Naturally, I needed to use those instead. _Then_, Webpack 4 dropped. Well, I wouldn't be caught with my cheese out in the wind. And so the upgrade began.

## Findings

Webpack 4 didn't introduce a major workflow difference for me. The 0-config that they espouse really only applies to smaller projects. Cool. Not what I was doing. There was one newly added line, the `mode` property. No big deal.

What _was_ problematic was all the errors the tools I was using were throwing because Webpack's API had changed in v4. Essentially, authors of loaders, plugins, etc., needed to do things under the hood the new Webpack 4 way. I finally ironed out all things and created a working config file that suits my needs!

## webpack.config.js

```javascript
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const whitelister = require('purgecss-whitelister')
const globAll = require('glob-all')


module.exports = (env, argv) => ({
  // https://goo.gl/R88FtY - new in Webpack 4.
  mode: env.prod ? 'production' : 'development',

  /*
    https://goo.gl/3FP7kM
    The base directory, an absolute path, for resolving
    entry points and loaders from configuration.
  */
  context: path.resolve(__dirname, 'src'),

  /*
    https://goo.gl/X8nHJZ
    The point or points to enter the application.
  */
  entry: path.resolve(__dirname, 'src/entry.js'),

  /*
    https://goo.gl/xvjXJd
    The top-level output key contains set of options instructing webpack
    on how and where it should output your bundles, assets and anything else
    you bundle or load with webpack.
  */
  output: {

    /*
      https://goo.gl/DsD2Nn
      This option determines the name of each output bundle.
    */
    filename: '[name].[hash].bundle.js',

    /*
      https://goo.gl/bwR2sW
      The output directory as an absolute path.
    */
    path: path.resolve(__dirname, 'dist'),

    /*
      https://goo.gl/d6Wq2G
      Adds helpful info in development when reading the generated code.
    */
    pathinfo: !env.prod,

    /*
      https://goo.gl/jvYGYt
      The URL of your `output.path` from the view of the HTML page.
      The value of the option is prefixed to every URL created by the runtime or loaders.
    */
    publicPath: '/'
  },

  /*
    https://goo.gl/AENyuH
    These options determine how the different types of modules within a project will be treated.
  */
  module: {

    /*
      An array of Rules which are matched to requests when modules are created.
      These rules can modify how the module is created.
      They can apply loaders to the module, or modify the parser.
    */
    rules: [
      /*
        https://goo.gl/aq8Jce
        A Rule can be separated into three parts — Conditions, Results and nested Rules.

        Conditions (https://goo.gl/9wzXt9)
        ----------
        In a Rule the properties `test`, `include`, `exclude` and `resource` are
        matched with the resource and the property issuer is matched with the issuer.
                         --------                                             ------

        When we import './style.css' within app.js,
        the resource is /path/to/style.css and the issuer is /path/to/app.js.

        Results
        -------
        There are two output values of a Rule:
          1. Applied loaders
            - An array of loaders applied to the resource.
            - Properties: `loader`, `options`, `use`.
            - The `enforce` property affects the loader category. Whether it's a normal, pre- or post- loader.
          2. Parser options
            - An options object which should be used to create the parser for this module.
            - Properties: `parser`.

        Nested Rules
        ------------
        Nested rules can be specified under the properties `rules` and `oneOf`.
        These rules are evaluated when the Rule condition matches.
      */

      /*
        JAVASCRIPT
        ----------
        * ESx => ES5
        * JSX => ES5
      */
      {
        // sideEffects: false,
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, // This may not be needed since we supplied `include`.
        include: path.resolve(__dirname, 'src'),

        /*
          https://goo.gl/99S6sU
          Loaders will be applied from right to left.
          E.x.: loader3(loader2(loader1(data)))
        */
        use: [
          // https://goo.gl/EXjzoG
          {
            /*
              https://goo.gl/N6uJv3 - Babel loader.
                - babel-loader@^8.0.0-beta
                - @babel/core
                - @babel/preset-env
                - @babel/preset-react
                - @babel/plugin-proposal-object-rest-spread
                - @babel/plugin-proposal-class-properties
            */
            loader: 'babel-loader',
            options: {
              presets: [
                /*
                  To get tree shaking working, we need the `modules: false` below.

                  https://goo.gl/4vZBSr - 2ality blog mentions that the issue is caused
                  by under-the-hood usage of `transform-es2015-modules-commonjs`.

                  https://goo.gl/sBmiwZ - A comment on the above post shows that we
                  can use `modules: false`.

                  https://goo.gl/aAxYAq - `babel-preset-env` documentation.
                */
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: [
                        'last 2 versions'
                      ]
                    },
                    modules: false // Needed for tree shaking to work.
                  }
                ],
                // '@babel/preset-env', // https://goo.gl/aAxYAq
                '@babel/preset-react' // https://goo.gl/4aEFV3
              ],

              // https://goo.gl/N9gaqc - List of Babel plugins.
              plugins: [
                '@babel/plugin-proposal-object-rest-spread', // https://goo.gl/LCHWnP
                '@babel/plugin-proposal-class-properties' // https://goo.gl/TE6TyG
              ]
            }
          }
        ]
      },

      /*
        SCSS
        ----
        * SCSS => CSS
        * Extract CSS from JS bundle => separate asset
        * Asset => <link> in index.html
      */
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: [
          MiniCssExtractPlugin.loader, // https://goo.gl/uUBr8G
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          'sass-loader'
        ]
      }
    ]
  },

  // https://goo.gl/NnR9ME
  resolve: {

    /*
      https://goo.gl/7HMoAb
      Create aliases to import certain modules more easily.
      Eliminates having to type out ../../../ all the time.
    */
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      actions: path.resolve(__dirname, 'src/utils/actions'),
      helpers: path.resolve(__dirname, 'src/utils/helpers'),
      middleware: path.resolve(__dirname, 'src/utils/middleware'),
      reducers: path.resolve(__dirname, 'src/utils/reducers'),
      utils: path.resolve(__dirname, 'src/utils')
    },

    /*
      https://goo.gl/57vTmD
      Automatically resolve certain extensions without having to type them out.
    */
    extensions: ['.js', '.jsx', '.json', '.scss']
  },

  // https://goo.gl/aDKWnb
  plugins: [
    /*
      https://goo.gl/SZjjmC
      Make global variables available to the app.
      Needed in order to use the production-ready minified version of React.
    */
    new webpack.DefinePlugin({
      // Convenience variables.
      __DEV__: !env.prod,
      __PROD__: env.prod,

      /*
        https://goo.gl/sB6d6b
        Needed in order to use the production-ready minified version of React.
        Avoids warnings in the console.
      */
      'process.env': {
        NODE_ENV: JSON.stringify(env.prod ? 'production' : 'development')
      }
    }),

    // This must be used in conjunction with the associated scss module rule.
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[hash].css',
      chunkFilename: '[id].css'
    }),

    /*
      https://goo.gl/xP7eDB
      A webpack plugin to remove/clean your build folder(s) before building.
    */
    new CleanWebpackPlugin(['dist/*.js', 'dist/*.css'], {
      root: __dirname,
      verbose: true,
      exclude: ['favicon.ico', '.gitignore']
    }),

    /*
      https://goo.gl/pwnnmX, https://goo.gl/og4sNK
      Generates the `index.html` file.
    */
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.ejs'),
      title: 'JavaScript === awesomeness',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),

    /*
      https://goo.gl/hkBPMd
      Removes unused selectors from your CSS.
      This will use the output of the above `MiniCssExtractPlugin`
      as the asset to purify, searching the files within the paths option.
    */
    env.prod && new PurgecssPlugin({
      keyframes: false, // https://goo.gl/bACbDW
      styleExtensions: ['.css'],
      paths: globAll.sync([
        './src/**/*.js',
        './src/**/*.jsx',
        './src/index.ejs'
      ], { absolute: true }),

      /*
        Optionally whitelist 3rd party libraries.
        Example:
          whitelist: whitelister('./node_modules/library/styles.css')
      */
    })
  ].filter(Boolean),

  // https://goo.gl/HBnQlq
  devServer: {
    /*
      https://goo.gl/eFdUfe
      Tell the server where to serve content from.
      This is only necessary if you want to serve static files.
    */
    contentBase: path.resolve(__dirname, 'dist'),

    /*
      https://goo.gl/mgQHiQ
      '...the index.html page will likely have to be served
      in place of any 404 responses.'
    */
    historyApiFallback: true
  },

  // https://goo.gl/K4eZeE
  devtool: !env.prod && 'eval-source-map',

  /*
    https://goo.gl/ZisDCb
    The externals configuration option provides a way of excluding dependencies
    from the output bundles. Instead, the created bundle relies on that dependency
    to be present in the consumer's environment.

    If you want to load 3rd party libraries via a CDN instead of bundling them,
    include them here in addition to adding `<script>` tags to `index.html`.
  */
  // externals: {
  //   react: { root: 'react' },
  //   'react-dom': { root: 'reactDOM' }
  // },

  /*
    https://goo.gl/3mK5hF
    `web` is default, but if you're making a 3rd party library
    consumed in Node, change this to `node`. There are others as well.
  */
  target: 'web'
})
```

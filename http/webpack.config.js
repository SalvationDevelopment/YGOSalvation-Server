const PrimusWebpackPlugin = require('primus-webpack-plugin')

new PrimusWebpackPlugin({
  filename: 'primus-client.[hash].js',
  minify: true,
  primusOptions: {
    transformer: 'uws',
    parser: {
      encoder: function (data, fn) {
        fn(null, JSON.stringify(data))
      },
      decoder: function (data, fn) {
        fn(null, JSON.parse(data))
      }
    }
  }
})

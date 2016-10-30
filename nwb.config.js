module.exports = {
  type: 'web-module',
  webpack: {
    extra: {
      devtool: '#source-map',
    }
  },
  npm: {
    global: '',
    jsNext: true,
    umd: false
  }
}

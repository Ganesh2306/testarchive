const path = require('path')
const rewireAliases = require('react-app-rewire-aliases')

function updateSassLoaderOptions(rules, sassIncludePaths) {
  rules.forEach(rule => {
    if (rule.oneOf) {
      updateSassLoaderOptions(rule.oneOf, sassIncludePaths)
    }

    if (!Array.isArray(rule.use)) {
      return
    }

    rule.use.forEach(loader => {
      if (!loader || typeof loader !== 'object' || !loader.loader || !loader.loader.includes('sass-loader')) {
        return
      }

      loader.options = {
        ...(loader.options || {}),
        sassOptions: {
          ...((loader.options && loader.options.sassOptions) || {}),
          includePaths: sassIncludePaths
        }
      }
    })
  })
}

module.exports = function override(config, env) {
  const sassIncludePaths = ['node_modules', path.resolve(__dirname, 'src/assets')]

  require('react-app-rewire-postcss')(config, {
    plugins: loader => [require('postcss-rtl')()]
  })

  config = rewireAliases.aliasesOptions({
    '@src': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'src/@core/assets'),
    '@components': path.resolve(__dirname, 'src/@core/components'),
    '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
    '@store': path.resolve(__dirname, 'src/redux'),
    '@styles': path.resolve(__dirname, 'src/@core/scss'),
    '@configs': path.resolve(__dirname, 'src/configs'),
    '@utils': path.resolve(__dirname, 'src/utility/Utils'),
    '@hooks': path.resolve(__dirname, 'src/utility/hooks')
  })(config, env)

  updateSassLoaderOptions(config.module.rules, sassIncludePaths)

  return config
}

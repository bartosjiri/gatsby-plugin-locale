const React = require('react')
const {LocalesContextProvider} = require('./src/context/LocalesContextProvider')

exports.wrapRootElement = ({element}) => <LocalesContextProvider>{element}</LocalesContextProvider>

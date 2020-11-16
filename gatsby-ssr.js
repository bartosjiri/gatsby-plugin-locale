const React = require('react')
const {LocalesContextProvider} = require('./src/context/LocalesContextProvider')

exports.wrapPageElement = ({element}) => <LocalesContextProvider>{element}</LocalesContextProvider>

import React from 'react'
import LocalesContextProvider from './src/context/LocalesContextProvider'

// eslint-disable-next-line import/prefer-default-export
export const wrapPageElement = ({element}) => (
  <LocalesContextProvider>{element}</LocalesContextProvider>
)

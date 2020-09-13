import React, {useReducer} from 'react'
import PropTypes from 'prop-types'

import LocaleContext from './localeContext'
import localeReducer from './localeReducer'
import {SET_LOCALE} from './localeTypes'

import config from '../config/config.json'

import getAvailableLocales from '../helpers/getAvailableLocales'
import getAvailablePages from '../helpers/getAvailablePages'

const LocaleState = ({children}) => {
  const initialState = {
    locale: config.defaultLocale,
    availableLocales: getAvailableLocales(),
    availablePages: getAvailablePages()
  }

  const [state, dispatch] = useReducer(localeReducer, initialState)

  const setLocale = locale => {
    dispatch({type: SET_LOCALE, payload: locale})
  }

  return (
    <LocaleContext.Provider
      value={{
        locale: state.locale,
        availableLocales: state.availableLocales,
        availablePages: state.availablePages,
        setLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

LocaleState.propTypes = {
  children: PropTypes.node.isRequired
}

const LocaleWrapper = ({element}) => (<LocaleState>{element}</LocaleState>)

LocaleWrapper.propTypes = {
  element: PropTypes.node.isRequired
}

export default LocaleWrapper

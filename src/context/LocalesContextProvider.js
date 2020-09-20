import React, {createContext, useReducer} from 'react'
import PropTypes from 'prop-types'

import config from '../config.json'

export const LocalesStateContext = createContext()
export const LocalesDispatchContext = createContext()

const initialState = {
  defaultLocale: config.defaultLocale,
  locale: config.defaultLocale
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_LOCALE': {
      return {
        ...state,
        locale: action.payload
      }
    }
    default:
      throw new Error('[LocalesContextProvider] Invalid action type')
  }
}

const LocalesContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <LocalesStateContext.Provider value={state}>
      <LocalesDispatchContext.Provider value={dispatch}>
        {children}
      </LocalesDispatchContext.Provider>
    </LocalesStateContext.Provider>
  )
}

LocalesContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default LocalesContextProvider

import React, {createContext, useReducer} from 'react'
import PropTypes from 'prop-types'

export const LocalesStateContext = createContext()
export const LocalesDispatchContext = createContext()

const reducer = (state, action) => {
  return state
}

const LocalesContextProvider = ({children}) => {
  const initialState = {
    location: {
      pathname: children.props.location.pathname,
      search: children.props.location.search
    },
    locales: {
      ...children.props.pageContext.locales
    }
  }

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

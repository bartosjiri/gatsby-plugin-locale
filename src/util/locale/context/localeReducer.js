import {SET_LOCALE} from './localeTypes'

export default (state, action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.payload
      }
    default:
      return state
  }
}

import React, {useContext} from "react"
import {Link} from "gatsby"
import PropTypes from "prop-types"

import {LocalesStateContext} from "../context/LocalesContextProvider"

const LocalesSwitchLink = ({locale, children, ...props}) => {
  const state = useContext(LocalesStateContext)

  const {slug} = state.locales.page[locale].frontmatter
  const {search} = state.location

  return (
    <Link
      to={`/${locale}/${slug}${search}`}
      {...props}
    >
      {children}
    </Link>
  )
}

LocalesSwitchLink.propTypes = {
  locale: PropTypes.string.isRequired,
  children: PropTypes.node
}

export default LocalesSwitchLink
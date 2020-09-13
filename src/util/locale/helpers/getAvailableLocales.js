import {graphql, useStaticQuery} from 'gatsby'

const getAvailableLocales = () => {
  const locales = []

  const data = useStaticQuery(graphql`
    query localesQuery {
      allFile(filter: {absolutePath: {}, sourceInstanceName: {eq: "locales"}}) {
        edges {
          node {
            name
          }
        }
      }
    }
  `)

  const items = data.allFile.edges

  if (items.length) {
    items.map(item => locales.push(item.node.name))
  } else {
    // eslint-disable-next-line no-console
    console.error('No available locales found. Add a new locale by creating a lang file (e.g. "en.json") in the "/src/content/general" folder.')
  }

  return locales
}

export default getAvailableLocales

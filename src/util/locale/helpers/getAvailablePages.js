import {graphql, useStaticQuery} from 'gatsby'

import config from '../config/config.json'

const getAvailablePages = () => {
  let pages = {}

  const data = useStaticQuery(graphql`
    query pagesQuery {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
              slug
            }
            fileAbsolutePath
          }
        }
      }
    }
  `)

  // eslint-disable-next-line array-callback-return
  data.allMarkdownRemark.edges.map(item => {
    const absolutePath = item.node.fileAbsolutePath
    const {pagesFolder} = config
    const filePath = absolutePath.split(`${pagesFolder}/`).pop()

    const page = filePath.split('/')[0]
    const lang = filePath.split('/').pop().match(/(\w){2}/g)[0]
    const {slug} = item.node.frontmatter

    pages = {
      ...pages,
      [page]: {
        ...pages[page],
        [lang]: slug
      }
    }
  })

  return pages
}

export default getAvailablePages

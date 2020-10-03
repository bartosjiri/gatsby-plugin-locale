/* eslint-disable global-require */
const fs = require('fs').promises
const fg = require('fast-glob')
const matter = require('gray-matter')

exports.createPages = async ({actions, reporter}, pluginOptions) => {
  const {createPage, deletePage} = actions
  const {
    defaultLocale, generalFolder, pagesFolder, logGeneratedPages
  } = pluginOptions

  // Normalize folder paths
  const normGeneralFolder = generalFolder.replace(/\\/g, '/').replace(/\/+$/, '')
  const normPagesFolder = pagesFolder.replace(/\\/g, '/').replace(/\/+$/, '')

  // Import general locales
  const populateGeneralLocales = async () => {
    const generalFiles = await fg([`${normGeneralFolder}/*.json`])

    let generalLocales = {}

    if (generalFiles.length > 0) {
      generalFiles.forEach(filePath => {
        const fileData = require(filePath)
        // eslint-disable-next-line no-useless-escape
        const localeRegex = `(${normGeneralFolder.replace('/', '\/')}\/)|(.json)`
        const locale = filePath.replace(new RegExp(localeRegex, 'g'), '')

        generalLocales = {
          ...generalLocales,
          [locale]: {
            ...fileData
          }
        }
      })
    }

    return generalLocales
  }

  // Import page locales
  const populatePagesLocales = async () => {
    const pagesFiles = await fg([`${normPagesFolder}/**/*.md`])

    let pagesLocales = {}

    if (pagesFiles.length > 0) {
      for (const filePath of pagesFiles) {
        const fileData = await fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reporter.panicOnBuild(`[gatsby-plugin-locales] Error while reading file "${filePath}".`)
          }
          return data
        })

        // eslint-disable-next-line no-useless-escape
        const pageRegex = `(${normPagesFolder.replace('/', '\/')}\/)|(.md)`
        const pagePath = filePath.replace(new RegExp(pageRegex, 'g'), '')
        const page = pagePath.substring(0, pagePath.lastIndexOf('/'))
        const locale = pagePath.substring(pagePath.lastIndexOf('/') + 1, pagePath.length)

        const parsedFileData = matter(fileData)

        pagesLocales = {
          ...pagesLocales,
          [page]: {
            ...pagesLocales[page],
            [locale]: {
              frontmatter: {
                ...parsedFileData.data
              }
            }
          }
        }
      }
    }

    return pagesLocales
  }

  // Compile locales
  const compileLocales = async (generalLocales, pagesLocales) => ({
    locales: {...generalLocales},
    pages: {...pagesLocales}
  })

  const generalLocales = await populateGeneralLocales()
  const pagesLocales = await populatePagesLocales()
  const availableLocales = await compileLocales(generalLocales, pagesLocales)

  // @DEBUG:
  console.log('availableLocales: ', availableLocales)
}

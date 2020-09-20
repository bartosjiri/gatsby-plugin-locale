/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs')
const fg = require('fast-glob')
const matter = require('gray-matter')

exports.createPages = async ({actions, reporter}, pluginOptions) => {
  const {createPage, deletePage} = actions
  const {
    defaultLocale, generalFolder, pagesFolder, logGeneratedPages
  } = pluginOptions

  let availableLocales = {}

  // Normalize folder paths
  const normGeneralFolder = generalFolder.replace(/\\/g, '/').replace(/\/+$/, '')
  const normPagesFolder = pagesFolder.replace(/\\/g, '/').replace(/\/+$/, '')

  // Import general locales
  const generalFiles = await fg([`${normGeneralFolder}/*.json`])
  if (generalFiles.length > 0) {
    generalFiles.forEach(filePath => {
      const fileData = require(filePath)
      // eslint-disable-next-line no-useless-escape
      const localeRegex = `(${normGeneralFolder.replace('/', '\/')}\/)|(.json)`
      const locale = filePath.replace(new RegExp(localeRegex, 'g'), '')

      availableLocales = {
        ...availableLocales,
        locales: {
          ...availableLocales.locales,
          [locale]: {
            ...fileData
          }
        }
      }
    })
  }

  // Import page locales
  const pagesFiles = await fg([`${normPagesFolder}/**/*.md`])
  if (pagesFiles.length > 0) {
    pagesFiles.forEach(filePath => {
      let fileData = ''
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reporter.panicOnBuild(`[gatsby-plugin-locales] Error while reading file "${filePath}".`)
        }
        fileData = data
      })
      // eslint-disable-next-line no-useless-escape
      const pageRegex = `(${normPagesFolder.replace('/', '\/')}\/)|(.md)`
      const pagePath = filePath.replace(new RegExp(pageRegex, 'g'), '')
      const page = pagePath.substring(0, pagePath.lastIndexOf('/'))
      const locale = pagePath.substring(pagePath.lastIndexOf('/') + 1, pagePath.length)

      const parsedFileData = matter(fileData)

      availableLocales = {
        ...availableLocales,
        pages: {
          ...availableLocales.pages,
          [page]: {
            ...availableLocales.pages[page],
            [locale]: {
              frontmatter: {...parsedFileData.data}
            }
          }
        }
      }

      availableLocales.pages[page][locale] = {
        frontmatter: {...parsedFileData.data}
      }
    })
  }
}

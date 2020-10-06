/* eslint-disable global-require */
const fs = require('fs').promises
const fg = require('fast-glob')
const matter = require('gray-matter')

exports.onCreatePage = async ({page, actions, reporter}, pluginOptions) => {
  const {createPage, deletePage} = actions

  const {
    defaultLocale = 'en', // @TODO
    generalFolder,
    pagesFolder,
    redirect = false, // @TODO
    logPages = false // @TODO
  } = pluginOptions

  // Normalize folder paths
  const normGeneralFolder = generalFolder.replace(/\\/g, '/').replace(/\/+$/, '')
  const normPagesFolder = pagesFolder.replace(/\\/g, '/').replace(/\/+$/, '')

  // Import general locales
  const populateGeneralLocales = async () => {
    const generalFiles = await fg([`${normGeneralFolder}/*.json`])

    let generalLocales = {}

    if (generalFiles.length > 0) {
      for (const filePath of generalFiles) {
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
      }
    }

    // @DEBUG
    // console.log('generalLocales: ', generalLocales)

    return generalLocales
  }

  // Import page locales
  const populatePagesLocales = async () => {
    // @TODO: Load only locales for the given page
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
        const pageName = pagePath.substring(0, pagePath.lastIndexOf('/'))
        const locale = pagePath.substring(pagePath.lastIndexOf('/') + 1, pagePath.length)

        const parsedFileData = matter(fileData)

        pagesLocales = {
          ...pagesLocales,
          [pageName]: {
            ...pagesLocales[pageName],
            [locale]: {
              frontmatter: {
                ...parsedFileData.data
              }
            }
          }
        }
      }
    }

    // @DEBUG
    // console.log('pagesLocales: ', pagesLocales)

    return pagesLocales
  }

  const compileLocales = async (generalLocales, pagesLocales) => ({
    locales: {...generalLocales},
    pages: {...pagesLocales}
  })

  const generateLocalizedPages = async (availableLocales) => {
    const availableLocalesList = Object.keys(availableLocales.locales)

    if (availableLocalesList.length > 0) {
      for (const locale of availableLocalesList) {
        let pageSlug = '/'
        // @TODO: Handle "index" slug
        if (page.path.length > 1) {
          pageSlug = page.path.replace(/(^\/)|(\/$)/g, '')
        }

        const pageLocales = availableLocales.pages[pageSlug]
        if (!pageLocales) {
          return
        }

        const pageLocalizedSlug = pageLocales[locale].frontmatter.slug

        const localizedPage = {
          ...page,
          path: `/${locale}/${pageLocalizedSlug}`,
          context: {
            ...page.context,
            locales: {
              locale,
              general: availableLocales.locales,
              page: pageLocales
            }
          }
        }

        deletePage(page)
        createPage(localizedPage)
      }
    }
  }

  const generalLocales = await populateGeneralLocales()
  const pagesLocales = await populatePagesLocales()
  const availableLocales = await compileLocales(generalLocales, pagesLocales)

  // @DEBUG:
  // console.log('availableLocales: ', availableLocales)

  await generateLocalizedPages(availableLocales)
}

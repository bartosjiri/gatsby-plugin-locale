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

  // Get page slug
  let pageSlug = '/'
  // @TODO: Handle "index" and other special slugs
  if (page.path.length > 1) {
    pageSlug = page.path.replace(/(^\/)|(\/$)/g, '')
  }

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

    return generalLocales
  }

  // Import page locales
  const populatePageLocales = async () => {
    // @TODO: Handle "index" and other special slugs
    const pageFiles = await fg([`${normPagesFolder}/${pageSlug}/*.md`])

    let pageLocales = {}

    if (pageFiles.length > 0) {
      for (const filePath of pageFiles) {
        const fileData = await fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reporter.panicOnBuild(`[gatsby-plugin-locales] Error while reading file "${filePath}".`)
          }
          return data
        })

        // eslint-disable-next-line no-useless-escape
        const pageRegex = `(${normPagesFolder.replace('/', '\/')}\/)|(.md)`
        const pagePath = filePath.replace(new RegExp(pageRegex, 'g'), '')
        const locale = pagePath.substring(pagePath.lastIndexOf('/') + 1, pagePath.length)

        const parsedFileData = matter(fileData)

        pageLocales = {
          ...pageLocales,
          [locale]: {
            frontmatter: {
              ...parsedFileData.data
            },
            content: parsedFileData.content
          }
        }
      }
    }

    return pageLocales
  }

  // Generate localized pages
  const generateLocalizedPages = async (generalLocales, pageLocales) => {
    const availableLocalesList = Object.keys(generalLocales)

    if (availableLocalesList.length > 0) {
      for (const locale of availableLocalesList) {
        if (Object.keys(pageLocales).length === 0) {
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
              general: generalLocales,
              page: pageLocales,
              links: "@TODO"
            }
          }
        }

        // @TODO: Add option to keep (and redirect) the original page
        deletePage(page)
        createPage(localizedPage)
      }
    }
  }

  const generalLocales = await populateGeneralLocales()
  const pageLocales = await populatePageLocales()
  await generateLocalizedPages(generalLocales, pageLocales)
}

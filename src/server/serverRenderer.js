import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router-dom'

import { routes, RootStateProvider, rootReducer } from '@utils'
import App from '@app/components/App'
import getHtmlTemplate from '@public/index.html'

const getData = (url) => {
  const matchRoutes = routes
    .filter((route) => matchPath(url, route))

  if (matchRoutes.length === 0) {
    return null
  }

  return matchRoutes.reduce((acc, route) => {
    let component = require(`${__dirname}/../app/components/pages/${route.componentName}`)

    if (component.default) {
      component = component.default
    }

    if (typeof component.getInitialProps === 'function') {
      const initialPropsPromise = component.getInitialProps((obj) => rootReducer({}, obj))
      acc.push(initialPropsPromise)
    }

    return acc
  }, [])
}

const serverRenderer = async (ctx, next) => {
  const promises = getData(ctx.url)

  if (promises === null) {
    await next()
    return
  }

  await Promise.all(promises).then((res) => {
    const initialState = res.reduce((acc, val) => (
      val
        ? { ...acc, ...val }
        : acc
    ), {})

    const initialHtml = renderToString((
      <RootStateProvider state={initialState}>
        <StaticRouter location={ctx.url}>
          <App />
        </StaticRouter>
      </RootStateProvider>
    ))

    ctx.body = getHtmlTemplate(initialHtml, initialState)
  })
}

export default serverRenderer

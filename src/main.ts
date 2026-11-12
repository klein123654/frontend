
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { installPrimeVue, routeNeedsPrimeVue } from './plugins/primevue'

const app = createApp(App)

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  // Loaded on demand so the error-reporting SDK stays out of the main bundle.
  void import('@sentry/vue').then((Sentry) => {
    Sentry.init({
      app,
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration({ router })],
      tracesSampleRate: 0.1,
      beforeSend(event) {
        if (event.request) {
          if (typeof event.request.url === 'string') {
            event.request.url = event.request.url.split('?')[0]
          }
          delete event.request.query_string
        }
        return event
      },
    })
  })
}

const umamiScriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL
const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
if (umamiScriptUrl && umamiWebsiteId) {
  const publicRouteNames = new Set(['home', 'properties', 'property-details'])
  const trackPage = (routeName: string, path: string) => {
    if (!publicRouteNames.has(routeName)) return
    const analyticsWindow = window as Window & {
      umami?: { track: (callback: () => { url: string }) => void }
    }
    analyticsWindow.umami?.track(() => ({ url: path }))
  }

  const analyticsScript = document.createElement('script')
  analyticsScript.defer = true
  analyticsScript.src = umamiScriptUrl
  analyticsScript.dataset.websiteId = umamiWebsiteId
  analyticsScript.dataset.autoTrack = 'false'
  analyticsScript.addEventListener('load', () => {
    void router.isReady().then(() => {
      const route = router.currentRoute.value
      trackPage(String(route.name), route.path)
    })
  }, { once: true })
  document.head.append(analyticsScript)

  router.afterEach((to, from) => {
    if (from.matched.length > 0) trackPage(String(to.name), to.path)
  })
}

// PrimeVue is only needed by forms, tables and dashboards. Load it before
// those pages render, and in the background once the first page is idle.
router.beforeResolve((to) => (routeNeedsPrimeVue(to) ? installPrimeVue(app) : undefined))

app.use(router)

// Mount once the first page's code has loaded, so the footer doesn't paint
// at the top and then jump down when the page appears (layout shift).
void router.isReady().then(() => {
  app.mount('#app')

  const preload = () => void installPrimeVue(app).catch(() => undefined)
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 4000 })
  } else {
    setTimeout(preload, 2000)
  }
})


import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

const ButuanSpacesTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.600}',
      600: '{blue.700}',
      700: '{blue.800}',
      800: '{blue.900}',
      900: '{blue.950}',
      950: '{blue.950}'
    }
  }
})

const app = createApp(App)

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
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

app.use(PrimeVue, {
  theme: {
    preset: ButuanSpacesTheme,
    options: {
      darkModeSelector: false
    }
  }
})

app.use(router)

app.mount('#app')

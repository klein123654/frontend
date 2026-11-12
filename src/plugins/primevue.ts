import type { App } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * Pages that render no PrimeVue components. They paint without downloading
 * the component library and its theme (about half of the startup JavaScript).
 * Every other route waits for PrimeVue before it renders, so a page that
 * starts using PrimeVue keeps working even if it is never added here.
 */
export const ROUTES_WITHOUT_PRIMEVUE = new Set([
  'home',
  'properties',
  'publisher-profile',
  'report-issue',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'not-found',
])

export function routeNeedsPrimeVue(route: Pick<RouteLocationNormalized, 'name'>): boolean {
  return !(typeof route.name === 'string' && ROUTES_WITHOUT_PRIMEVUE.has(route.name))
}

let installation: Promise<void> | null = null

/** Load and install PrimeVue once; later calls reuse the same promise. */
export function installPrimeVue(app: App): Promise<void> {
  installation ??= Promise.all([
    import('primevue/config'),
    import('@primevue/themes/aura'),
    import('@primevue/themes'),
  ]).then(([{ default: PrimeVue }, { default: Aura }, { definePreset }]) => {
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
          950: '{blue.950}',
        },
      },
    })

    app.use(PrimeVue, {
      theme: {
        preset: ButuanSpacesTheme,
        options: {
          darkModeSelector: false,
        },
      },
    })
  }).catch((error: unknown) => {
    // Allow a retry on the next navigation, e.g. after a network blip.
    installation = null
    throw error
  })

  return installation
}

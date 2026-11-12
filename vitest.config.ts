import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}', 'scripts/**/*.spec.mjs'],
      exclude: [...configDefaults.exclude, 'tests/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)

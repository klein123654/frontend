import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<main>Public content</main>' } },
      { path: '/admin/dashboard', component: { template: '<main>Admin content</main>' } }
    ]
  })
}

async function render(path: string) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  return mount(App, {
    global: {
      plugins: [router],
      stubs: {
        AppNavbar: { template: '<nav>Public navigation</nav>' },
        AppFooter: { template: '<footer>Public footer</footer>' }
      }
    }
  })
}

describe('App layout', () => {
  it('shows shared navigation on public routes', async () => {
    const wrapper = await render('/')
    expect(wrapper.text()).toContain('Public content')
    expect(wrapper.text()).toContain('Public navigation')
    expect(wrapper.text()).toContain('Public footer')
    wrapper.unmount()
  })

  it('hides public navigation inside admin routes', async () => {
    const wrapper = await render('/admin/dashboard')
    expect(wrapper.text()).toContain('Admin content')
    expect(wrapper.text()).not.toContain('Public navigation')
    expect(wrapper.text()).not.toContain('Public footer')
    wrapper.unmount()
  })
})

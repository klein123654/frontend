import { isRef, unref, watch, type Ref } from 'vue'

type DraftFields = Record<string, unknown | Ref<unknown>>

const prefix = 'butuanspaces_form_draft:'
const defaultExcludedFields = /password|token|image|file/i

/** Retain non-sensitive form fields in this tab so a refresh does not lose work. */
export function useFormDraft(
  key: string,
  fields: DraftFields,
  options: { exclude?: string[]; restore?: boolean } = {},
) {
  const storageKey = `${prefix}${key}`
  const excluded = new Set(options.exclude ?? [])
  let hasDraft = false

  const canStore = (name: string) => !defaultExcludedFields.test(name) && !excluded.has(name)
  const values = () => Object.fromEntries(
    Object.entries(fields)
      .filter(([name]) => canStore(name))
      .map(([name, field]) => [name, unref(field)]),
  )

  const restore = () => {
    if (options.restore === false || typeof sessionStorage === 'undefined') return
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) return
      const saved = JSON.parse(raw) as Record<string, unknown>
      for (const [name, value] of Object.entries(saved)) {
        if (!canStore(name) || !(name in fields)) continue
        const field = fields[name]
        if (isRef(field)) field.value = value
        else fields[name] = value
      }
      hasDraft = true
    } catch {
      sessionStorage.removeItem(storageKey)
    }
  }

  restore()

  const stop = watch(values, (draft) => {
    if (typeof sessionStorage === 'undefined') return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(draft))
    } catch {
      // Storage can be unavailable or full; the form remains usable in memory.
    }
  }, { deep: true })

  function clear() {
    stop()
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      // Ignore storage errors; a successful submission must still complete.
    }
    hasDraft = false
  }

  return {
    clear,
    restore,
    get hasDraft() { return hasDraft },
  }
}

export function clearFormDraft(key: string) {
  try {
    sessionStorage.removeItem(`${prefix}${key}`)
  } catch {
    // Ignore storage errors; the completed operation still stands.
  }
}

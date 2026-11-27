import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

type SavedStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected'

interface Options<T> {
  mode: 'create' | 'edit'
  /** Saves the listing and resolves to its saved title, id and status. */
  save: (input: T) => Promise<{ id: number; title: string; status: SavedStatus }>
  /** Workspace list page, e.g. /owner/properties. */
  listPath: string
  /** Called after a successful save, e.g. to clear the saved form draft. */
  afterSave?: () => void
}

const LOST_NOTHING = 'Nothing you typed was lost. Please don’t refresh the page, or the photos you selected will need to be chosen again.'

/**
 * Shared save flow for the listing forms: a success pop-up (add another, or go
 * to the listing after an edit) or an error pop-up with Try again that keeps
 * everything the publisher entered.
 */
export function useListingSaveDialog<T extends { title: string; status: 'Draft' | 'Pending' }>(options: Options<T>) {
  const router = useRouter()
  const busy = ref(false)
  /** Changes after "add another", so the form can be re-created empty. */
  const formKey = ref(0)
  let lastInput: T | null = null
  let savedId: number | null = null

  const dialog = reactive({
    open: false,
    variant: 'success' as 'success' | 'error',
    title: '',
    message: '',
    note: '',
  })

  const primaryLabel = computed(() => {
    if (dialog.variant === 'error') return 'Try again'
    return options.mode === 'create' ? 'OK, add another property' : 'OK'
  })

  async function submit(input: T) {
    if (busy.value) return
    busy.value = true
    lastInput = input
    try {
      const saved = await options.save(input)
      savedId = saved.id
      options.afterSave?.()
      Object.assign(dialog, { open: true, variant: 'success', note: '', ...successText(input, saved) })
    } catch (error) {
      Object.assign(dialog, {
        open: true,
        variant: 'error',
        title: 'Couldn’t save your listing',
        message: error instanceof Error && error.message ? error.message : 'The listing could not be saved. Please try again.',
        note: LOST_NOTHING,
      })
    } finally {
      busy.value = false
    }
  }

  function successText(input: T, saved: { title: string; status: SavedStatus }) {
    const name = `“${input.title || saved.title}”`
    if (options.mode === 'create') {
      return input.status === 'Draft'
        ? { title: 'Draft saved', message: `${name} is saved as a draft. It isn’t visible to the public until you submit it for review.` }
        : { title: 'Submitted for review', message: `${name} was sent to an administrator. We’ll email you when it’s approved or if something needs fixing.` }
    }
    if (saved.status === 'Pending') {
      return { title: 'Changes saved', message: `Changes to ${name} were saved and sent to an administrator for review. It’s hidden from the public until it’s approved.` }
    }
    return { title: 'Changes saved', message: `Changes to ${name} were saved.` }
  }

  /** Main button: add another (create), open the listing (edit), or retry (error). */
  function primary() {
    if (dialog.variant === 'error') {
      if (lastInput) void submit(lastInput)
      return
    }
    dialog.open = false
    if (options.mode === 'create') {
      formKey.value += 1
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (savedId !== null) {
      void router.push(`${options.listPath}/${savedId}`)
    }
  }

  function close() {
    dialog.open = false
  }

  return { dialog, busy, formKey, primaryLabel, submit, primary, close }
}

export async function backendHealth(): Promise<{ healthy: boolean; message: string }> {
  const apiBase = (process.env.E2E_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
  try {
    const response = await fetch(`${apiBase}/properties`, { signal: AbortSignal.timeout(3_000) })
    if (response.status < 500) return { healthy: true, message: `API responded with HTTP ${response.status}.` }
    return { healthy: false, message: `API health request returned HTTP ${response.status}.` }
  } catch (error) {
    return { healthy: false, message: error instanceof Error ? error.message : 'API is unreachable.' }
  }
}

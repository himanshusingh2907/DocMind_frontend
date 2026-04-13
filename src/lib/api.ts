import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = 'https://docmind-n6hm.onrender.com/api'
 // 'http://localhost:5000/api'

type RetryConfig = AxiosRequestConfig & { _retry?: boolean }

let onAuthFailure: (() => void) | null = null
export function setOnAuthFailure(handler: (() => void) | null) {
  onAuthFailure = handler
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export async function refreshSession() {
  await refreshClient.post('/auth/refresh')
}

let isRefreshing = false
let pending: Array<(ok: boolean) => void> = []

function notifyPending(ok: boolean) {
  pending.forEach((cb) => cb(ok))
  pending = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as RetryConfig | undefined

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      const ok = await new Promise<boolean>((resolve) => pending.push(resolve))
      if (!ok) return Promise.reject(error)
      return api(original)
    }

    isRefreshing = true
    try {
      await refreshSession()
      notifyPending(true)
      return api(original)
    } catch (refreshErr) {
      notifyPending(false)
      onAuthFailure?.()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message || fallback

  const ax = err as AxiosError<any>
  const data = ax?.response?.data
  const msg =
    data?.message ||
    data?.error ||
    (typeof data === 'string' ? data : null) ||
    ax?.message ||
    null

  return msg ?? fallback
}


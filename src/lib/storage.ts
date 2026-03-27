const KEY = 'docmind:user'

export type StoredUser = {
  email: string
  name?: string
}

export function loadUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function saveUser(user: StoredUser | null) {
  try {
    if (!user) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(user))
  } catch {
    // ignore
  }
}


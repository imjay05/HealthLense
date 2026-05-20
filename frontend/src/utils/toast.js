const listeners = new Set()

export const toast = {
  _emit(type, message) {
    listeners.forEach((fn) => fn({ type, message, id: Date.now() }))
  },
  success: (msg) => toast._emit('success', msg),
  error:   (msg) => toast._emit('error', msg),
  info:    (msg) => toast._emit('info', msg),
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
}
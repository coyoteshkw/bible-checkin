export const useDarkMode = () => {
  const isDark = useState('dark-mode', () => false)

  function apply(val: boolean) {
    isDark.value = val
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', val)
      localStorage.setItem('dark-mode', val ? 'true' : 'false')
    }
  }

  function toggle() { apply(!isDark.value) }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('dark-mode')
      if (saved === null) {
        apply(window.matchMedia('(prefers-color-scheme: dark)').matches)
      } else {
        apply(saved === 'true')
      }
    }
  }

  return { isDark, toggle, init }
}

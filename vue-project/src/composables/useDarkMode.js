import { ref, onMounted } from 'vue'

export function useDarkMode() {
  const isDarkMode = ref(false)

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    document.body.classList.toggle('dark-mode', isDarkMode.value)
    
    // Save dark mode state in localStorage
    if (isDarkMode.value) {
      localStorage.setItem('darkMode', 'enabled')
    } else {
      localStorage.setItem('darkMode', 'disabled')
    }
  }

  function checkDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
      isDarkMode.value = true
      document.body.classList.add('dark-mode')
    }
  }

  onMounted(() => {
    checkDarkMode()
  })

  return {
    isDarkMode,
    toggleDarkMode
  }
}

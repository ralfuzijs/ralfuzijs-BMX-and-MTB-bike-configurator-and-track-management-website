<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { useDarkMode } from '../composables/useDarkMode';
import { useAuth } from '../composables/useAuth';
import { computed, onMounted, ref } from 'vue';

const router = useRouter();
const { isDarkMode, toggleDarkMode } = useDarkMode();
const { isAuthenticated, logout, checkAuth } = useAuth();

// Dropdown visibility control
const dropdownVisible = ref(false);
let hideTimeout = null;

// Check authentication status when component is loaded
onMounted(() => {
  checkAuth();
});

// Compute user initials from the username stored in localStorage
const userInitials = computed(() => {
  if (!isAuthenticated.value) return '';
  
  const username = localStorage.getItem('user_name') || '';
  if (username.length >= 2) {
    return username.substring(0, 2).toUpperCase();
  } else if (username.length === 1) {
    return username.toUpperCase();
  }
  return 'U'; // Default if username is empty
});

// Handle dropdown visibility
const showDropdown = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  dropdownVisible.value = true;
};

const hideDropdown = () => {
  hideTimeout = setTimeout(() => {
    dropdownVisible.value = false;
  }, 300); // 300ms delay before hiding
};

// Handle logout action
const handleLogout = () => {
  logout();
  dropdownVisible.value = false; // Hide dropdown immediately on logout
  router.push('/login'); // Redirect to login page after logout
};
</script>

<template>
  <main>
    <header>
        <!-- Dark mode Button -->
        <button @click="toggleDarkMode"> 
            <img src="/images/day-and-night.png" alt="Dark Mode Toggle" />
        </button>
        <!-- Dark mode Button -->        <!-- User Button/Avatar -->
        <div class="user-container" @mouseenter="showDropdown" @mouseleave="hideDropdown">
          <template v-if="isAuthenticated">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <div class="user-dropdown" :class="{ 'visible': dropdownVisible }" @mouseenter="showDropdown" @mouseleave="hideDropdown">
              <RouterLink to="/user-profile" @click="dropdownVisible = false">My Profile</RouterLink>
              <a href="#" @click.prevent="handleLogout">Logout</a>
            </div>
          </template>
          <RouterLink v-else to="/login" class="user-button" title="Login">
            <i class="fas fa-user"></i>
          </RouterLink>
        </div>
        <!-- User Button/Avatar -->

        <h1>BikeVerse</h1>

        <nav>
            <RouterLink to="/"><i class="fas fa-home"></i> Home</RouterLink>
            <RouterLink to="/about"><i class="fas fa-info-circle"></i> About Me</RouterLink>
            <RouterLink to="/contact"><i class="fas fa-envelope"></i> Contact</RouterLink>
            <div class="dropdown">
                <a href="#"><i class="fas fa-ellipsis-h"></i> More</a>
                <div class="dropdown-content">
                    <a href="#">Nothing1</a>
                    <a href="#">Nothing2</a>
                    <a href="#">Nothing3</a>
                </div>
            </div>
        </nav>
    </header>
  </main>
</template>

<style>
body {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; 
    /* background color is set by theme.css */
}

header {
    text-align: center;
    /* background and text colors are set by theme.css */
    padding: 1em;
}

h1 {
    margin: 0;
    padding: 10px; 
    text-align: center;
    font-size: 3em;
  }

nav {
    display: flex;
    justify-content: center;
    align-items: center; 
    padding: 0;
    margin-top: 3px;
}

nav a {
    color: var(--button-text-color);
    margin: 30px; /* space between home, about us, contact */
    text-decoration: none;
    font-size: 1.2em;
}

nav a:hover {
    background-color: var(--accent-color);
    color: var(--button-text-color);
    border-radius: 5px;
    transition: background-color 0.5s, color 0.5s;
}

/* Footer styles are now in footer-component.vue */

/* Dark/light mode toggle button ---------------------------------------------- */
header > button {
    padding: 8px 10px;
    position: absolute; 
    left: 20px;
    top: 20px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-top: 1px;
}

/* Card styles in dark mode */
.dark-mode .card1 img, .dark-mode .card2 img, .dark-mode .card3 img {
    opacity: 1;
}

.dark-mode .card1 img:hover, .dark-mode .card2 img:hover, .dark-mode .card3 img:hover {
    transform: translateY(-10px);
    box-shadow: 0 0 20px var(--accent-color);
}

/* Custom heading colors for dark mode */
.dark-mode div h2 {
    color: var(--primary-color);
}
/* changes the dark/light modes ---------------------------------------------- */

/* User button styles */
.user-button {
    position: absolute;
    right: 15px;
    top: 10px;
    color: var(--button-text-color);
    font-size: 24px;
    background-color: transparent !important;
    border: none;
    cursor: pointer;
    text-decoration: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
    padding: 0 !important;
    margin: 0 !important;
}

.user-button:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: var(--button-text-color) !important;
}

/* Ensure user button doesn't inherit theme button styles */
.user-container .user-button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* User avatar styles (when logged in) */
.user-container {
  position: absolute;
  right: 25px;
  top: 20px;
}

.user-avatar {
  position: absolute;
  right: 15px;
  top: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: var(--dropdown-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 140px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid rgba(0,0,0,0.1);
}

.user-dropdown.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-dropdown a {
  display: block;
  padding: 12px 15px;
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
  border-radius: 6px;
  margin: 4px;
}

.user-dropdown a:hover {
  background-color: var(--accent-color);
  color: white;
}

.user-dropdown a:first-child {
  margin-top: 8px;
}

.user-dropdown a:last-child {
  margin-bottom: 8px;
}

/* Dropdown Menu ------------------------------------------------------------- */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--dropdown-background);
    min-width: 160px;
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000; /* Increased from 1 to 1000 to appear above the map */
    border-radius: 25px;
}

.dropdown-content a {
    color: var(--text-color);
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.dropdown:hover .dropdown-content {
    display: block;
}
/* Dropdown Menu ------------------------------------------------------------- */

</style>
import { ref, watchEffect } from 'vue';

// Create a single instance of auth state to share across components
const isAuthenticated = ref(false);
const userRole = ref('');
const username = ref('');
const userId = ref('');
const userEmail = ref('');

// Initialize these values once from localStorage
const token = localStorage.getItem('user_token');
if (token) {
  isAuthenticated.value = true;
  userRole.value = localStorage.getItem('user_role') || '';
  username.value = localStorage.getItem('user_name') || '';
  userId.value = localStorage.getItem('user_id') || '';
  userEmail.value = localStorage.getItem('user_email') || '';
  console.log('Auth state initialized from localStorage. User is authenticated as:', username.value);
}

export function useAuth() {
  // Check if user is already authenticated (from previous session)
  const checkAuth = () => {
    const token = localStorage.getItem('user_token');
    const authenticated = !!token;
    
    console.log('Checking auth status:', authenticated);
    isAuthenticated.value = authenticated;
    
    if (authenticated) {
      userRole.value = localStorage.getItem('user_role') || '';
      username.value = localStorage.getItem('user_name') || '';
      userId.value = localStorage.getItem('user_id') || '';
      userEmail.value = localStorage.getItem('user_email') || '';
      console.log('Auth state restored. User:', username.value, 'Role:', userRole.value);
    }
    
    return authenticated;
  };

  // Explicitly set authentication state
  const setAuthenticated = (state, userData = null) => {
    console.log(`Setting authentication state to: ${state}`, userData);
    isAuthenticated.value = state;
    
    if (state && userData) {
      userRole.value = userData.role || '';
      username.value = userData.username || '';
      userId.value = userData.id || '';
      userEmail.value = userData.email || '';
      console.log('Authentication state updated with user data');
    }
  };

  // Check if the current user is an admin
  const isAdmin = () => {
    return checkAuth() && userRole.value === 'admin';
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    
    isAuthenticated.value = false;
    userRole.value = '';
    username.value = '';
    userId.value = '';
    userEmail.value = '';
    console.log('User has been logged out and auth state cleared.');
  };

  return {
    isAuthenticated,
    userRole,
    username,
    userId,
    userEmail,
    isAdmin,
    logout,
    checkAuth,
    setAuthenticated
  };
}

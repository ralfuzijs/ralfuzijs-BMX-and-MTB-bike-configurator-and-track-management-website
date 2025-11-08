<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const { setAuthenticated } = useAuth();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter both username and password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  console.log('Attempting login with username:', username.value);

  try {
    // Use the API service for login
    const result = await userApi.login({
      username: username.value,
      password: password.value
    });
    
    console.log('Login API response:', result);
    
    if (result.success) {
      console.log('Login successful, storing user data');
      // Store user info from the API response
      localStorage.setItem('user_token', result.data.token);
      localStorage.setItem('user_email', result.data.email);
      localStorage.setItem('user_id', result.data.id);
      localStorage.setItem('user_name', result.data.username);
      localStorage.setItem('user_role', result.data.role);
      
      // Update authentication state with the new info
      setAuthenticated(true, result.data);
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        // Check user role and redirect accordingly
        if (result.data.role === 'admin') {
          console.log('Admin user detected, redirecting to admin dashboard');
          router.push('/admin');
        } else {
          console.log('Regular user detected, redirecting to user profile');
          router.push('/user-profile');
        }
      }, 300);
    } else {
      errorMessage.value = result.error || 'Invalid username or password';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'An error occurred during login. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>User Login</h1>
      </div>
        <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Enter your username" 
            autofocus 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            placeholder="Enter your password" 
            required
          />
        </div>
        
        <div class="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>
          <div v-if="errorMessage" class="message" :class="{ error: !errorMessage.includes('successful') }">
          {{ errorMessage }}
        </div>
        
        <button 
          type="submit" 
          class="primary-button" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div class="form-footer">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        </div>
      </form>
      
      <div class="back-link">
        <router-link to="/">Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  background-color: #4d7529;
  color: white;
  padding: 25px;
  text-align: center;
}

.login-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
  width: 94%;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
}

.message {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.primary-button {
  width: 100%;
  padding: 14px;
  background-color: #77492b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.primary-button:hover {
  background-color: #5a8a31;
}

.primary-button:disabled {
  background-color: var(--secondary-color);
  opacity: 0.7;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
}

.form-footer a {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 600;
}

.form-footer a:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}

.back-link {
  text-align: center;
  padding: 15px;
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
}

.back-link a {
  color: var(--link-color);
  text-decoration: none;
  font-size: 15px;
}

.back-link a:hover {
  color: var(--link-hover-color);
  text-decoration: underline;
}
</style>
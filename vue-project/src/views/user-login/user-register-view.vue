<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/services/api';

const router = useRouter();
const registerEmail = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');
const username = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  // Validate inputs
  if (!registerEmail.value || !registerPassword.value || !confirmPassword.value || !username.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }
  
  if (registerPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // Use the API service for registration
    const result = await userApi.register({
      username: username.value,
      email: registerEmail.value,
      password: registerPassword.value
    });
    
    if (result.success) {
      errorMessage.value = 'Registration successful! You can now login.';
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      errorMessage.value = Array.isArray(result.error) 
        ? result.error.join(', ') 
        : result.error || 'Registration failed';
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value = 'An error occurred during registration';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Create an Account</h1>
      </div>
      
      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Choose a username" 
            autofocus 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="register-email">Email</label>
          <input 
            id="register-email" 
            v-model="registerEmail" 
            type="email" 
            placeholder="Enter your email" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="register-password">Password</label>
          <input 
            id="register-password" 
            v-model="registerPassword" 
            type="password" 
            placeholder="Create a password" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input 
            id="confirm-password" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            required
          />
        </div>
        
        <div v-if="errorMessage" class="message" :class="{ error: !errorMessage.includes('successful') }">
          {{ errorMessage }}
        </div>
        
        <button 
          type="submit" 
          class="primary-button" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
        
        <div class="form-footer">
          <p>Already have an account? <router-link to="/login">Login</router-link></p>
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
  background-color: rgba(var(--primary-color), 0.2);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.primary-button {
  width: 100%;
  padding: 12px;
  background-color: #4d7529;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 15px;
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
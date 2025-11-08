<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { userApi } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const emit = defineEmits(['message']);
const { user } = useAuth();

// Loading states
const loading = ref(false);
const savingAccount = ref(false);
const savingPassword = ref(false);
const savingPreferences = ref(false);

// User profile data
const profileData = ref({
  username: '',
  email: '',
  role: '',
  createdAt: '',
  lastLogin: '',
  loginHistory: []
});

// Account settings form
const accountForm = ref({
  username: ''
});

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Preferences form
const preferencesForm = ref({
  defaultView: 'tracks', // tracks, users, calculator, configurator
  emailNotifications: true,
  theme: 'light' // light, dark
});

// Validation errors
const passwordErrors = ref([]);

// Active tab
const activeTab = ref('account'); // account, security, preferences

// Fetch user profile data
async function fetchUserProfile() {
  try {
    loading.value = true;
    const result = await userApi.getUserProfile();
    
    if (result.success) {
      profileData.value = {
        username: result.data.username,
        email: result.data.email,
        role: result.data.role,
        createdAt: result.data.createdAt,
        lastLogin: result.data.lastLogin,
        loginHistory: result.data.loginHistory || []
      };
      
      // Populate forms with current data
      accountForm.value.username = result.data.username;
      
      // Load preferences from localStorage or use defaults
      loadPreferences();
    } else {
      emit('message', { text: result.error || 'Error fetching profile', isError: true });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    emit('message', { text: `Error: ${error.message}`, isError: true });
  } finally {
    loading.value = false;
  }
}

// Load preferences from localStorage
function loadPreferences() {
  const savedPrefs = localStorage.getItem('adminPreferences');
  if (savedPrefs) {
    try {
      const prefs = JSON.parse(savedPrefs);
      preferencesForm.value = {
        defaultView: prefs.defaultView || 'tracks',
        emailNotifications: prefs.emailNotifications !== undefined ? prefs.emailNotifications : true,
        theme: prefs.theme || 'light'
      };
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
  }
}

// Save account settings (username)
async function saveAccountSettings() {
  try {
    savingAccount.value = true;
    emit('message', { text: '', isError: false });
    
    const result = await userApi.updateUserProfile({
      username: accountForm.value.username
    });
    
    if (result.success) {
      profileData.value.username = result.data.username;
      emit('message', { text: 'Account settings updated successfully!', isError: false });
    } else {
      emit('message', { text: result.error || 'Error updating account', isError: true });
    }
  } catch (error) {
    console.error('Error updating account:', error);
    emit('message', { text: `Error: ${error.message}`, isError: true });
  } finally {
    savingAccount.value = false;
  }
}

// Validate password form
function validatePasswordForm() {
  passwordErrors.value = [];
  
  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.push('Current password is required');
  }
  
  if (!passwordForm.value.newPassword) {
    passwordErrors.value.push('New password is required');
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.push('New password must be at least 6 characters');
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.push('New passwords do not match');
  }
  
  if (passwordForm.value.currentPassword === passwordForm.value.newPassword) {
    passwordErrors.value.push('New password must be different from current password');
  }
  
  return passwordErrors.value.length === 0;
}

// Change password
async function changePassword() {
  if (!validatePasswordForm()) {
    return;
  }
  
  try {
    savingPassword.value = true;
    emit('message', { text: '', isError: false });
    
    // First verify current password by attempting login
    const loginResult = await userApi.login({
      username: profileData.value.username,
      password: passwordForm.value.currentPassword
    });
    
    if (!loginResult.success) {
      passwordErrors.value.push('Current password is incorrect');
      return;
    }
    
    // Update password
    const result = await userApi.updateUserProfile({
      password: passwordForm.value.newPassword
    });
    
    if (result.success) {
      emit('message', { text: 'Password changed successfully!', isError: false });
      
      // Clear password form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      passwordErrors.value = [];
    } else {
      emit('message', { text: result.error || 'Error changing password', isError: true });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    emit('message', { text: `Error: ${error.message}`, isError: true });
  } finally {
    savingPassword.value = false;
  }
}

// Save preferences
function savePreferences() {
  try {
    savingPreferences.value = true;
    emit('message', { text: '', isError: false });
    
    // Save to localStorage
    localStorage.setItem('adminPreferences', JSON.stringify(preferencesForm.value));
    
    // Apply theme immediately
    applyTheme(preferencesForm.value.theme);
    
    emit('message', { text: 'Preferences saved successfully!', isError: false });
  } catch (error) {
    console.error('Error saving preferences:', error);
    emit('message', { text: `Error: ${error.message}`, isError: true });
  } finally {
    savingPreferences.value = false;
  }
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
  // Store theme preference
  localStorage.setItem('theme', theme);
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format date for login history
function formatLoginDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Change active tab
function changeTab(tab) {
  activeTab.value = tab;
  emit('message', { text: '', isError: false });
  passwordErrors.value = [];
}

// Get default view label
function getDefaultViewLabel(view) {
  const labels = {
    tracks: 'Track Management',
    users: 'User Management',
    calculator: 'Bike Size Calculator',
    configurator: 'Bike Configurator'
  };
  return labels[view] || view;
}

// On mount
onMounted(() => {
  fetchUserProfile();
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }
});
</script>

<template>
  <div class="content-section">
    <div class="section-header">
      <h1>Admin Settings</h1>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading settings...
    </div>
    
    <!-- Settings content -->
    <div v-else class="settings-container">
      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'account' }"
          @click="changeTab('account')"
        >
          <i class="fas fa-user"></i> Account
        </button>
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'security' }"
          @click="changeTab('security')"
        >
          <i class="fas fa-shield-alt"></i> Security
        </button>
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'preferences' }"
          @click="changeTab('preferences')"
        >
          <i class="fas fa-cog"></i> Preferences
        </button>
      </div>
      
      <!-- Account Tab -->
      <div v-if="activeTab === 'account'" class="tab-content">
        <div class="settings-section">
          <h2>Account Information</h2>
          
          <!-- Account Details (Read-only) -->
          <div class="info-grid">
            <div class="info-item">
              <label>Role:</label>
              <span class="role-badge" :class="profileData.role">
                {{ profileData.role }}
              </span>
            </div>
            
            <div class="info-item">
              <label>Email:</label>
              <span>{{ profileData.email }}</span>
            </div>
            
            <div class="info-item">
              <label>Account Created:</label>
              <span>{{ formatDate(profileData.createdAt) }}</span>
            </div>
            
            <div class="info-item">
              <label>Last Login:</label>
              <span>{{ formatDate(profileData.lastLogin) }}</span>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2>Update Account</h2>
          
          <form @submit.prevent="saveAccountSettings">
            <div class="form-group">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                v-model="accountForm.username" 
                required
                minlength="3"
              >
            </div>
            
            <div class="button-group">
              <button 
                type="submit" 
                class="primary-button"
                :disabled="savingAccount"
              >
                <i class="fas" :class="savingAccount ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ savingAccount ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="tab-content">
        <div class="settings-section">
          <h2>Change Password</h2>
          
          <!-- Password errors -->
          <div v-if="passwordErrors.length > 0" class="error-messages">
            <div v-for="(error, index) in passwordErrors" :key="index" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ error }}
            </div>
          </div>
          
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                required
              >
            </div>
            
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="passwordForm.newPassword" 
                required
                minlength="6"
              >
              <small>Must be at least 6 characters</small>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="passwordForm.confirmPassword" 
                required
              >
            </div>
            
            <div class="button-group">
              <button 
                type="submit" 
                class="primary-button"
                :disabled="savingPassword"
              >
                <i class="fas" :class="savingPassword ? 'fa-spinner fa-spin' : 'fa-key'"></i>
                {{ savingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="settings-section">
          <h2>Login History</h2>
          <p class="section-description">Your recent login activity (last 10 logins)</p>
          
          <div v-if="!profileData.loginHistory || profileData.loginHistory.length === 0" class="no-data">
            <i class="fas fa-history"></i>
            <p>No login history available</p>
          </div>
          
          <div v-else class="login-history">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(login, index) in profileData.loginHistory" :key="index">
                  <td>{{ formatLoginDate(login.timestamp) }}</td>
                  <td>
                    <code>{{ login.ipAddress || 'N/A' }}</code>
                  </td>
                  <td class="user-agent">{{ login.userAgent || 'Unknown' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Preferences Tab -->
      <div v-if="activeTab === 'preferences'" class="tab-content">
        <div class="settings-section">
          <h2>Application Preferences</h2>
          
          <form @submit.prevent="savePreferences">
            <div class="form-group">
              <label for="defaultView">Default View on Login</label>
              <select id="defaultView" v-model="preferencesForm.defaultView">
                <option value="tracks">Track Management</option>
                <option value="users">User Management</option>
                <option value="calculator">Bike Size Calculator</option>
                <option value="configurator">Bike Configurator</option>
              </select>
              <small>Select which page to show when you log in to the admin panel</small>
            </div>
            
            <div class="form-group">
              <label for="theme">Theme</label>
              <select id="theme" v-model="preferencesForm.theme">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
              <small>Choose your preferred color theme</small>
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="preferencesForm.emailNotifications"
                >
                <span>Enable Email Notifications</span>
              </label>
              <small>Receive email notifications for important events (new users, new tracks, etc.)</small>
            </div>
            
            <div class="button-group">
              <button 
                type="submit" 
                class="primary-button"
                :disabled="savingPreferences"
              >
                <i class="fas" :class="savingPreferences ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ savingPreferences ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="settings-section">
          <h2>Current Preferences Summary</h2>
          <div class="preferences-summary">
            <div class="summary-item">
              <i class="fas fa-home"></i>
              <div>
                <strong>Default View:</strong>
                <span>{{ getDefaultViewLabel(preferencesForm.defaultView) }}</span>
              </div>
            </div>
            <div class="summary-item">
              <i class="fas fa-palette"></i>
              <div>
                <strong>Theme:</strong>
                <span>{{ preferencesForm.theme === 'dark' ? 'Dark Mode' : 'Light Mode' }}</span>
              </div>
            </div>
            <div class="summary-item">
              <i class="fas fa-envelope"></i>
              <div>
                <strong>Email Notifications:</strong>
                <span>{{ preferencesForm.emailNotifications ? 'Enabled' : 'Disabled' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.section-header h1 {
  margin: 0;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.loading i {
  font-size: 32px;
  margin-bottom: 10px;
  color: #3498db;
  display: block;
}

/* Settings Container */
.settings-container {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  background-color: #fafafa;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.tab-button.active {
  background-color: white;
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-button i {
  font-size: 18px;
}

/* Tab Content */
.tab-content {
  padding: 30px;
}

/* Settings Section */
.settings-section {
  margin-bottom: 40px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.section-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: bold;
  color: #666;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 16px;
}

/* Role Badge */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  text-transform: capitalize;
  width: fit-content;
}

.role-badge.admin {
  background-color: #E3F2FD;
  color: #1565C0;
}

.role-badge.user {
  background-color: #E8F5E9;
  color: #2E7D32;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 13px;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.checkbox-label span {
  font-weight: bold;
  color: #333;
}

/* Error Messages */
.error-messages {
  margin-bottom: 20px;
}

.error-message {
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message i {
  color: #721c24;
}

/* Button Styles */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.primary-button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.primary-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.primary-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Login History Table */
.login-history {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.history-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

.history-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.history-table tr:hover {
  background-color: #f1f1f1;
}

.history-table code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #e74c3c;
}

.user-agent {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #666;
}

/* No Data */
.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
  color: #ddd;
}

/* Preferences Summary */
.preferences-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.summary-item i {
  font-size: 24px;
  color: #3498db;
}

.summary-item div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-item strong {
  color: #666;
  font-size: 14px;
}

.summary-item span {
  color: #333;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-content {
    padding: 20px;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-button {
    border-bottom: 1px solid #f0f0f0;
    border-left: 3px solid transparent;
  }
  
  .tab-button.active {
    border-bottom: 1px solid #f0f0f0;
    border-left-color: #3498db;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .history-table {
    font-size: 14px;
  }
  
  .user-agent {
    max-width: 150px;
  }
}
</style>

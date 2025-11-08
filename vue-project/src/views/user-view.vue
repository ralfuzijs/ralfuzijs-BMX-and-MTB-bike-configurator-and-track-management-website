<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userApi, favoritesApi, bikeSizeAPI } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { isAuthenticated, username, userEmail, logout } = useAuth();
const isLoading = ref(true);
const favorites = ref([]);
const bikeSizeCalculations = ref([]);
const isFetchingFavorites = ref(false); // Added loading state for favorites
const isFetchingBikeCalc = ref(false); // Added loading state for bike calculations

// Edit profile state
const isEditingUsername = ref(false);
const isEditingEmail = ref(false);
const editedUsername = ref('');
const editedEmail = ref('');
const isSaving = ref(false);
const updateMessage = ref('');
const updateError = ref('');

// Delete account state
const showDeleteConfirmation = ref(false);
const isDeleting = ref(false);
const deleteConfirmText = ref('');

// Tab management
const activeTab = ref('overview');

const tabs = [
  { id: 'overview', name: 'Overview', icon: 'fa-home' },
  { id: 'bike-calc', name: 'Bike Size Calculator', icon: 'fa-calculator' },
  { id: 'favorites', name: 'Favorite Tracks', icon: 'fa-heart' },
  { id: 'settings', name: 'Settings', icon: 'fa-cog' },
  { id: 'notifications', name: 'Notifications', icon: 'fa-bell' }
];

const switchTab = (tabId) => {
  activeTab.value = tabId;
};

onMounted(async () => {
  console.log('User profile mounted, authentication state:', isAuthenticated.value);
  // Check if user is logged in
  const token = localStorage.getItem('user_token');
  if (!token) {
    console.log('No token found, redirecting to login');
    router.push('/login');
    return;
  }
  
  // Try to fetch user profile data
  try {
    const result = await userApi.getProfile();
    console.log('Profile API response:', result);
    
    if (!result.success) {
      console.log('Failed to fetch profile, redirecting to login');
      router.push('/login');
      return;
    }      // Fetch user's favorites
    if (activeTab.value === 'favorites' || activeTab.value === 'overview') {
      fetchFavorites();
    }
    
    // Fetch user's bike size calculations
    if (activeTab.value === 'bike-calc' || activeTab.value === 'overview') {
      fetchBikeSizeCalculations();
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  } finally {
    isLoading.value = false;
  }
});

async function fetchFavorites() {
  try {
    console.log('Fetching favorites...');
    isFetchingFavorites.value = true;
    const result = await favoritesApi.getAllFavorites();
    console.log('Raw favorites API response:', result);
    
    if (result.success) {
      favorites.value = result.data;
      console.log('Favorites fetched successfully, count:', favorites.value.length);
      
      // Enhanced debugging to understand data structure
      if (favorites.value.length > 0) {
        console.log('First favorite complete structure:', JSON.stringify(favorites.value[0]));
        
        // Log all possible properties to find where the track data might be
        const firstFav = favorites.value[0];
        console.log('First favorite keys:', Object.keys(firstFav));
        
        // Log Track association if it exists
        if (firstFav.Track) {
          console.log('Track data structure:', firstFav.Track);
        }
        
        // Check for track with lowercase t
        if (firstFav.track) {
          console.log('track (lowercase) data structure:', firstFav.track);
        }
      }
    } else {
      console.error('Failed to fetch favorites:', result.error);
    }  } catch (error) {
    console.error('Error fetching favorites:', error);
  } finally {
    isFetchingFavorites.value = false;
  }
}

async function fetchBikeSizeCalculations() {
  try {
    console.log('Fetching bike size calculations...');
    isFetchingBikeCalc.value = true;
    const result = await bikeSizeAPI.getUserCalculations();
    console.log('Bike size calculations API response:', result);
    
    if (result.success) {
      bikeSizeCalculations.value = result.data;
      console.log('Bike size calculations loaded:', bikeSizeCalculations.value.length);
    } else {
      console.error('Failed to fetch bike size calculations:', result.error);
    }
  } catch (error) {
    console.error('Error fetching bike size calculations:', error);
  } finally {
    isFetchingBikeCalc.value = false;
  }
}

// Improved helper function to safely get track data from the favorite object
function getTrackData(favorite) {
  // Debug the actual structure of the favorite object
  console.log('Processing favorite structure:', JSON.stringify(favorite));
  
  // First check if there's a direct Track property (from eager loading)
  if (favorite.Track) {
    console.log('Using Track association data');
    return favorite.Track;
  }
  
  // Check if there's a track property with lowercase 't'
  if (favorite.track) {
    console.log('Using track (lowercase) association data');
    return favorite.track;
  }
  
  // Handle case from SQLite where it might not be properly associated
  // but individual fields are copied to the favorite
  if (favorite.trackName || favorite.trackId) {
    console.log('Constructing track object from favorite properties');
    return {
      id: favorite.trackId,
      name: favorite.trackName || 'Unknown Track',
      type: favorite.trackType || 'unknown'
    };
  }
  
  // If all else fails, return a default object to prevent UI errors
  console.warn('Could not find track data in favorite object:', favorite);
  return {
    id: 0,
    name: 'Unknown Track',
    type: 'unknown'
  };
}

async function removeFromFavorites(trackId) {
  try {
    const result = await favoritesApi.removeFavorite(trackId);
    if (result.success) {
      // Remove from local list
      favorites.value = favorites.value.filter(fav => fav.trackId !== trackId);
      console.log('Track removed from favorites');
    } else {
      console.error('Failed to remove favorite:', result.error);
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

const handleLogout = () => {
  // Use the auth composable's logout function to properly clear state
  logout();
  
  console.log('User logged out, redirecting to login page');
  // Redirect to login page
  router.push('/login');
};

function getTrackTypeName(type) {
  if (type === 'bmx_track') return 'BMX Track';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getRecommendedBikeSize() {
  if (bikeSizeCalculations.value.length === 0) return null;
  
  // Get the most recent calculation
  const sortedCalcs = [...bikeSizeCalculations.value].sort((a, b) => 
    new Date(b.calculationDate) - new Date(a.calculationDate)
  );
  
  return sortedCalcs[0];
}

// Format dates to DD/MM/YYYY format with leading zeros
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

async function deleteBikeCalculation(id) {
  try {
    const result = await bikeSizeAPI.deleteCalculation(id);
    if (result.success) {
      bikeSizeCalculations.value = bikeSizeCalculations.value.filter(calc => calc.id !== id);
      console.log('Bike calculation deleted');
    } else {
      console.error('Failed to delete bike calculation:', result.error);
    }
  } catch (error) {
    console.error('Error deleting bike calculation:', error);
  }
}

// Get bike type display name
function getBikeTypeName(type) {
  const names = {
    'MTB': 'MTB',
    'BMX_FREESTYLE': 'BMX Freestyle',
    'BMX_RACING': 'BMX Racing'
  };
  return names[type] || type;
}

// Edit profile functions
function startEditingUsername() {
  editedUsername.value = username.value;
  isEditingUsername.value = true;
  updateMessage.value = '';
  updateError.value = '';
}

function startEditingEmail() {
  editedEmail.value = userEmail.value;
  isEditingEmail.value = true;
  updateMessage.value = '';
  updateError.value = '';
}

function cancelEditingUsername() {
  isEditingUsername.value = false;
  editedUsername.value = '';
  updateError.value = '';
}

function cancelEditingEmail() {
  isEditingEmail.value = false;
  editedEmail.value = '';
  updateError.value = '';
}

async function saveUsername() {
  if (!editedUsername.value.trim()) {
    updateError.value = 'Username cannot be empty';
    return;
  }
  
  isSaving.value = true;
  updateError.value = '';
  updateMessage.value = '';
  
  try {
    const result = await userApi.updateProfile({
      username: editedUsername.value
    });
    
    if (result.success) {
      // Update the auth composable's username
      username.value = result.data.username;
      localStorage.setItem('user_name', result.data.username);
      
      updateMessage.value = 'Username updated successfully!';
      isEditingUsername.value = false;
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        updateMessage.value = '';
      }, 3000);
    } else {
      updateError.value = result.error || 'Failed to update username';
    }
  } catch (error) {
    console.error('Error updating username:', error);
    updateError.value = 'An error occurred while updating username';
  } finally {
    isSaving.value = false;
  }
}

async function saveEmail() {
  if (!editedEmail.value.trim()) {
    updateError.value = 'Email cannot be empty';
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(editedEmail.value)) {
    updateError.value = 'Please enter a valid email address';
    return;
  }
  
  isSaving.value = true;
  updateError.value = '';
  updateMessage.value = '';
  
  try {
    const oldEmail = userEmail.value;
    const result = await userApi.updateProfile({
      email: editedEmail.value
    });
    
    if (result.success) {
      // Update the auth composable's email
      userEmail.value = result.data.email;
      localStorage.setItem('user_email', result.data.email);
      
      updateMessage.value = `Email successfully changed from ${oldEmail} to ${result.data.email}. Please check your new email for confirmation.`;
      isEditingEmail.value = false;
      
      // Clear success message after 5 seconds (longer for email change)
      setTimeout(() => {
        updateMessage.value = '';
      }, 5000);
    } else {
      updateError.value = result.error || 'Failed to update email';
    }
  } catch (error) {
    console.error('Error updating email:', error);
    updateError.value = 'An error occurred while updating email';
  } finally {
    isSaving.value = false;
  }
}

// Delete account functions
function showDeleteDialog() {
  showDeleteConfirmation.value = true;
  deleteConfirmText.value = '';
  updateError.value = '';
}

function cancelDelete() {
  showDeleteConfirmation.value = false;
  deleteConfirmText.value = '';
  updateError.value = '';
}

async function confirmDeleteAccount() {
  // Check if user typed the exact username
  if (deleteConfirmText.value !== username.value) {
    updateError.value = 'Username does not match. Please type your exact username to confirm.';
    return;
  }
  
  isDeleting.value = true;
  updateError.value = '';
  
  try {
    const result = await userApi.deleteOwnAccount();
    
    if (result.success) {
      // Clear all local storage
      logout();
      
      // Redirect to home with a message
      alert('Your account has been successfully deleted. We\'re sorry to see you go!');
      router.push('/');
    } else {
      updateError.value = result.error || 'Failed to delete account';
      isDeleting.value = false;
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    updateError.value = 'An error occurred while deleting your account';
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="user-profile">
    <div class="profile-container">
      <div v-if="isLoading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading user profile...</span>
      </div>
      
      <template v-else>
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="header-content">
            <div class="profile-info">
              <div class="profile-picture">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="user-details">
                <h1>{{ username }}</h1>
                <p class="email">{{ userEmail }}</p>
                <p class="member-since">Member since: {{ formatDate(new Date()) }}</p>
              </div>
            </div>
            <button @click="handleLogout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <div class="tab-container">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="switchTab(tab.id)"
              :class="['tab-button', { active: activeTab === tab.id }]"
            >
              <i class="fas" :class="tab.icon"></i>
              <span>{{ tab.name }}</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-panel overview-panel">
            <h2>
              <i class="fas fa-home"></i>
              Dashboard Overview
            </h2>
            
            <!-- Quick Stats -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-bicycle"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ bikeSizeCalculations.length }}</h3>
                  <p>Bike Calculations</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="stat-info">
                  <h3>{{ favorites.length }}</h3>
                  <p>Favorite Tracks</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                  <h3>Active</h3>
                  <p>Account Status</p>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity">
              <h3>
                <i class="fas fa-clock"></i>
                Recent Activity
              </h3>
              
              <div class="activity-list">
                <div v-if="getRecommendedBikeSize()" class="activity-item">
                  <div class="activity-icon bike" :class="getRecommendedBikeSize().bikeType">
                    <i class="fas" :class="{
                      'fa-mountain': getRecommendedBikeSize().bikeType === 'MTB',
                      'fa-biking': getRecommendedBikeSize().bikeType === 'BMX_FREESTYLE',
                      'fa-flag-checkered': getRecommendedBikeSize().bikeType === 'BMX_RACING',
                      'fa-calculator': !getRecommendedBikeSize().bikeType
                    }"></i>
                  </div>
                  <div class="activity-content">
                    <h4>Latest Bike Size Calculation - {{ getBikeTypeName(getRecommendedBikeSize().bikeType) }}</h4>
                    <p>Frame size: {{ getRecommendedBikeSize().recommendedFrameSize }} for {{ getRecommendedBikeSize().height }}cm</p>
                    <span class="activity-date">{{ formatDate(new Date(getRecommendedBikeSize().calculationDate)) }}</span>
                  </div>
                </div>
                
                <div v-if="favorites.length > 0" class="activity-item">
                  <div class="activity-icon favorite">
                    <i class="fas fa-heart"></i>
                  </div>
                  <div class="activity-content">
                    <h4>{{ favorites.length }} Favorite Track{{ favorites.length !== 1 ? 's' : '' }}</h4>
                    <p>{{ getTrackData(favorites[0]).name || 'Latest favorite' }}</p>
                    <span class="activity-date">View all favorites</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bike Calculator Tab -->
          <div v-if="activeTab === 'bike-calc'" class="tab-panel bike-calc-panel">
            <div class="panel-header">
              <h2>
                <i class="fas fa-calculator"></i>
                Bike Size Calculator
              </h2>
              <router-link to="/bike-size-calculator" class="action-button primary">
                <i class="fas fa-plus"></i>
                New Calculation
              </router-link>
            </div>

            <div v-if="isFetchingBikeCalc" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Loading your bike calculations...</span>
            </div>
            
            <div v-else-if="bikeSizeCalculations.length === 0" class="empty-state">
              <i class="fas fa-calculator"></i>
              <h3>No calculations yet</h3>
              <p>Find your perfect BMX frame size with our calculator!</p>
              <router-link to="/bike-size-calculator" class="action-button primary">
                <i class="fas fa-bicycle"></i>
                Calculate My Bike Size
              </router-link>
            </div>
            
            <div v-else class="calculations-grid">
              <div v-for="calc in bikeSizeCalculations" :key="calc.id" class="calculation-card">
                <div class="card-header">
                  <div class="calc-icon" :class="calc.bikeType">
                    <i class="fas" :class="{
                      'fa-mountain': calc.bikeType === 'MTB',
                      'fa-biking': calc.bikeType === 'BMX_FREESTYLE',
                      'fa-flag-checkered': calc.bikeType === 'BMX_RACING',
                      'fa-bicycle': !calc.bikeType
                    }"></i>
                  </div>
                  <div class="calc-info">
                    <div class="calc-type">{{ getBikeTypeName(calc.bikeType) }}</div>
                    <h3>{{ calc.recommendedFrameSize }}</h3>
                    <p>Height: {{ calc.height }}cm</p>
                  </div>
                  <div class="card-actions">
                    <button @click="deleteBikeCalculation(calc.id)" class="delete-btn" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="card-date">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(new Date(calc.calculationDate)) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Favorite Tracks Tab -->
          <div v-if="activeTab === 'favorites'" class="tab-panel favorites-panel">
            <div class="panel-header">
              <h2>
                <i class="fas fa-heart"></i>
                Favorite Tracks
                <span v-if="favorites.length" class="count-badge">{{ favorites.length }}</span>
              </h2>
              <router-link to="/MapOfTracks" class="action-button primary">
                <i class="fas fa-map"></i>
                Explore Map
              </router-link>
            </div>

            <div v-if="isFetchingFavorites" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Loading your favorite tracks...</span>
            </div>
            
            <div v-else-if="favorites.length === 0" class="empty-state">
              <i class="fas fa-heart-broken"></i>
              <h3>No favorite tracks yet</h3>
              <p>Explore the map to find tracks you like and add them to your favorites!</p>
              <router-link to="/MapOfTracks" class="action-button primary">
                <i class="fas fa-map"></i>
                Explore Tracks
              </router-link>
            </div>
            
            <div v-else class="favorites-grid">
              <div v-for="favorite in favorites" :key="favorite.id || favorite.trackId" class="favorite-card">
                <div class="card-header">
                  <div class="track-icon" :class="getTrackData(favorite).type || ''">
                    <i class="fas" :class="{
                      'fa-skating': getTrackData(favorite).type === 'skatepark',
                      'fa-biking': getTrackData(favorite).type === 'pumptrack',
                      'fa-bicycle': getTrackData(favorite).type === 'bmx_track',
                      'fa-map-marker-alt': !getTrackData(favorite).type
                    }"></i>
                  </div>
                  <div class="track-info">
                    <h3>{{ getTrackData(favorite).name || favorite.trackName || 'Unknown Track' }}</h3>
                    <span v-if="getTrackData(favorite).type" class="track-type" :class="getTrackData(favorite).type">
                      {{ getTrackTypeName(getTrackData(favorite).type) }}
                    </span>
                  </div>
                  <div class="card-actions">
                    <router-link :to="`/MapOfTracks${favorite.trackId}`" class="view-btn" title="View on map">
                      <i class="fas fa-map-marker-alt"></i>
                    </router-link>
                    <button @click="removeFromFavorites(favorite.trackId)" class="remove-btn" title="Remove">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="tab-panel settings-panel">
            <h2>
              <i class="fas fa-cog"></i>
              Account Settings
            </h2>
            
            <!-- Success/Error Messages -->
            <div v-if="updateMessage" class="alert alert-success">
              <i class="fas fa-check-circle"></i>
              {{ updateMessage }}
            </div>
            <div v-if="updateError" class="alert alert-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ updateError }}
            </div>
            
            <div class="settings-sections">
              <div class="settings-section">
                <h3>
                  <i class="fas fa-user"></i>
                  Profile Information
                </h3>
                
                <!-- Username Edit -->
                <div class="setting-item">
                  <label>Username</label>
                  <div class="setting-value" v-if="!isEditingUsername">
                    <span>{{ username }}</span>
                    <button class="edit-btn" @click="startEditingUsername">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                  <div class="setting-edit" v-else>
                    <input 
                      v-model="editedUsername" 
                      type="text" 
                      class="edit-input"
                      placeholder="Enter new username"
                      @keyup.enter="saveUsername"
                      @keyup.esc="cancelEditingUsername"
                    />
                    <div class="edit-actions">
                      <button 
                        class="save-btn" 
                        @click="saveUsername"
                        :disabled="isSaving"
                      >
                        <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                      </button>
                      <button 
                        class="cancel-btn" 
                        @click="cancelEditingUsername"
                        :disabled="isSaving"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Email Edit -->
                <div class="setting-item">
                  <label>Email</label>
                  <div class="setting-value" v-if="!isEditingEmail">
                    <span>{{ userEmail }}</span>
                    <button class="edit-btn" @click="startEditingEmail">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                  <div class="setting-edit" v-else>
                    <input 
                      v-model="editedEmail" 
                      type="email" 
                      class="edit-input"
                      placeholder="Enter new email"
                      @keyup.enter="saveEmail"
                      @keyup.esc="cancelEditingEmail"
                    />
                    <div class="edit-actions">
                      <button 
                        class="save-btn" 
                        @click="saveEmail"
                        :disabled="isSaving"
                      >
                        <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                      </button>
                      <button 
                        class="cancel-btn" 
                        @click="cancelEditingEmail"
                        :disabled="isSaving"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h3>
                  <i class="fas fa-bell"></i>
                  Notifications
                </h3>
                <div class="setting-item">
                  <label>Email Notifications</label>
                  <div class="setting-toggle">
                    <input type="checkbox" id="email-notifications" checked>
                    <label for="email-notifications" class="toggle-switch"></label>
                  </div>
                </div>
                <div class="setting-item">
                  <label>New Track Alerts</label>
                  <div class="setting-toggle">
                    <input type="checkbox" id="track-alerts">
                    <label for="track-alerts" class="toggle-switch"></label>
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h3>
                  <i class="fas fa-shield-alt"></i>
                  Privacy & Security
                </h3>
                <div class="setting-item">
                  <label>Change Password</label>
                  <button class="action-button secondary">
                    <i class="fas fa-key"></i>
                    Update Password
                  </button>
                </div>
                <div class="setting-item">
                  <label>Two-Factor Authentication</label>
                  <button class="action-button secondary">
                    <i class="fas fa-lock"></i>
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div class="settings-section danger-zone">
                <h3>
                  <i class="fas fa-exclamation-triangle"></i>
                  Danger Zone
                </h3>
                <div class="setting-item">
                  <div>
                    <label>Delete Account</label>
                    <p style="color: #6c757d; font-size: 0.9rem; margin: 5px 0 0 0;">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                  <button class="action-button danger" @click="showDeleteDialog">
                    <i class="fas fa-trash"></i>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Delete Account Confirmation Modal -->
          <div v-if="showDeleteConfirmation" class="modal-overlay" @click.self="cancelDelete">
            <div class="modal-content">
              <div class="modal-header">
                <h2>
                  <i class="fas fa-exclamation-triangle"></i>
                  Delete Account
                </h2>
                <button class="modal-close" @click="cancelDelete">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="modal-body">
                <div class="warning-box">
                  <i class="fas fa-exclamation-circle"></i>
                  <p><strong>Warning:</strong> This action cannot be undone!</p>
                </div>
                
                <p>Deleting your account will permanently remove:</p>
                <ul>
                  <li>Your profile and account information</li>
                  <li>All your favorite tracks</li>
                  <li>Your bike size calculations</li>
                  <li>All your personal data</li>
                </ul>
                
                <div v-if="updateError" class="alert alert-error">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ updateError }}
                </div>
                
                <div class="confirm-input">
                  <label>
                    Type your username <strong>{{ username }}</strong> to confirm:
                  </label>
                  <input 
                    v-model="deleteConfirmText" 
                    type="text" 
                    class="edit-input"
                    :placeholder="username"
                    @keyup.enter="confirmDeleteAccount"
                    @keyup.esc="cancelDelete"
                  />
                </div>
              </div>
              
              <div class="modal-footer">
                <button 
                  class="action-button secondary" 
                  @click="cancelDelete"
                  :disabled="isDeleting"
                >
                  Cancel
                </button>
                <button 
                  class="action-button danger" 
                  @click="confirmDeleteAccount"
                  :disabled="isDeleting || deleteConfirmText !== username"
                >
                  <i class="fas" :class="isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                  {{ isDeleting ? 'Deleting...' : 'Delete My Account' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="tab-panel notifications-panel">
            <h2>
              <i class="fas fa-bell"></i>
              Notifications
            </h2>
            
            <div class="notifications-list">
              <div class="notification-item">
                <div class="notification-icon">
                  <i class="fas fa-info-circle"></i>
                </div>
                <div class="notification-content">
                  <h3>Welcome to BMX Tracker!</h3>
                  <p>Thanks for joining our community. Start exploring tracks and calculating your perfect bike size.</p>
                  <span class="notification-time">{{ formatDate(new Date()) }}</span>
                </div>
                <button class="notification-close">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>No new notifications</h3>
                <p>You're all caught up! We'll notify you when there's something new.</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Main Layout */
.user-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #667eea;
}

.loading i {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.loading span {
  font-size: 1.1rem;
  font-weight: 500;
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
  color: white;
  padding: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.profile-picture {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-details h1 {
  margin: 0 0 5px;
  font-size: 2rem;
  font-weight: 700;
}

.user-details .email {
  margin: 0 0 5px;
  opacity: 0.9;
  font-size: 1rem;
}

.user-details .member-since {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.logout-button {
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.logout-button:hover {
  background: rgba(192, 57, 43, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
}

/* Tab Navigation */
.tab-navigation {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0 30px;
}

.tab-container {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-container::-webkit-scrollbar {
  display: none;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #6c757d;
  border-radius: 10px 10px 0 0;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.tab-button.active {
  background: white;
  color: #27ae60;
  font-weight: 600;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 2px 2px 0 0;
}

.tab-button i {
  font-size: 1rem;
}

/* Tab Content */
.tab-content {
  background: white;
}

.tab-panel {
  padding: 30px;
  min-height: 400px;
}

/* Panel Headers */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.panel-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
}

.panel-header h2 i {
  color: #27ae60;
}

.count-badge {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 600;
  margin-left: 10px;
}

/* Action Buttons */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.action-button.primary {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
}

.action-button.secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.action-button.secondary:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.action-button.danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.action-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
}

/* Loading and Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
}

.loading-state i, .empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dee2e6;
}

.loading-state i {
  color: #27ae60;
}

.empty-state h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  color: #495057;
}

.empty-state p {
  margin: 0 0 25px;
  font-size: 1rem;
  max-width: 400px;
  line-height: 1.6;
}

/* Overview Tab Styles */
.overview-panel h2 {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.stat-info h3 {
  margin: 0 0 5px;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

.recent-activity {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #e9ecef;
}

.recent-activity h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.recent-activity h3 i {
  color: #27ae60;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.activity-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.activity-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.activity-icon.bike {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.activity-icon.bike.MTB {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.activity-icon.bike.BMX_FREESTYLE {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.activity-icon.bike.BMX_RACING {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.activity-icon.favorite {
  background: linear-gradient(135deg, #e74c3c, #ec7063);
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 5px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.activity-content p {
  margin: 0 0 5px;
  color: #6c757d;
}

.activity-date {
  font-size: 0.9rem;
  color: #adb5bd;
  font-weight: 500;
}

/* Bike Calculator Tab Styles */
.calculations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.calculation-card {
  background: white;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calculation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.calculation-card .card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.calc-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.calc-icon.MTB {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.calc-icon.BMX_FREESTYLE {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.calc-icon.BMX_RACING {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.calc-info {
  flex: 1;
}

.calc-type {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #27ae60;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calc-info h3 {
  margin: 0 0 5px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
}

.calc-info p {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
}

.delete-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.card-date {
  padding: 15px 20px;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

/* Favorites Tab Styles */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: white;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.favorite-card .card-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.track-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.track-icon.skatepark {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.track-icon.pumptrack {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.track-icon.bmx_track {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.track-icon:not(.skatepark):not(.pumptrack):not(.bmx_track) {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.track-info {
  flex: 1;
}

.track-info h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

.track-type {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.track-type.skatepark {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.track-type.pumptrack {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.track-type.bmx_track {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.card-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.view-btn, .remove-btn {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  text-decoration: none;
}

.view-btn {
  color: #3498db;
}

.view-btn:hover {
  background: rgba(52, 152, 219, 0.1);
  transform: scale(1.1);
}

.remove-btn {
  color: #e74c3c;
}

.remove-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  transform: scale(1.1);
}

/* Settings Tab Styles */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: white;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  padding: 25px;
}

.settings-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.settings-section h3 i {
  color: #27ae60;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-item label {
  font-weight: 500;
  color: #495057;
  font-size: 1rem;
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-value span {
  color: #6c757d;
  font-weight: 500;
}

.edit-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: #e9ecef;
  color: #495057;
}

/* Alert Messages */
.alert {
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Edit Mode Styles */
.setting-edit {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.edit-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #27ae60;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.edit-input:focus {
  outline: none;
  border-color: #229954;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}

.edit-actions {
  display: flex;
  gap: 5px;
}

.save-btn, .cancel-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #229954;
  transform: scale(1.05);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: scale(1.05);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.setting-toggle {
  position: relative;
}

.setting-toggle input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-switch:before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s;
}

input[type="checkbox"]:checked + .toggle-switch {
  background-color: #27ae60;
}

input[type="checkbox"]:checked + .toggle-switch:before {
  transform: translateX(26px);
}

.danger-zone {
  border: 2px solid #e74c3c !important;
  background: linear-gradient(135deg, #ffeaea 0%, #ffffff 100%) !important;
}

.danger-zone h3 {
  color: #e74c3c !important;
  border-bottom-color: #fdeaea !important;
}

.danger-zone h3 i {
  color: #e74c3c !important;
}

/* Delete Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 25px;
  border-bottom: 2px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #e74c3c;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 25px;
}

.warning-box {
  background: linear-gradient(135deg, #ffeaea 0%, #ffd6d6 100%);
  border-left: 4px solid #e74c3c;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-box i {
  color: #e74c3c;
  font-size: 1.5rem;
}

.warning-box p {
  margin: 0;
  color: #721c24;
  font-weight: 500;
}

.modal-body p {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 10px;
}

.modal-body ul {
  color: #495057;
  line-height: 1.8;
  margin: 0 0 20px 20px;
}

.modal-body ul li {
  margin: 5px 0;
}

.confirm-input {
  margin-top: 25px;
}

.confirm-input label {
  display: block;
  margin-bottom: 10px;
  color: #495057;
  font-weight: 500;
}

.confirm-input label strong {
  color: #e74c3c;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 2px solid #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Notifications Tab Styles */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  background: white;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.notification-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.notification-content p {
  margin: 0 0 8px;
  color: #6c757d;
  line-height: 1.5;
}

.notification-time {
  font-size: 0.9rem;
  color: #adb5bd;
  font-weight: 500;
}

.notification-close {
  background: transparent;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f8f9fa;
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-profile {
    padding: 10px;
  }
  
  .profile-container {
    border-radius: 15px;
  }
  
  .profile-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .tab-navigation {
    padding: 0 15px;
  }
  
  .tab-button {
    padding: 12px 15px;
    font-size: 0.9rem;
  }
  
  .tab-button span {
    display: none;
  }
  
  .tab-panel {
    padding: 20px 15px;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .calculations-grid, .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .setting-value,
  .setting-edit {
    width: 100%;
  }
  
  .edit-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .user-details h1 {
    font-size: 1.5rem;
  }
  
  .panel-header h2 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
}
</style>
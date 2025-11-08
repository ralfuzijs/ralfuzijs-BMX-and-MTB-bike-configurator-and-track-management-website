<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import AdminTrackManagementView from './admin-track-management-view.vue';
// Import other admin components as needed:
// import AdminBikeSizeCalcView from './admin-bike-size-calc-view.vue';
// import AdminBikeConfigView from './admin-bike-config-view.vue';
import AdminUserManagementView from './admin-user-management-view.vue';
import AdminSettingsView from './admin-settings-view.vue';

// Authentication
const router = useRouter();
const { logout, isAdmin, userRole } = useAuth();

// Verify authentication on component mount
onMounted(() => {
  console.log('Admin view mounted, checking admin status');
  console.log('Current user role:', userRole.value);
  
  if (!isAdmin()) {
    console.log('Not authenticated as admin, redirecting to login');
    router.push('/login');
  } else {
    console.log('Admin authentication verified');
  }
});

// Handle logout
const handleLogout = () => {
  logout();
  router.push('/login');
};

// Load default view from preferences
function getDefaultView() {
  const savedPrefs = localStorage.getItem('adminPreferences');
  if (savedPrefs) {
    try {
      const prefs = JSON.parse(savedPrefs);
      return prefs.defaultView || 'tracks';
    } catch (e) {
      console.error('Error loading preferences:', e);
      return 'tracks';
    }
  }
  return 'tracks';
}

// Sidebar and content state
const activeSection = ref(getDefaultView()); // Load from preferences or default to 'tracks'
const sidebarCollapsed = ref(false);
const message = ref('');
const messageIsError = ref(false);

function changeSection(section) {
  activeSection.value = section;
  message.value = '';
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function handleMessage(msgObj) {
  message.value = msgObj.text;
  messageIsError.value = msgObj.isError;
  // You can add more handling like auto-clearing messages after some time
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <i class="fas" :class="sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </div>
      
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      
      <nav class="sidebar-nav">
        <div 
          class="nav-item" 
          :class="{ active: activeSection === 'tracks' }"
          @click="changeSection('tracks')"
        >
          <i class="fas fa-map-marker-alt"></i>
          <span v-if="!sidebarCollapsed">Track Management</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeSection === 'calculator' }"
          @click="changeSection('calculator')"
        >
          <i class="fas fa-calculator"></i>
          <span v-if="!sidebarCollapsed">Bike Size Calculator</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeSection === 'configurator' }"
          @click="changeSection('configurator')"
        >
          <i class="fas fa-bicycle"></i>
          <span v-if="!sidebarCollapsed">Bike Configurator</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeSection === 'users' }"
          @click="changeSection('users')"
        >
          <i class="fas fa-users"></i>
          <span v-if="!sidebarCollapsed">User Management</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeSection === 'settings' }"
          @click="changeSection('settings')"
        >
          <i class="fas fa-cog"></i>
          <span v-if="!sidebarCollapsed">Settings</span>
        </div>
        
        <div class="nav-item logout" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!sidebarCollapsed">Logout</span>
        </div>
      </nav>
    </div>
    
    <!-- Main content area -->
    <div class="main-content">
      <div v-if="message" class="message" :class="{ error: messageIsError }">
        {{ message }}
      </div>
      
      <!-- Tracks Management Section -->
      <AdminTrackManagementView 
        v-if="activeSection === 'tracks'" 
        @message="handleMessage"
      />
      
      <!-- Calculator Section -->
      <div v-else-if="activeSection === 'calculator'" class="content-section">
        <div class="section-header">
          <h1>Bike Size Calculator Admin</h1>
        </div>
        <div class="empty-section">
          <i class="fas fa-calculator section-icon"></i>
          <p>Bike Size Calculator management will be implemented here.</p>
        </div>
      </div>
      
      <!-- Configurator Section -->
      <div v-else-if="activeSection === 'configurator'" class="content-section">
        <div class="section-header">
          <h1>Bike Configurator Admin</h1>
        </div>
        <div class="empty-section">
          <i class="fas fa-bicycle section-icon"></i>
          <p>Bike Configurator management will be implemented here.</p>
        </div>
      </div>
        <!-- Users Section -->
      <AdminUserManagementView 
        v-else-if="activeSection === 'users'" 
        @message="handleMessage"
      />
      
      <!-- Settings Section -->
      <AdminSettingsView 
        v-else-if="activeSection === 'settings'" 
        @message="handleMessage"
      />
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Sidebar styles */
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  transition: width 0.3s ease;
  position: relative;
  flex-shrink: 0;
  z-index: 10;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.sidebar-header {
  padding: 20px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 15px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: #3498db;
}

.nav-item i {
  margin-right: 15px;
  width: 20px;
  text-align: center;
}

.nav-item.logout {
  margin-top: auto;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  margin-top: 20px;
}

.nav-item.logout:hover {
  background-color: rgba(231, 76, 60, 0.2);
}

/* Main content styles */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
  position: relative;
  z-index: 20;
}

/* Message styles */
.message {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

/* Empty section styles */
.content-section {
  margin-bottom: 20px;
}

.empty-section {
  text-align: center;
  padding: 50px 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-icon {
  font-size: 48px;
  color: #3498db;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar.collapsed {
    height: 60px;
    width: 100%;
  }
  
  .sidebar-nav {
    flex-direction: column;
  }
  
  .nav-item {
    text-align: left;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .main-content {
    margin-top: 10px;
  }
}
</style>
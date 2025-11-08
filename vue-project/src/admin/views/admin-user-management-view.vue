<script setup>
import { ref, onMounted, defineEmits, computed } from 'vue';
import { userApi } from '@/services/api';

const emit = defineEmits(['message']);

// User management state
const userData = ref({
  username: '',
  email: '',
  password: '',
  role: 'user', // Default value
  profilePicture: '/images/default-profile.png'
});

const loading = ref(false);
const allUsers = ref([]);
const editMode = ref(false);
const currentEditId = ref(null);
const deleteConfirmation = ref(false);
const userToDelete = ref(null);
const activeView = ref('list'); // 'list' or 'add'

// Filter state
const searchQuery = ref('');
const roleFilter = ref('all'); // 'all', 'user', 'admin'

// Computed property for filtered users
const filteredUsers = computed(() => {
  return allUsers.value.filter(user => {
    // Exclude admin users
    if (user.role === 'admin') {
      return false;
    }
    
    // Apply role filter
    if (roleFilter.value !== 'all' && user.role !== roleFilter.value) {
      return false;
    }
    
    // Apply search query filter (on username or email)
    if (searchQuery.value && 
        !user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    
    return true;
  });
});

// Clear all filters
function clearFilters() {
  searchQuery.value = '';
  roleFilter.value = 'all';
}

// Functions for user management
async function fetchUsers() {
  try {
    loading.value = true;
    const result = await userApi.getAllUsers();
    
    if (result.success) {
      allUsers.value = result.data;
    } else {
      emit('message', {text: result.error || 'Error fetching users', isError: true});
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    emit('message', {text: `Error fetching users: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  userData.value = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    profilePicture: '/images/default-profile.png'  };
  editMode.value = false;
  currentEditId.value = null;
}

function editUser(user) {
  userData.value = {
    username: user.username,
    email: user.email,
    password: '', // Don't set password when editing
    role: user.role || 'user',
    profilePicture: user.profilePicture || '/images/default-profile.png'
  };
  
  editMode.value = true;
  currentEditId.value = user.id;
  activeView.value = 'add';
  emit('message', {text: '', isError: false});
}

function confirmDelete(user) {
  userToDelete.value = user;
  deleteConfirmation.value = true;
}

function cancelDelete() {
  userToDelete.value = null;
  deleteConfirmation.value = false;
}

async function deleteUser() {
  if (!userToDelete.value) return;
  
  loading.value = true;
  try {
    const result = await userApi.deleteUser(userToDelete.value.id);
    
    if (result.success) {
      emit('message', {text: 'User deleted successfully', isError: false});
      fetchUsers();
    } else {
      emit('message', {text: result.error || 'Error deleting user', isError: true});
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    emit('message', {text: `Error: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
    deleteConfirmation.value = false;
    userToDelete.value = null;
  }
}

async function submitUser() {
  loading.value = true;
  emit('message', {text: '', isError: false});
  
  try {
    let result;
    
    if (editMode.value) {
      // When editing, only include password if it was changed
      const updateData = { ...userData.value };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      result = await userApi.updateUser(currentEditId.value, updateData);
      if (result.success) {
        emit('message', {text: 'User updated successfully', isError: false});
      }
    } else {
      result = await userApi.register(userData.value);
      if (result.success) {
        emit('message', {text: 'User created successfully', isError: false});
      }
    }
    
    if (!result.success) {
      emit('message', {text: result.error || 'Error saving user', isError: true});
      return;
    }
    
    resetForm();
    activeView.value = 'list';
    fetchUsers();
  } catch (error) {
    console.error('Error submitting user:', error);
    emit('message', {text: `Error: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  resetForm();
  activeView.value = 'list';
  emit('message', {text: '', isError: false});
}

function changeView(view) {
  activeView.value = view;
  if (view === 'list') {
    fetchUsers();
  } else if (view === 'add' && editMode.value === false) {
    resetForm();  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>  <div class="content-section">
    <div class="section-header">
      <h1>User Management</h1>
    </div>
    
    <!-- Add New User Button - positioned under heading and above filters -->
    <div v-if="activeView === 'list'" class="add-user-button-container">
      <button 
        class="add-user-button"
        @click="changeView('add')"
      >
        <i class="fas fa-user-plus"></i> Add New User
      </button>
      
      <button 
        @click="clearFilters" 
        class="clear-filters-button"
        v-if="searchQuery || roleFilter !== 'all'"
      >
        <i class="fas fa-times"></i> Clear Filters
      </button>
    </div>
    
    <!-- Filters section - positioned below the button -->
    <div v-if="activeView === 'list'" class="filters-section">
      <div class="filter-row">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search users..." 
            class="search-input"
          >
        </div>
        <div class="role-filter">
          <select v-model="roleFilter">
            <option value="all">All Roles</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- User List View -->
    <div v-if="activeView === 'list'" class="view-content">
      
      <!-- Loading Indicator -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Loading users...
      </div>
      
      <!-- No Users Message -->
      <div v-else-if="filteredUsers.length === 0" class="no-users">
        <i class="fas fa-users"></i>
        <p>No users found. {{ searchQuery || roleFilter !== 'all' ? 'Try adjusting your filters.' : '' }}</p>
      </div>
      
      <!-- Users Table -->
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role }}
              </span>
            </td>
            <td>{{ user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never' }}</td>
            <td>
              <div class="actions">
                <button class="edit-button" @click="editUser(user)" title="Edit User">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-button" @click="confirmDelete(user)" title="Delete User">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit User Form -->
    <div v-else-if="activeView === 'add'" class="view-content">
      <div class="section-header">
        <h1>{{ editMode ? 'Edit User' : 'Add New User' }}</h1>
      </div>
      
      <form @submit.prevent="submitUser">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="userData.username" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="userData.email" 
            required
          >
        </div>
          <div class="form-group">
          <label for="password">{{ editMode ? 'Password (leave blank to keep unchanged)' : 'Password' }}</label>
          <input 
            type="password" 
            id="password" 
            v-model="userData.password" 
            :required="!editMode"
          >
        </div>
        
        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="userData.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="profilePicture">Profile Picture URL</label>
          <input 
            type="text" 
            id="profilePicture" 
            v-model="userData.profilePicture"
          >
        </div>
        
        <div class="button-group">
          <button 
            type="submit" 
            class="primary-button" 
            :disabled="loading"
          >
            <i class="fas" :class="editMode ? 'fa-save' : 'fa-user-plus'"></i>
            {{ editMode ? 'Update User' : 'Create User' }}
          </button>
          
          <button 
            type="button" 
            class="secondary-button" 
            @click="cancelEdit"
            :disabled="loading"
          >
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmation" class="modal-overlay">
      <div class="modal">
        <h3>Confirm Delete</h3>
        <p class="warning">
          Are you sure you want to delete this user: <strong>{{ userToDelete?.username }}</strong>?
        </p>
        <p class="warning">This action cannot be undone.</p>
        
        <div class="button-group">
          <button 
            class="delete-button" 
            @click="deleteUser" 
            :disabled="loading"
          >
            <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-trash-alt'"></i>
            Delete User
          </button>
          
          <button 
            class="secondary-button" 
            @click="cancelDelete" 
            :disabled="loading"
          >
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* View styles */
.view-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.view-controls button {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.view-controls button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.view-controls button:hover:not(.active) {
  background-color: #e0e0e0;
}

.view-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
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

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Button styles */
button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-button {
  background-color: #3498db;
  color: white;
  order: 1;
  position: static;
  right: auto;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
  order: 2;
  position: static;
  left: auto;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  height: 40px;
}

.edit-button {
  background-color: #3498db;
  color: white;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: nowrap;
}

.button-group button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 120px;
}

.button-group button i {
  font-size: 14px;
}

/* Table styles */
.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.users-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.users-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.users-table tr:hover {
  background-color: #f1f1f1;
}

.users-table td {
  position: relative;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.edit-button, .delete-button {
  position: static;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 4px;
}

.edit-button i, .delete-button i {
  margin: 0;
  font-size: 14px;
}

/* Role badge styles */
.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
}

.role-badge.user {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.role-badge.admin {
  background-color: #E3F2FD;
  color: #1565C0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-top: 0;
  color: #e74c3c;
}

.modal .warning {
  color: #333;
  margin-bottom: 20px;
}

.modal .button-group {
  justify-content: flex-end;
}

.modal .delete-button {
  margin-left: 10px;
}

.modal .secondary-button {
  background-color: #f0f0f0;
}

.loading, .no-users {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 18px;
}

.no-users i, .loading i {
  font-size: 32px;
  margin-bottom: 10px;
  color: #999;
  display: block;
}

/* Updated styles for the buttons container */
.add-user-button-container {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
}

/* Style for Add New User button */
.add-user-button {
  background-color: #27ae60;
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.add-user-button:hover {
  background-color: #2ecc71;
}

.add-user-button i {
  font-size: 14px;
}

/* Updated style for Clear Filters button */
.clear-filters-button {
  padding: 10px 15px;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.clear-filters-button:hover {
  background-color: #e0e0e0;
}

/* Add these styles for filters */
.filters-section {
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 90%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.role-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 150px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .add-user-button-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .add-user-button,
  .clear-filters-button {
    width: 100%;
    justify-content: center;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-filter, .role-filter {
    width: 100%;
  }
  
  .users-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
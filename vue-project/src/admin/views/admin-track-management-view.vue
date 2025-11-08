<script setup>
import { ref, onMounted, defineEmits, computed } from 'vue';
import { trackApi } from '@/services/api';

const emit = defineEmits(['message']);

// Track management state
const trackData = ref({
  name: '',
  type: 'skatepark', // Default value
  location: {
    coordinates: [0, 0] // [longitude, latitude]
  },
  imageUrl: ''
});

const loading = ref(false);
const allTracks = ref([]);
const editMode = ref(false);
const currentEditId = ref(null);
const deleteConfirmation = ref(false);
const trackToDelete = ref(null);
const activeView = ref('list'); // 'list' or 'add'

// Filter state
const searchQuery = ref('');
const typeFilter = ref('all'); // 'all', 'skatepark', 'pumptrack', 'bmx_track'

// Computed property for filtered tracks
const filteredTracks = computed(() => {
  return allTracks.value.filter(track => {
    // Apply type filter
    if (typeFilter.value !== 'all' && track.type !== typeFilter.value) {
      return false;
    }
    
    // Apply search query filter
    if (searchQuery.value && !track.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    
    return true;
  });
});

// Clear all filters
function clearFilters() {
  searchQuery.value = '';
  typeFilter.value = 'all';
}

// Functions for track management
async function fetchTracks() {
  try {
    loading.value = true;
    const result = await trackApi.getAllTracks();
    
    if (result.success) {
      allTracks.value = result.data;
    }
  } catch (error) {
    console.error('Error fetching tracks:', error);
    emit('message', {text: `Error fetching tracks: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  trackData.value = {
    name: '',
    type: 'skatepark',
    location: {
      coordinates: [0, 0]
    },
    imageUrl: ''
  };
  editMode.value = false;
  currentEditId.value = null;
}

function editTrack(track) {
  trackData.value = {
    name: track.name,
    type: track.type,
    location: {
      coordinates: [
        typeof track.location.coordinates[0] === 'string' 
          ? parseFloat(track.location.coordinates[0]) 
          : track.location.coordinates[0],
        typeof track.location.coordinates[1] === 'string' 
          ? parseFloat(track.location.coordinates[1]) 
          : track.location.coordinates[1]
      ]
    },
    imageUrl: track.imageUrl || ''
  };
  
  editMode.value = true;
  currentEditId.value = track._id;
  activeView.value = 'add';
  emit('message', {text: '', isError: false});
}

function confirmDelete(track) {
  trackToDelete.value = track;
  deleteConfirmation.value = true;
}

function cancelDelete() {
  trackToDelete.value = null;
  deleteConfirmation.value = false;
}

async function deleteTrack() {
  if (!trackToDelete.value) return;
  
  loading.value = true;
  try {
    const result = await trackApi.deleteTrack(trackToDelete.value._id);
    
    if (result.success) {
      emit('message', {text: 'Track deleted successfully!', isError: false});
      allTracks.value = allTracks.value.filter(t => t._id !== trackToDelete.value._id);
    } else {
      emit('message', {text: `Error: ${result.error}`, isError: true});
    }
  } catch (error) {
    emit('message', {text: `Error: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
    deleteConfirmation.value = false;
    trackToDelete.value = null;
  }
}

async function submitTrack() {
  loading.value = true;
  emit('message', {text: '', isError: false});
  
  try {
    const formattedTrackData = {
      ...trackData.value,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(trackData.value.location.coordinates[0]),
          parseFloat(trackData.value.location.coordinates[1])
        ]
      }
    };
    
    let result;
    
    if (editMode.value && currentEditId.value) {
      result = await trackApi.updateTrack(currentEditId.value, formattedTrackData);
    } else {
      result = await trackApi.createTrack(formattedTrackData);
    }
    
    if (result.success) {
      if (editMode.value) {
        emit('message', {text: 'Track updated successfully!', isError: false});
        const index = allTracks.value.findIndex(t => t._id === currentEditId.value);
        if (index !== -1) {
          allTracks.value[index] = result.data;
        }
      } else {
        emit('message', {text: 'Track added successfully!', isError: false});
        allTracks.value.push(result.data);
      }
      
      resetForm();
      if (editMode.value) {
        activeView.value = 'list';
      }
    } else {
      const errorMsg = Array.isArray(result.error) ? result.error.join(', ') : result.error;
      
      // Check if the error message indicates a duplicate track
      if (errorMsg.includes('already exists')) {
        emit('message', {text: `Duplicate Track: ${errorMsg}`, isError: true});
      } else {
        emit('message', {text: `Error: ${errorMsg}`, isError: true});
      }
    }
  } catch (error) {
    console.error('Track operation error:', error);
    emit('message', {text: `Error: ${error.message}`, isError: true});
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  resetForm();
  emit('message', {text: '', isError: false});
}

function changeView(view) {
  activeView.value = view;
  if (view === 'list') {
    fetchTracks();
  } else if (view === 'add' && editMode.value === false) {
    resetForm();
  }
}

onMounted(() => {
  fetchTracks();
});
</script>

<template>
  <div class="content-section">
    <div class="section-header">
      <h1>Track Management</h1>
    </div>
    
    <!-- Add New Track Button and Clear Filters - only visible when in list view -->
    <div v-if="activeView === 'list'" class="add-track-button-container">
      <button 
        class="add-track-button"
        @click="changeView('add')"
      >
        <i class="fas fa-plus"></i> Add New Track
      </button>
      
      <button 
        @click="clearFilters" 
        class="clear-filters-button"
        v-if="searchQuery || typeFilter !== 'all'"
      >
        <i class="fas fa-times"></i> Clear Filters
      </button>
    </div>
    
    <!-- Filters section - only visible in list view -->
    <div v-if="activeView === 'list'" class="filters-section">
      <div class="filter-row">
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search tracks..." 
            class="search-input"
          >
        </div>
        
        <div class="type-filter">
          <select v-model="typeFilter">
            <option value="all">All Types</option>
            <option value="skatepark">Skatepark</option>
            <option value="pumptrack">Pumptrack</option>
            <option value="bmx_track">BMX Track</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Track Form -->
    <div v-if="activeView === 'add'" class="view-content">
      <form @submit.prevent="submitTrack">
        <div class="form-group">
          <label for="name">Track Name:</label>
          <input type="text" id="name" v-model="trackData.name" required>
        </div>
        
        <div class="form-group">
          <label for="type">Track Type:</label>
          <select id="type" v-model="trackData.type" required>
            <option value="skatepark">Skatepark</option>
            <option value="pumptrack">Pumptrack</option>
            <option value="bmx_track">BMX Track</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Location Coordinates:</label>
          <div class="coordinates-info">
            <p class="coordinate-example">Example: For Riga city center: Longitude = 24.1052, Latitude = 56.9496</p>
          </div>
          <div class="coordinates-inputs">
            <div class="input-with-label">
              <label for="longitude">Longitude (first number):</label>
              <input 
                id="longitude"
                placeholder="Longitude (e.g., 24.1052)" 
                v-model="trackData.location.coordinates[0]" 
                required
              >
              <small>Longitude runs east-west (horizontal)</small>
            </div>
            <div class="input-with-label">
              <label for="latitude">Latitude (second number):</label>
              <input 
                id="latitude"
                placeholder="Latitude (e.g., 56.9496)" 
                v-model="trackData.location.coordinates[1]" 
                required
              >
              <small>Latitude runs north-south (vertical)</small>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="imageUrl">Image URL:</label>
          <input type="text" id="imageUrl" v-model="trackData.imageUrl">
        </div>
        
        <!-- Button group with repositioned All Tracks button -->
        <div class="button-group">
          <button type="submit" :disabled="loading" class="primary-button">
            {{ loading ? 'Saving...' : (editMode ? 'Update Track' : 'Add Track') }}
          </button>
          
          <button 
            type="button" 
            @click="changeView('list')" 
            class="secondary-button"
          >
            <i class="fas fa-list"></i> Back
          </button>
          
          <button 
            v-if="editMode" 
            type="button" 
            @click="cancelEdit" 
            class="secondary-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    
    <!-- Manage Tracks Table -->
    <div v-if="activeView === 'list'" class="view-content">
      <div v-if="loading" class="loading">Loading tracks...</div>
      
      <div v-else-if="allTracks.length === 0" class="no-tracks">
        No tracks found. Add some tracks first.
      </div>
      
      <div v-else-if="filteredTracks.length === 0" class="no-tracks">
        No tracks match your filters. Try different filters or add new tracks.
      </div>
      
      <table v-else class="tracks-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="track in filteredTracks" :key="track._id">
            <td>{{ track.name }}</td>
            <td>
              <span :class="'type-badge ' + track.type">
                {{ track.type === 'bmx_track' ? 'BMX Track' : 
                   track.type.charAt(0).toUpperCase() + track.type.slice(1) }}
              </span>
            </td>
            <td>
              <small>Lng: {{ track.location.coordinates[0].toFixed(8) }} | </small>
              <small>Lat: {{ track.location.coordinates[1].toFixed(8) }}</small>
            </td>
            <td class="actions">
              <button @click="editTrack(track)" class="edit-button">
                <i class="fas fa-edit"></i> 
              </button>
              <button @click="confirmDelete(track)" class="delete-button">
                <i class="fas fa-trash"></i> 
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmation" class="modal-overlay">
      <div class="modal">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete track "{{ trackToDelete?.name }}"?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="button-group">
          <button @click="deleteTrack" class="delete-button">Yes, Delete</button>
          <button @click="cancelDelete" class="secondary-button">Cancel</button>
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
  position: relative;
  z-index: 30;
}

.view-controls button {
  padding: 8px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.view-controls button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
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

textarea {
  height: 100px;
}

.coordinates-inputs {
  display: flex;
  gap: 10px;
}

.coordinates-inputs input {
  flex: 1;
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
  order: 1; /* Set the order of buttons */
  position: static; /* Remove any absolute positioning */
  right: auto; /* Remove right positioning */
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
  order: 2; /* Set the order of buttons */
  position: static; /* Remove any absolute positioning */
  left: auto; /* Remove left positioning */
}

.delete-button {
  background-color: #e74c3c;
  color: white;
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
  flex-direction: row; /* Force horizontal layout */
  gap: 10px;
  margin-top: 20px;
  flex-wrap: nowrap; /* Prevent wrapping for main actions */
}

/* Make buttons maintain consistent sizing */
.button-group button {
  flex: 0 0 auto; /* Don't grow or shrink */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px; /* Space between icon and text */
  min-width: 120px; /* Minimum width to ensure buttons don't collapse */
}

/* Ensure consistent icon sizing */
.button-group button i {
  font-size: 14px;
}

/* Table styles */
.tracks-table {
  width: 100%;
  border-collapse: collapse;
}

.tracks-table th, .tracks-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.tracks-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.tracks-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.tracks-table tr:hover {
  background-color: #f1f1f1;
}

.tracks-table td {
  position: relative;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center; /* Center the buttons horizontally */
}

.edit-button, .delete-button {
  position: static; /* Remove any absolute positioning */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px; /* Fixed width for consistent sizing */
  height: 34px; /* Fixed height for consistent sizing */
  padding: 0; /* Remove padding */
  border-radius: 4px;
}

/* Remove the positioning properties that were causing issues */
.delete-button {
  background-color: #e74c3c;
  color: white;
  /* Remove right: 5px and left: auto */
}

.edit-button {
  background-color: #3498db;
  color: white;
  /* Remove left: auto */
}

/* Make the icons centered in the buttons */
.edit-button i, .delete-button i {
  margin: 0; /* Remove any margin */
  font-size: 14px; /* Adjust icon size as needed */
}

/* Type badge styles */
.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
}

.type-badge.skatepark {
  background-color: #E3F2FD;
  color: #1565C0;
}

.type-badge.pumptrack {
  background-color: #FFF3E0;
  color: #E65100;
}

.type-badge.bmx_track {
  background-color: #E8F5E9;
  color: #2E7D32;
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
  text-align: center;
  position: relative;
}

.modal h3 {
  margin-top: 0;
}

.modal .warning {
  color: #dc3545;
  font-weight: bold;
  margin-bottom: 30px;
}

.modal .button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.modal .delete-button {
  background-color: #e74c3c;
  color: white;
  min-width: 120px;
  display: inline-block;
}

.modal .secondary-button {
  background-color: #f0f0f0;
  color: #333;
  min-width: 120px;
  display: inline-block;
}

.loading, .no-tracks {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Updated styles for the buttons container */
.add-track-button-container {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;
}

/* Style for Add New Track button stays the same */
.add-track-button {
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
  margin-left: 200px; /* Added margin to move it to the right */
  margin-top: 30px; /* Added margin to move it down */
}

/* New styles for the add track button */
.add-track-button-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
}

.add-track-button {
  background-color: #27ae60;
  color: white;
  border-radius: 4px;
  padding: 10px 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.add-track-button:hover {
  background-color: #2ecc71;
}

.add-track-button i {
  font-size: 14px;
}

/* Add these new styles for filters */
.filters-section {
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter {
  flex: 1;
}

.search-input {
  width: 90%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.type-filter select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
}

.clear-filters-button {
  padding: 8px 12px;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.clear-filters-button:hover {
  background-color: #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .coordinates-inputs {
    flex-direction: column;
  }
  
  .tracks-table {
    display: block;
    overflow-x: auto;
  }
  
  .tracks-table th, 
  .tracks-table td {
    min-width: 120px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions button {
    margin-bottom: 5px;
  }
}
</style>
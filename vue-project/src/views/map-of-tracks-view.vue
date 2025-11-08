<script setup>
import { onMounted, ref, computed } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { trackApi, favoritesApi } from '@/services/api';
import { useAuth } from '@/composables/useAuth';
import ReviewSection from '@/components/review-section.vue';

const tracksLoaded = ref(false);
const isLoading = ref(true);
const selectedTrack = ref(null);
const showSidebar = ref(true);
const allTracks = ref([]);
const activeFilters = ref({
  skatepark: true,
  pumptrack: true,
  bmx_track: true
});

// Add refs for favorites
const favoriteTracks = ref([]);
const isFetchingFavorites = ref(false);

// Get auth state
const { isAuthenticated } = useAuth();

// Track statistics
const trackStats = computed(() => {
  return {
    total: allTracks.value.length,
    skateparks: allTracks.value.filter(t => t.type === 'skatepark').length,
    pumptracks: allTracks.value.filter(t => t.type === 'pumptrack').length,
    bmxTracks: allTracks.value.filter(t => t.type === 'bmx_track').length
  };
});

// Map reference
let map = null;
let layerGroups = {
  skateparks: null,
  pumptracks: null,
  bmx_tracks: null
};

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

function selectTrack(track) {
  selectedTrack.value = track;
  
  if (map && track) {
    const [lng, lat] = track.location.coordinates;
    map.flyTo([lat, lng], 15, {
      animate: true,
      duration: 1
    });
  }
}

function toggleFilter(type) {
  activeFilters.value[type] = !activeFilters.value[type];
  
  // Update map visibility based on filter state
  if (layerGroups[type === 'bmx_track' ? 'bmx_tracks' : type + 's']) {
    if (activeFilters.value[type]) {
      layerGroups[type === 'bmx_track' ? 'bmx_tracks' : type + 's'].addTo(map);
    } else {
      map.removeLayer(layerGroups[type === 'bmx_track' ? 'bmx_tracks' : type + 's']);
    }
  }
}

function getTrackTypeName(type) {
  if (type === 'bmx_track') return 'BMX Track';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// New function to add track to favorites
async function addToFavorites(trackId, event) {
  // Stop event propagation to prevent the popup from closing
  if (event) event.stopPropagation(); 
  
  if (!isAuthenticated.value) {
    alert('Please log in to add tracks to your favorites.');
    return;
  }
  
  try {
    const result = await favoritesApi.addFavorite(trackId);
    if (result.success) {
      fetchFavorites(); // Refresh favorites
      alert('Track added to favorites!');
    } else {
      console.error('Failed to add favorite:', result.error);
      alert('Failed to add track to favorites. ' + result.error);
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    alert('Error adding track to favorites.');
  }
}

// New function to remove track from favorites
async function removeFromFavorites(trackId, event) {
  if (event) event.stopPropagation();
  
  try {
    const result = await favoritesApi.removeFavorite(trackId);
    if (result.success) {
      fetchFavorites(); // Refresh favorites
      alert('Track removed from favorites!');
    } else {
      console.error('Failed to remove favorite:', result.error);
      alert('Failed to remove track from favorites.');
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    alert('Error removing track from favorites.');
  }
}

// New function to check if a track is favorited
function isTrackFavorited(trackId) {
  return favoriteTracks.value.some(fav => fav.trackId === trackId);
}

// New function to fetch user's favorites
async function fetchFavorites() {
  if (!isAuthenticated.value) return;
  
  isFetchingFavorites.value = true;
  try {
    const result = await favoritesApi.getAllFavorites();
    if (result.success) {
      favoriteTracks.value = result.data;
    } else {
      console.error('Failed to fetch favorites:', result.error);
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
  } finally {
    isFetchingFavorites.value = false;
  }
}

onMounted(async () => {
    // Initialize map
    map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([56.95, 24.11], 13);

    // Move zoom control to the right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Fix for the attribution control - replace the incorrect code
    L.control.attribution({
      position: 'bottomright',
      prefix: false,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // OpenStreetMap tile layer
    const OpenStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const googleMaps = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }); 

    // Custom marker icons
    const BikeIcon = L.Icon.extend({
      options: {
          iconSize: [35, 50],
          iconAnchor: [17, 48],
          popupAnchor: [0, -48],
          className: 'bike-marker-icon' // Add a class for styling
      }
    });

    const blueIcon = new BikeIcon({iconUrl: '/images/bike_point_blue.png'}),
          orangeIcon = new BikeIcon({iconUrl: '/images/bike_point_orange.png'}),
          greenIcon = new BikeIcon({iconUrl: '/images/bike_point_green.png'});
    
    // Create layer groups
    layerGroups.skateparks = L.layerGroup([]);
    layerGroups.pumptracks = L.layerGroup([]);
    layerGroups.bmx_tracks = L.layerGroup([]);

    // Fetch data from API
    try {
        isLoading.value = true;
        const result = await trackApi.getAllTracks();
        
        if (result.success) {
            allTracks.value = result.data;
            
            allTracks.value.forEach(track => {
                const [lng, lat] = track.location.coordinates;
                let marker;
                
                // Create popup content with functional favorite button
                const popupContent = `
                  <div class="track-popup">
                    <h3>${track.name}</h3>
                    ${track.description ? `<p>${track.description}</p>` : ''}
                    ${track.imageUrl ? `<img src="${track.imageUrl}" alt="${track.name}">` : ''}
                    <button class="favorite-track-btn" onclick="window.addToFavoritesFromPopup('${track._id}', event)">
                      <i class="fas fa-heart"></i> Add to Favorites
                    </button>
                  </div>
                `;

                // Select icon based on track type
                if (track.type === 'skatepark') {
                    marker = L.marker([lat, lng], {icon: blueIcon})
                        .bindPopup(popupContent);
                    layerGroups.skateparks.addLayer(marker);
                } else if (track.type === 'pumptrack') {
                    marker = L.marker([lat, lng], {icon: orangeIcon})
                        .bindPopup(popupContent);
                    layerGroups.pumptracks.addLayer(marker);
                } else if (track.type === 'bmx_track') {
                    marker = L.marker([lat, lng], {icon: greenIcon})
                        .bindPopup(popupContent);
                    layerGroups.bmx_tracks.addLayer(marker);
                }
            });
            
            // Create ways for interacting with popups from global scope
            window.addToFavoritesFromPopup = (trackId, event) => {
              addToFavorites(trackId, event);
            };
            
            window.removeFromFavoritesFromPopup = (trackId, event) => {
              removeFromFavorites(trackId, event);
            };
            
            window.selectTrackFromPopup = (trackId) => {
              const track = allTracks.value.find(t => t._id === trackId);
              if (track) {
                selectTrack(track);
              }
            };
            
            tracksLoaded.value = true;
            
            // Fetch favorites after tracks are loaded
            if (isAuthenticated.value) {
              fetchFavorites();
            }
        } else {
            console.error('Failed to load tracks:', result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error fetching tracks:', error);
    } finally {
        isLoading.value = false;
    }

    // Define base layers and overlays for the layers control
    var baseMaps = {
        "Open Street Map": OpenStreetMap,
        "Google Maps": googleMaps
    };

    var overlayMaps = {
        "Skateparks": layerGroups.skateparks,
        "Pumptracks": layerGroups.pumptracks,
        "BMX Tracks": layerGroups.bmx_tracks
    };

    // Add the Layer Control to the map
    var layerControl = L.control.layers(baseMaps, overlayMaps, {
      position: 'bottomleft',
      collapsed: false
    }).addTo(map);

    // Add the layers to the map by default
    layerGroups.skateparks.addTo(map);
    layerGroups.pumptracks.addTo(map);
    layerGroups.bmx_tracks.addTo(map);
    
    // Allow the map to adjust its size when the sidebar is toggled
    map.on('resize', () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 400);
    });

    // Add this timeout as a last-resort failsafe
    setTimeout(() => {
        if (isLoading.value) {
            console.warn('Force-clearing loading state after timeout');
            isLoading.value = false;
        }
    }, 10000); // Force clear loading after 10 seconds as failsafe
});
</script>

<template>
  <div class="map-container" :class="{'sidebar-open': showSidebar}">    <!-- Header -->
    <div class="map-header">
      <h1>
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i :class="showSidebar ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
        </button>
        <i class="fas fa-map-marker-alt"></i>
             Bike Track Explorer
      </h1>
      <div class="header-controls">
      </div>
    </div>
    
    <div class="map-content">
      <!-- Sidebar -->
      <div class="map-sidebar" v-show="showSidebar">
        <!-- Filter Controls -->
        <div class="sidebar-section">
          <h2>Filter Tracks</h2>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input type="checkbox" v-model="activeFilters.skatepark" @change="toggleFilter('skatepark')">
              <span class="checkbox-icon skatepark"><i class="fas fa-check"></i></span>
              <span>Skateparks</span>
              <span class="count">{{ trackStats.skateparks }}</span>
            </label>
            
            <label class="filter-checkbox">
              <input type="checkbox" v-model="activeFilters.pumptrack" @change="toggleFilter('pumptrack')">
              <span class="checkbox-icon pumptrack"><i class="fas fa-check"></i></span>
              <span>Pumptracks</span>
              <span class="count">{{ trackStats.pumptracks }}</span>
            </label>
            
            <label class="filter-checkbox">
              <input type="checkbox" v-model="activeFilters.bmx_track" @change="toggleFilter('bmx_track')">
              <span class="checkbox-icon bmx_track"><i class="fas fa-check"></i></span>
              <span>BMX Tracks</span>
              <span class="count">{{ trackStats.bmxTracks }}</span>
            </label>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="sidebar-section">
          <h2>Legend</h2>
          <div class="legend-items">
            <div class="legend-item skatepark">
              <img src="/images/bike_point_blue.png" alt="Skatepark marker" height="30">
              <span>Skatepark</span>
            </div>
            <div class="legend-item pumptrack">
              <img src="/images/bike_point_orange.png" alt="Pumptrack marker" height="30">
              <span>Pumptrack</span>
            </div>
            <div class="legend-item bmx_track">
              <img src="/images/bike_point_green.png" alt="BMX Track marker" height="30">
              <span>BMX Track</span>
            </div>
          </div>
        </div>
        
        <!-- Track List -->
        <div class="sidebar-section tracks-list-section">
          <h2>All Tracks <span class="total-count">{{ trackStats.total }}</span></h2>
          
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <span>Loading tracks...</span>
          </div>
          
          <div v-else-if="allTracks.length === 0" class="no-tracks">
            No tracks found in the database.
          </div>
          
          <div v-else class="tracks-list">
            <div 
              v-for="track in allTracks" 
              :key="track._id" 
              class="track-item"
              :class="{ 
                'active': selectedTrack && selectedTrack._id === track._id,
                'filtered-out': !activeFilters[track.type]
              }"
              @click="selectTrack(track)"
            >
              <div class="track-icon" :class="track.type">
                <i class="fas" :class="{
                  'fa-skating': track.type === 'skatepark',
                  'fa-biking': track.type === 'pumptrack',
                  'fa-bicycle': track.type === 'bmx_track'
                }"></i>
              </div>
              <div class="track-info">
                <h3>{{ track.name }}</h3>
                <span class="track-type" :class="track.type">{{ getTrackTypeName(track.type) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Favorites Section (optional) -->
        <div v-if="isAuthenticated && favoriteTracks.length > 0" class="sidebar-section">
          <h2>My Favorites <span class="total-count">{{ favoriteTracks.length }}</span></h2>
          <div class="tracks-list">
            <div 
              v-for="favorite in favoriteTracks" 
              :key="favorite.id" 
              class="track-item favorite"
              @click="selectTrack(favorite.Track)"
            >
              <div class="track-icon" :class="favorite.Track.type">
                <i class="fas" :class="{
                  'fa-skating': favorite.Track.type === 'skatepark',
                  'fa-biking': favorite.Track.type === 'pumptrack',
                  'fa-bicycle': favorite.Track.type === 'bmx_track'
                }"></i>
              </div>
              <div class="track-info">
                <h3>{{ favorite.Track.name }}</h3>
                <span class="track-type" :class="favorite.Track.type">
                  {{ getTrackTypeName(favorite.Track.type) }}
                </span>
              </div>
              <button 
                class="remove-favorite-btn" 
                @click.stop="removeFromFavorites(favorite.trackId, $event)"
                title="Remove from favorites"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main map area -->
      <div class="map-wrapper">
        <div id="map"></div>
        
        <!-- Loading overlay -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="spinner"></div>
            <p>Loading bike tracks...</p>
          </div>
        </div>
        
        <!-- Track details panel when selected -->
        <div v-if="selectedTrack" class="track-details-panel">
          <div class="panel-header">
            <h3>{{ selectedTrack.name }}</h3>
            <button class="close-btn" @click="selectedTrack = null">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="panel-content">
            <div class="track-badge" :class="selectedTrack.type">
              {{ getTrackTypeName(selectedTrack.type) }}
            </div>
            
            <div class="track-coordinates">
              <i class="fas fa-map-marker-alt"></i>
              <span>
                {{ selectedTrack.location.coordinates[1].toFixed(6) }}, 
                {{ selectedTrack.location.coordinates[0].toFixed(6) }}
              </span>
            </div>
            
            <div v-if="selectedTrack.description" class="track-description">
              <p>{{ selectedTrack.description }}</p>
            </div>
            
            <div v-if="selectedTrack.imageUrl" class="track-image">
              <img :src="selectedTrack.imageUrl" :alt="selectedTrack.name">
            </div>
            
            <div class="actions">
              <!-- Add a favorite button to the panel -->
              <button 
                v-if="isAuthenticated" 
                class="favorite-btn"
                :class="{ 'is-favorite': isTrackFavorited(selectedTrack._id) }"
                @click="isTrackFavorited(selectedTrack._id) ? 
                  removeFromFavorites(selectedTrack._id) : 
                  addToFavorites(selectedTrack._id)"
              >
                <i class="fas" :class="isTrackFavorited(selectedTrack._id) ? 'fa-heart' : 'fa-heart'"></i>
                {{ isTrackFavorited(selectedTrack._id) ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>
              
              <!-- Existing actions -->
              <a 
                :href="`https://www.google.com/maps/dir/?api=1&destination=${selectedTrack.location.coordinates[1]},${selectedTrack.location.coordinates[0]}`"
                target="_blank"
                rel="noopener noreferrer"
                class="directions-btn"
              >
                <i class="fas fa-directions"></i>
                Get Directions
              </a>
            </div>
            
            <!-- Reviews Section -->
            <ReviewSection :trackId="selectedTrack._id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: linear-gradient(135deg, #1e8449, #27ae60);
  color: #333;
  overflow: hidden;
  position: relative;
}

/* Header styling */
.map-header {
  background-color: #1a1a1a;
  color: white;
  padding: 15px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #57b540;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.map-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.map-header h1 i {
  color: #57b540;
  margin-right: 10px;
  font-size: 1.8rem;
}

.map-header h1 .toggle-sidebar-btn {
  background-color: #57b540;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 15px;
  font-size: 16px;
}

.map-header h1 .toggle-sidebar-btn i {
  color: white !important;
  font-size: 16px !important;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-header h1 .toggle-sidebar-btn:hover {
  background-color: #4a9537;
}

.header-controls .toggle-sidebar-btn {
  background-color: #57b540;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-controls .toggle-sidebar-btn:hover {
  background-color: #c0392b;
}

/* Map content container */
.map-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar styling */
.map-sidebar {
  width: 320px;
  background-color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, width 0.3s ease;
}

.sidebar-section {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.sidebar-section h2 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-count {
  background-color: #57b540;
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* Filter controls */
.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}

.filter-checkbox input {
  display: none;
}

.checkbox-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.checkbox-icon i {
  opacity: 0;
  transition: opacity 0.2s;
}

.filter-checkbox input:checked + .checkbox-icon i {
  opacity: 1;
}

.filter-checkbox .count {
  margin-left: 10px;
  background-color: #f1f1f1;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #333;
}

/* Colors for different track types */
.checkbox-icon.skatepark {
  background-color: #1565C0;
}

.checkbox-icon.pumptrack {
  background-color: #E65100;
}

.checkbox-icon.bmx_track {
  background-color: #2E7D32;
}

/* Legend styling */
.legend-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-item img {
  margin-right: 10px;
}

/* Tracks list */
.tracks-list-section {
  flex: 1;
  overflow-y: auto;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background-color: #f7f7f7;
  cursor: pointer;
  transition: all 0.2s;
}

.track-item:hover {
  background-color: #eee;
  transform: translateY(-2px);
}

.track-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #1565C0;
}

.track-item.filtered-out {
  opacity: 0.4;
}

.track-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.track-icon.skatepark {
  background-color: #1565C0;
}

.track-icon.pumptrack {
  background-color: #E65100;
}

.track-icon.bmx_track {
  background-color: #2E7D32;
}

.track-info {
  flex: 1;
}

.track-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.track-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-top: 5px;
}

.track-type.skatepark {
  background-color: #E3F2FD;
  color: #1565C0;
}

.track-type.pumptrack {
  background-color: #FFF3E0;
  color: #E65100;
}

.track-type.bmx_track {
  background-color: #E8F5E9;
  color: #2E7D32;
}

/* Map styling */
.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
  transition: width 0.3s ease;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Loading state */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  background-color: white;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #e74c3c;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Track details panel */
.track-details-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-height: calc(100vh - 140px);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 500;
  animation: slideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.panel-header {
  background-color: #1a1a1a;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 220px;
}

.panel-content {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
}

.track-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 15px;
}

.track-badge.skatepark {
  background-color: #E3F2FD;
  color: #1565C0;
}

.track-badge.pumptrack {
  background-color: #FFF3E0;
  color: #E65100;
}

.track-badge.bmx_track {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.track-coordinates {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.9rem;
}

.track-coordinates i {
  color: #e74c3c;
}

.track-description {
  margin-bottom: 15px;
  line-height: 1.5;
  font-size: 0.9rem;
}

.track-image {
  margin-bottom: 15px;
  border-radius: 6px;
  overflow: hidden;
}

.track-image img {
  width: 100%;
  height: auto;
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
}

.directions-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #e74c3c;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.directions-btn:hover {
  background-color: #c0392b;
}

/* Fix for marker popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.track-popup) {
  min-width: 200px;
  padding: 5px;
}

:deep(.track-popup h3) {
  margin-top: 0;
  margin-bottom: 5px;
}

:deep(.track-popup img) {
  max-width: 100%;
  margin: 10px 0;
  border-radius: 4px;
}

:deep(.favorite-track-btn) {
  display: block;
  width: auto;
  padding: 6px 8px;
  margin: 10px 15px 10px auto; /* Changed from 10px auto to move up and right */
  background-color: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.favorite-track-btn:hover) {
  background-color: #e74c3c;
  color: #fff;
}

:deep(.favorite-track-btn i) {
  margin-right: 5px;
}

:deep(.details-btn) {
  display: block;
  width: 100%;
  padding: 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

:deep(.bike-marker-icon) {
  transition: transform 0.3s;
}
:deep(.bike-marker-icon:hover) {
  transform: translateY(-5px);
}

/* New styles for favorites */
.favorite-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8f9fa;
  color: #e74c3c;
  padding: 8px 16px;
  border-radius: 5px;
  border: 1px solid #e74c3c;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background-color: #fee5e3;
}

.favorite-btn.is-favorite {
  background-color: #e74c3c;
  color: white;
}

.favorite-btn.is-favorite:hover {
  background-color: #c0392b;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.remove-favorite-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-favorite-btn:hover {
  background-color: #fee5e3;
}

.track-item.favorite {
  border-left: 3px solid #e74c3c;
}

/* Style for the favorite button in the popup */
:deep(.favorite-track-btn) {
  display: block;
  width: auto;
  padding: 6px 8px;
  margin: 10px 15px 10px auto;
  background-color: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.favorite-track-btn:hover) {
  background-color: #e74c3c;
  color: #fff;
}

/* Responsive design */
@media (max-width: 768px) {
  .map-container {
    height: calc(100vh - 60px);
  }
  
  .map-header h1 {
    font-size: 1.2rem;
  }
  
  .map-sidebar {
    position: absolute;
    height: 100%;
    transform: translateX(-100%);
    width: 85%;
    max-width: 300px;
    z-index: 1000;
  }
  
  .sidebar-open .map-sidebar {
    transform: translateX(0);
  }
  
  .track-details-panel {
    left: 20px;
    right: 20px;
    width: auto;
  }
}
</style>
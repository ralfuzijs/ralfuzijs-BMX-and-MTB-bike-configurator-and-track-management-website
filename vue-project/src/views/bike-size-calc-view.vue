<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { bikeSizeAPI } from '@/services/api'

const { isAuthenticated, username } = useAuth()

// Reactive data
const bikeType = ref('MTB') // Default bike type
const height = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')
const savedCalculations = ref([])
const loadingSaved = ref(false)

// Form validation
const isValidHeight = computed(() => {
  const h = parseFloat(height.value)
  return h >= 50 && h <= 250
})

const heightError = computed(() => {
  if (!height.value) return ''
  if (!isValidHeight.value) return 'Height must be between 50cm and 250cm'
  return ''
})

// Calculate bike size
const calculateSize = async () => {
  if (!isValidHeight.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await bikeSizeAPI.calculateSize(parseFloat(height.value), bikeType.value)
    
    if (response.success) {
      result.value = response.data
      // Don't auto-show save dialog - let user decide with button
    } else {
      error.value = response.error || 'Failed to calculate bike size'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
    console.error('Calculation error:', err)
  } finally {
    loading.value = false
  }
}

// Save calculation
const saveCalculation = async () => {
  if (!result.value) return
  
  loading.value = true
  try {
    const response = await bikeSizeAPI.saveCalculation(result.value.height, bikeType.value)
    
    if (response.success) {
      await loadSavedCalculations()
      // Show success message
      alert('Calculation saved successfully!')
    } else {
      error.value = response.error || 'Failed to save calculation'
    }
  } catch (err) {
    error.value = 'Failed to save calculation'
    console.error('Save error:', err)
  } finally {
    loading.value = false
  }
}

// Load saved calculations
const loadSavedCalculations = async () => {
  if (!isAuthenticated.value) return
  
  loadingSaved.value = true
  try {
    const response = await bikeSizeAPI.getUserCalculations()
    
    if (response.success) {
      savedCalculations.value = response.data
    }
  } catch (err) {
    console.error('Failed to load saved calculations:', err)
  } finally {
    loadingSaved.value = false
  }
}

// Delete calculation
const deleteCalculation = async (id) => {
  if (!confirm('Are you sure you want to delete this calculation?')) return
  
  try {
    const response = await bikeSizeAPI.deleteCalculation(id)
    
    if (response.success) {
      await loadSavedCalculations()
    } else {
      error.value = 'Failed to delete calculation'
    }
  } catch (err) {
    error.value = 'Failed to delete calculation'
    console.error('Delete error:', err)
  }
}

// Reset form
const resetForm = () => {
  height.value = ''
  result.value = null
  error.value = ''
  // Don't reset bikeType - user might want to keep the same type
}

// Handle Enter key press
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && isValidHeight.value) {
    calculateSize()
  }
}

// Get bike type display name
const getBikeTypeName = (type) => {
  const names = {
    'MTB': 'MTB',
    'BMX_FREESTYLE': 'BMX Freestyle',
    'BMX_RACING': 'BMX Racing'
  }
  return names[type] || type
}

// Load saved calculations on mount
onMounted(() => {
  if (isAuthenticated.value) {
    loadSavedCalculations()
  }
})
</script>

<template>
  <div class="bike-calculator-container">
    <div class="calculator-card">
      <div class="header">
        <div class="icon-container">
          <i class="fas fa-calculator"></i>
        </div>
        <h1>Bike Size Calculator</h1>
        <p class="subtitle">Find the perfect frame size for your height</p>
      </div>

      <!-- Calculator Form -->
      <div class="calculator-form">
        <!-- Bike Type Selection -->
        <div class="input-group">
          <label for="bikeType">Select Bike Type</label>
          <div class="bike-type-selector">
            <button
              type="button"
              :class="['bike-type-btn', { active: bikeType === 'MTB' }]"
              @click="bikeType = 'MTB'"
            >
              <i class="fas fa-mountain"></i>
              <span>MTB</span>
              <small>Mountain Bike</small>
            </button>
            <button
              type="button"
              :class="['bike-type-btn', { active: bikeType === 'BMX_FREESTYLE' }]"
              @click="bikeType = 'BMX_FREESTYLE'"
            >
              <i class="fas fa-biking"></i>
              <span>BMX Freestyle</span>
              <small>Tricks & Parks</small>
            </button>
            <button
              type="button"
              :class="['bike-type-btn', { active: bikeType === 'BMX_RACING' }]"
              @click="bikeType = 'BMX_RACING'"
            >
              <i class="fas fa-flag-checkered"></i>
              <span>BMX Racing</span>
              <small>Competition</small>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label for="height">Your Height (cm)</label>
          <input
            id="height"
            v-model="height"
            type="number"
            placeholder="Enter your height in centimeters"
            min="50"
            max="250"
            step="1"
            @keypress="handleKeyPress"
            :class="{ error: heightError }"
          />
          <div v-if="heightError" class="error-message">{{ heightError }}</div>
        </div>

        <button
          @click="calculateSize"
          :disabled="!isValidHeight || loading"
          class="calculate-btn"
        >
          <i class="fas fa-calculator" v-if="!loading"></i>
          <i class="fas fa-spinner fa-spin" v-if="loading"></i>
          {{ loading ? 'Calculating...' : 'Calculate Frame Size' }}
        </button>

        <div v-if="error" class="error-banner">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error }}
        </div>
      </div>

      <!-- Results -->
      <div v-if="result" class="result-card">
        <div class="result-header">
          <i class="fas fa-check-circle"></i>
          <h3>Recommended Frame Size - {{ getBikeTypeName(result.bikeType) }}</h3>
        </div>
        
        <div class="result-content">
          <div class="frame-size">{{ result.recommendedFrameSize }}</div>
          <div class="details">
            <div class="detail-item">
              <span class="label">Bike Type:</span>
              <span class="value">{{ getBikeTypeName(result.bikeType) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Your Height:</span>
              <span class="value">{{ result.height }}cm</span>
            </div>
            <div class="detail-item">
              <span class="label">Height Range:</span>
              <span class="value">{{ result.calculation.heightRange }}</span>
            </div>
            <div class="recommendation">
              <i class="fas fa-lightbulb"></i>
              {{ result.calculation.recommendation }}
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="resetForm" class="secondary-btn">
            <i class="fas fa-redo"></i>
            Calculate Again
          </button>
          <button 
            v-if="isAuthenticated" 
            @click="saveCalculation" 
            class="save-result-btn"
            :disabled="loading"
          >
            <i class="fas fa-save"></i>
            Save to Profile
          </button>
        </div>
      </div>

      <!-- Save Dialog for Logged-in Users - REMOVED, using button instead -->

      <!-- Saved Calculations for Logged-in Users -->
      <div v-if="isAuthenticated" class="saved-calculations">
        <h3>
          <i class="fas fa-history"></i>
          Your Saved Calculations
        </h3>
        
        <div v-if="loadingSaved" class="loading-saved">
          <i class="fas fa-spinner fa-spin"></i>
          Loading saved calculations...
        </div>
        
        <div v-else-if="savedCalculations.length === 0" class="no-saved">
          <i class="fas fa-info-circle"></i>
          No saved calculations yet. Calculate and save your first one!
        </div>
        
        <div v-else class="saved-list">
          <div
            v-for="calc in savedCalculations"
            :key="calc.id"
            class="saved-item"
          >
            <div class="saved-info">
              <div class="saved-type">
                <i v-if="calc.bikeType === 'MTB'" class="fas fa-mountain"></i>
                <i v-else-if="calc.bikeType === 'BMX_FREESTYLE'" class="fas fa-biking"></i>
                <i v-else class="fas fa-flag-checkered"></i>
                {{ getBikeTypeName(calc.bikeType) }}
              </div>
              <div class="saved-result">{{ calc.recommendedFrameSize }}</div>
              <div class="saved-height">Height: {{ calc.height }}cm</div>
              <div class="saved-date">
                {{ new Date(calc.calculationDate).toLocaleDateString() }}
              </div>
            </div>
            <button
              @click="deleteCalculation(calc.id)"
              class="delete-btn"
              title="Delete calculation"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Login Prompt for Non-authenticated Users -->
      <div v-if="!isAuthenticated && result" class="login-prompt">
        <div class="prompt-content">
          <i class="fas fa-user-plus"></i>
          <h4>Save Your Calculations</h4>
          <p>Login to save your bike size calculations and access them anytime!</p>
          <router-link to="/login" class="login-link">
            <i class="fas fa-sign-in-alt"></i>
            Login / Register
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bike-calculator-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.calculator-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.header {
  background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.icon-container {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
}

.icon-container i {
  font-size: 2rem;
  color: white;
}

.header h1 {
  margin: 0 0 10px;
  font-size: 2.5rem;
  font-weight: bold;
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.calculator-form {
  padding: 40px 30px;
}

.input-group {
  margin-bottom: 30px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.bike-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.bike-type-btn {
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 12px;
  padding: 20px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: #555;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.bike-type-btn:hover {
  border-color: #27ae60;
  background: #f0f8f4;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);
  color: #333;
}

.bike-type-btn.active {
  border-color: #27ae60;
  background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(39, 174, 96, 0.4);
}

.bike-type-btn i {
  font-size: 1.8rem;
  margin-bottom: 5px;
  color: inherit;
}

.bike-type-btn span {
  font-weight: 600;
  font-size: 1rem;
  color: inherit;
}

.bike-type-btn small {
  font-size: 0.75rem;
  opacity: 0.7;
  color: inherit;
}

.bike-type-btn:hover small {
  opacity: 0.85;
}

.bike-type-btn.active small {
  opacity: 0.9;
}

.input-group input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
}

.calculate-btn {
  width: 100%;
  max-width: 300px;
  padding: 18px;
  background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px auto 0;
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 132, 73, 0.4);
}

.calculate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-banner {
  background: #ffeaea;
  color: #e74c3c;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-card {
  margin: 30px;
  background: #f8fffe;
  border: 2px solid #e8f5e8;
  border-radius: 16px;
  overflow: hidden;
}

.result-header {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.result-header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.result-content {
  padding: 30px;
}

.frame-size {
  font-size: 2.5rem;
  font-weight: bold;
  color: #27ae60;
  text-align: center;
  margin-bottom: 25px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e8f5e8;
}

.details {
  margin-top: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e8f5e8;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  font-weight: bold;
  color: #27ae60;
}

.recommendation {
  background: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-style: italic;
}

.result-actions {
  padding: 0 30px 30px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.secondary-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.save-result-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.save-result-btn:hover:not(:disabled) {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.save-result-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.saved-calculations {
  margin: 30px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
}

.saved-calculations h3 {
  margin: 0 0 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-saved, .no-saved {
  text-align: center;
  padding: 20px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.saved-list {
  display: grid;
  gap: 15px;
}

.saved-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.saved-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.saved-info {
  flex: 1;
}

.saved-type {
  font-size: 0.85rem;
  color: #27ae60;
  font-weight: 600;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.saved-type i {
  font-size: 1rem;
}

.saved-result {
  font-weight: bold;
  color: #27ae60;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.saved-height {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.saved-date {
  color: #999;
  font-size: 0.8rem;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

.login-prompt {
  margin: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #1e8449 0%, #27ae60 100%);
  border-radius: 12px;
  text-align: center;
}

.prompt-content {
  color: white;
}

.prompt-content i {
  font-size: 2rem;
  margin-bottom: 15px;
  opacity: 0.9;
}

.prompt-content h4 {
  margin: 0 0 10px;
  font-size: 1.3rem;
}

.prompt-content p {
  margin: 0 0 25px;
  opacity: 0.9;
}

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.login-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}



/* Responsive Design */
@media (max-width: 768px) {
  .bike-calculator-container {
    padding: 10px;
  }
  
  .calculator-card {
    margin-bottom: 20px;
  }
  
  .header {
    padding: 30px 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .calculator-form {
    padding: 30px 20px;
  }

  .bike-type-selector {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bike-type-btn {
    padding: 15px 12px;
  }

  .bike-type-btn i {
    font-size: 1.5rem;
  }
  
  .result-card {
    margin: 20px;
  }
  
  .result-content {
    padding: 20px;
  }
  
  .frame-size {
    font-size: 2rem;
  }
  
  .saved-calculations {
    margin: 20px;
    padding: 20px;
  }
    .login-prompt {
    margin: 20px;
    padding: 20px;
  }
  
  .save-actions {
    flex-direction: column;
  }
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>

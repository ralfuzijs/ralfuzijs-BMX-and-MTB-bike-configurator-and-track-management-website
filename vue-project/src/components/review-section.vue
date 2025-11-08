<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { reviewApi } from '@/services/api';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
  trackId: {
    type: String,
    required: true
  }
});

const { isAuthenticated, user } = useAuth();

const reviews = ref([]);
const stats = ref({
  totalReviews: 0,
  averageRating: 0,
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
});
const userReview = ref(null);
const isLoading = ref(false);
const showReviewForm = ref(false);
const isEditMode = ref(false);

const reviewForm = ref({
  rating: 5,
  comment: ''
});

// Computed property for bike display
const bikeArray = computed(() => [1, 2, 3, 4, 5]);

// Load reviews when component mounts or track changes
watch(() => props.trackId, () => {
  loadReviews();
}, { immediate: true });

async function loadReviews() {
  if (!props.trackId) return;
  
  isLoading.value = true;
  try {
    // Load all reviews
    const reviewsResult = await reviewApi.getTrackReviews(props.trackId);
    if (reviewsResult.success) {
      reviews.value = reviewsResult.data;
    }
    
    // Load stats
    const statsResult = await reviewApi.getTrackStats(props.trackId);
    if (statsResult.success) {
      stats.value = statsResult.data;
    }
    
    // Load user's review if authenticated
    if (isAuthenticated.value) {
      const userReviewResult = await reviewApi.getUserReview(props.trackId);
      if (userReviewResult.success) {
        userReview.value = userReviewResult.data;
      } else {
        userReview.value = null;
      }
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  } finally {
    isLoading.value = false;
  }
}

function openReviewForm() {
  if (!isAuthenticated.value) {
    alert('Please log in to leave a review');
    return;
  }
  
  if (userReview.value) {
    // Edit existing review
    isEditMode.value = true;
    reviewForm.value.rating = userReview.value.rating;
    reviewForm.value.comment = userReview.value.comment;
  } else {
    // New review
    isEditMode.value = false;
    reviewForm.value.rating = 5;
    reviewForm.value.comment = '';
  }
  
  showReviewForm.value = true;
}

function cancelReview() {
  showReviewForm.value = false;
  reviewForm.value.rating = 5;
  reviewForm.value.comment = '';
}

async function submitReview() {
  if (!isAuthenticated.value) {
    alert('Please log in to leave a review');
    return;
  }
  
  try {
    let result;
    
    if (isEditMode.value && userReview.value) {
      // Update existing review
      result = await reviewApi.updateReview(userReview.value.id, {
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment
      });
    } else {
      // Create new review
      result = await reviewApi.addReview({
        trackId: props.trackId,
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment
      });
    }
    
    if (result.success) {
      showReviewForm.value = false;
      reviewForm.value.rating = 5;
      reviewForm.value.comment = '';
      await loadReviews();
    } else {
      alert(result.error || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('An error occurred while submitting your review');
  }
}

async function deleteUserReview() {
  if (!userReview.value) return;
  
  if (!confirm('Are you sure you want to delete your review?')) {
    return;
  }
  
  try {
    const result = await reviewApi.deleteReview(userReview.value.id);
    if (result.success) {
      await loadReviews();
      showReviewForm.value = false;
    } else {
      alert(result.error || 'Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('An error occurred while deleting your review');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getDistributionPercentage(count) {
  if (stats.value.totalReviews === 0) return 0;
  return Math.round((count / stats.value.totalReviews) * 100);
}
</script>

<template>
  <div class="review-section">
    <div class="review-header">
      <h3><i class="fas fa-bicycle"></i> Reviews</h3>
    </div>
    
    <!-- Review Summary -->
    <div v-if="!isLoading" class="review-summary">
      <div class="average-rating">
        <div class="rating-number">{{ stats.averageRating.toFixed(1) }}</div>
        <div class="rating-bikes">
          <i 
            v-for="bike in bikeArray" 
            :key="bike"
            class="fas fa-bicycle"
            :class="{ 
              'filled': bike <= Math.round(stats.averageRating),
              'empty': bike > Math.round(stats.averageRating)
            }"
          ></i>
        </div>
        <div class="review-count">{{ stats.totalReviews }} review{{ stats.totalReviews !== 1 ? 's' : '' }}</div>
      </div>
      
      <div class="rating-distribution">
        <div 
          v-for="rating in [5, 4, 3, 2, 1]" 
          :key="rating"
          class="distribution-row"
        >
          <span class="rating-label">{{ rating }} <i class="fas fa-bicycle"></i></span>
          <div class="distribution-bar">
            <div 
              class="distribution-fill" 
              :style="{ width: getDistributionPercentage(stats.distribution[rating]) + '%' }"
            ></div>
          </div>
          <span class="distribution-count">{{ stats.distribution[rating] }}</span>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Review Button -->
    <div class="review-action">
      <button 
        v-if="!showReviewForm && isAuthenticated" 
        @click="openReviewForm"
        class="btn-review"
      >
        <i class="fas" :class="userReview ? 'fa-edit' : 'fa-plus'"></i>
        {{ userReview ? 'Edit Your Review' : 'Write a Review' }}
      </button>
      <div v-else-if="!isAuthenticated" class="login-prompt">
        <i class="fas fa-info-circle"></i>
        Please log in to write a review
      </div>
    </div>
    
    <!-- Review Form -->
    <div v-if="showReviewForm" class="review-form">
      <h4>{{ isEditMode ? 'Edit Your Review' : 'Write a Review' }}</h4>
      
      <div class="form-group">
        <label>Rating</label>
        <div class="bike-rating-input">
          <i 
            v-for="bike in bikeArray" 
            :key="bike"
            class="fas fa-bicycle"
            :class="{ 'selected': bike <= reviewForm.rating }"
            @click="reviewForm.rating = bike"
          ></i>
        </div>
      </div>
      
      <div class="form-group">
        <label>Comment (optional)</label>
        <textarea 
          v-model="reviewForm.comment"
          rows="4"
          placeholder="Share your experience with this track..."
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button @click="submitReview" class="btn-submit">
          <i class="fas fa-check"></i>
          Submit Review
        </button>
        <button @click="cancelReview" class="btn-cancel">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button 
          v-if="isEditMode && userReview" 
          @click="deleteUserReview" 
          class="btn-delete"
        >
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
    
    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <span>Loading reviews...</span>
      </div>
      
      <div v-else-if="reviews.length === 0" class="no-reviews">
        <i class="fas fa-comment-slash"></i>
        <p>No reviews yet. Be the first to review this track!</p>
      </div>
      
      <div v-else>
        <div 
          v-for="review in reviews" 
          :key="review.id"
          class="review-item"
          :class="{ 'user-review': user && review.userId === user.id }"
        >
          <div class="review-header-item">
            <div class="user-info">
              <img 
                :src="review.User?.profilePicture || '/images/default-profile.png'" 
                :alt="review.User?.username"
                class="user-avatar"
              />
              <div>
                <div class="username">
                  {{ review.User?.username }}
                  <span v-if="user && review.userId === user.id" class="you-badge">You</span>
                </div>
                <div class="review-date">{{ formatDate(review.createdAt) }}</div>
              </div>
            </div>
            <div class="review-rating">
              <i 
                v-for="bike in bikeArray" 
                :key="bike"
                class="fas fa-bicycle"
                :class="{ 
                  'filled': bike <= review.rating,
                  'empty': bike > review.rating
                }"
              ></i>
            </div>
          </div>
          
          <div v-if="review.comment" class="review-comment">
            {{ review.comment }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.review-header {
  margin-bottom: 15px;
}

.review-header h3 {
  font-size: 1.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-header h3 i {
  color: #f39c12;
}

/* Review Summary */
.review-summary {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.average-rating {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 15px;
}

.rating-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

.rating-bikes {
  margin: 5px 0;
}

.rating-bikes i {
  color: #ddd;
  font-size: 1.2rem;
  margin: 0 2px;
}

.rating-bikes i.filled {
  color: #e74c3c;
}

.review-count {
  color: #666;
  font-size: 0.9rem;
}

/* Rating Distribution */
.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.distribution-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
}

.rating-label {
  min-width: 45px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.rating-label i {
  color: #e74c3c;
  font-size: 0.75rem;
}

.distribution-bar {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background-color: #e74c3c;
  transition: width 0.3s ease;
}

.distribution-count {
  min-width: 25px;
  text-align: right;
  color: #666;
}

/* Review Action */
.review-action {
  margin-bottom: 15px;
}

.btn-review {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-review:hover {
  background-color: #c0392b;
}

.login-prompt {
  text-align: center;
  padding: 10px;
  background-color: #fff3cd;
  border-radius: 5px;
  color: #856404;
  font-size: 0.9rem;
}

.login-prompt i {
  margin-right: 5px;
}

/* Review Form */
.review-form {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.review-form h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.bike-rating-input {
  display: flex;
  gap: 5px;
}

.bike-rating-input i {
  font-size: 1.8rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.bike-rating-input i.selected,
.bike-rating-input i:hover {
  color: #e74c3c;
}

.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn-submit {
  background-color: #28a745;
  color: white;
  flex: 1;
}

.btn-submit:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

/* Reviews List */
.reviews-list {
  margin-top: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #666;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border-left-color: #e74c3c;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-reviews i {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #ddd;
}

.review-item {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.review-item.user-review {
  border-color: #e74c3c;
  background-color: #fff5f5;
}

.review-header-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.you-badge {
  background-color: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.review-date {
  font-size: 0.85rem;
  color: #999;
}

.review-rating i {
  color: #ddd;
  font-size: 1rem;
  margin-left: 2px;
}

.review-rating i.filled {
  color: #e74c3c;
}

.review-rating i.empty {
  color: #ddd;
}

.review-comment {
  color: #555;
  line-height: 1.5;
  margin-top: 10px;
}
</style>

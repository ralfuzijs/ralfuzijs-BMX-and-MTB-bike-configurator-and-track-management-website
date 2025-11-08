<script setup>
// We'll keep this simple for now
</script>

<template>
  <div class="coming-soon-container">
    <div class="coming-soon-card">
      <div class="poster-content">
        <div class="icon-container">
          <i class="fas fa-bicycle"></i>
        </div>
        <h1>Bike Configurator</h1>
        <div class="status-badge">
          <span>IN PROGRESS</span>
        </div>
        <p class="description">
          Build your dream bike
        </p>
        <div class="feature-list">
          <div class="feature">
            <i class="fas fa-check-circle"></i>
            <span>3D preview</span>
          </div>
          <div class="feature">
            <i class="fas fa-check-circle"></i>
            <span>Custom parts</span>
          </div>
        </div>
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <p class="progress-text">Progress: 40%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coming-soon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
  background-color: #fff0f0;
}

.coming-soon-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(204, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  position: relative;
  border: 2px solid #cc0000;
}

.poster-content {
  padding: 50px 30px;
  text-align: center;
}

.icon-container {
  font-size: 80px;
  color: #cc0000;
  margin-bottom: 20px;
}

h1 {
  font-size: 40px;
  margin-bottom: 20px;
  color: #990000;
  font-weight: 800;
}

.status-badge {
  display: inline-block;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 25px;
  letter-spacing: 1px;
  box-shadow: 0 5px 15px rgba(204, 0, 0, 0.4);
}

.description {
  color: #333;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 30px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.feature-list {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 500;
}

.feature i {
  color: #cc0000;
  font-size: 22px;
}

.progress {
  margin-top: 30px;
}

.progress-bar {
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 6px;
  animation: pulse 2s infinite;
}

.progress-text {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .poster-content {
    padding: 40px 20px;
  }
  
  h1 {
    font-size: 32px;
  }
  
  .description {
    font-size: 18px;
  }
}
</style>
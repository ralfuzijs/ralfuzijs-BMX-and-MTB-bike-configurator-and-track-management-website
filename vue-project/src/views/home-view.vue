<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="home-main">
    <div class="features-container">
      
      <!-- Bike Size Calculator Section -->
      <div class="feature-card">
        <div class="feature-background" style="background-image: url('/images/calculator-bl-and-wh.png')"></div>
        <div class="feature-overlay"></div>
        <div class="feature-content">
          <h2 class="feature-title">Bike Size Calculator</h2>
          <p class="feature-description">
            Find your perfect bike size based on your height and riding style. 
            Get personalized recommendations for frame size, handlebar width, and more.
          </p>
          <RouterLink to="/bike-size-calculator" class="feature-button">Calculate Your Size →</RouterLink>
        </div>
      </div>

      <!-- Bike Configurator Section -->
      <div class="feature-card">
        <div class="feature-background" style="background-image: url('/images/Bikeparts.jpeg')"></div>
        <div class="feature-overlay"></div>
        <div class="feature-content feature-content-right">
          <h2 class="feature-title">Bike Configurator</h2>
          <p class="feature-description">
            Build your dream bike from scratch. Choose components, colors, and customize 
            every detail to create a bike that's uniquely yours.
          </p>
          <RouterLink to="/bike-configurator" class="feature-button">Start Building →</RouterLink>
        </div>
      </div>

      <!-- Map of Tracks Section -->
      <div class="feature-card">
        <div class="feature-background" style="background-image: url('/images/map-bl-and-wh.png')"></div>
        <div class="feature-overlay"></div>
        <div class="feature-content">
          <h2 class="feature-title">Bike Track Map</h2>
          <p class="feature-description">
            Discover BMX and MTB tracks near you. Explore track details, difficulty levels, 
            and save your favorite spots for your next ride.
          </p>
          <RouterLink to="/MapOfTracks" class="feature-button">Explore Tracks →</RouterLink>
        </div>
      </div>

    </div>
  </main>
</template>


<style scoped>
.home-main {
  min-height: calc(100vh - 200px);
  padding: 0;
  margin: 0;
}

.features-container {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.feature-card {
  position: relative;
  height: 350px;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  color: white;
  transition: box-shadow 0.3s ease;
  display: block;
}

.feature-card:hover {
  box-shadow: 0 20px 60px rgba(0, 255, 0, 0.3);
}

.feature-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.5s ease;
}

.feature-card:hover .feature-background {
  transform: scale(1.15);
}

.feature-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.85) 100%
  );
  transition: background 0.3s ease;
}

.feature-card:hover .feature-overlay {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.75) 100%
  );
}

.feature-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 60px 60px;
  max-width: 800px;
  align-items: flex-start;
}

.feature-content-right {
  margin-left: auto;
  align-items: flex-end;
  text-align: right;
}

.feature-title {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 3em;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #00ff00;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
}

.feature-description {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 1.2em;
  line-height: 1.6;
  margin: 0 0 30px 0;
  color: rgba(255, 255, 255, 0.95);
  max-width: 600px;
}

.feature-button {
  display: inline-block;
  padding: 15px 35px;
  background-color: rgba(0, 255, 0, 0.2);
  border: 2px solid #00ff00;
  border-radius: 30px;
  color: #00ff00;
  font-size: 1.1em;
  font-weight: bold;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  text-decoration: none;
  cursor: pointer;
}

.feature-button:hover {
  background-color: #00ff00;
  color: #000;
  transform: translateX(10px);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .features-container {
    padding: 0;
    gap: 0;
  }

  .feature-card {
    height: 300px;
  }

  .feature-content {
    padding: 50px 40px;
  }

  .feature-title {
    font-size: 2.5em;
  }

  .feature-description {
    font-size: 1.1em;
  }
}

@media (max-width: 768px) {
  .features-container {
    padding: 0;
    gap: 0;
  }

  .feature-card {
    height: 280px;
  }

  .feature-content {
    padding: 40px 30px;
  }

  .feature-title {
    font-size: 2em;
    margin-bottom: 15px;
  }

  .feature-description {
    font-size: 1em;
    margin-bottom: 20px;
  }

  .feature-button {
    padding: 12px 28px;
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .features-container {
    padding: 0;
    gap: 0;
  }

  .feature-card {
    height: 260px;
  }

  .feature-content {
    padding: 35px 20px;
  }

  .feature-title {
    font-size: 1.6em;
    margin-bottom: 12px;
  }

  .feature-description {
    font-size: 0.9em;
    margin-bottom: 18px;
    line-height: 1.5;
  }

  .feature-button {
    padding: 10px 24px;
    font-size: 0.95em;
  }
}
</style>

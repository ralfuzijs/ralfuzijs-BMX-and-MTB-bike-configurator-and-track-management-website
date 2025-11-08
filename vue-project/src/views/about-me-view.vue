<template>
  <div class="about-container">
    <div class="about-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="profile-image-wrapper">
          <img 
            src="/images/about-me.png" 
            alt="About Me" 
            class="profile-image"
          />
          <div class="image-border"></div>
        </div>
        
        <div class="hero-text">
          <h1 class="main-title">Par mani</h1>
          <div class="title-underline"></div>
          <p class="subtitle">BMX & MTB entuziasts</p>
        </div>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <div class="card-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="card-content">
          <h2 class="card-title">Kvalifikācijas darbs</h2>
          <p class="card-text">
            Esmu 4. kursa <strong>Rīgas Valsts tehnikuma</strong> skolēns. 
            Šis ir mans kvalifikācijas darbs.
          </p>
        </div>
      </div>

      <!-- Project Info -->
      <div class="project-section">
        <h3 class="section-title">Par projektu</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-bicycle"></i>
            </div>
            <h4>BMX/MTB Kalkulators</h4>
            <p>Aprēķini piemērotu riteņa izmēru</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <h4>Trašu karte</h4>
            <p>Atrodi BMX un MTB trases Latvijā</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-cog"></i>
            </div>
            <h4>Bike konfigurators</h4>
            <p>Izveido un saglabā savu sapņu BMX</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-star"></i>
            </div>
            <h4>Atsauksmes</h4>
            <p>Dalies ar pieredzi par trasēm</p>
          </div>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="tech-section">
        <h3 class="section-title">Izmantotās tehnoloģijas</h3>
        <div class="tech-badges">
          <span class="tech-badge vue">Vue.js 3</span>
          <span class="tech-badge node">Node.js</span>
          <span class="tech-badge express">Express</span>
          <span class="tech-badge sqlite">SQLite</span>
          <span class="tech-badge leaflet">Leaflet</span>
          <span class="tech-badge vite">Vite</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-background-soft) 100%);
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 2rem;
}

.profile-image-wrapper {
  position: relative;
  width: 250px;
  height: 250px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 5px solid var(--color-background-soft);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.image-border {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 2px dashed var(--color-border);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-text {
  text-align: center;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-heading), var(--color-text));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-underline {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
  margin: 1rem auto;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.8;
}

/* Info Card */
.info-card {
  background: var(--color-background-soft);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  display: flex;
  gap: 2rem;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  color: var(--color-heading);
  min-width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
  color: var(--color-heading);
}

.card-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
}

/* Project Section */
.project-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-heading);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-item {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
}

.feature-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--color-heading);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.feature-item h4 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.feature-item p {
  color: var(--color-text);
  opacity: 0.8;
}

/* Tech Section */
.tech-section {
  text-align: center;
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 20px;
  border: 1px solid var(--color-border);
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.tech-badge {
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: default;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tech-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tech-badge.vue {
  background: linear-gradient(135deg, #42b883, #35495e);
  color: white;
}

.tech-badge.node {
  background: linear-gradient(135deg, #68a063, #44883e);
  color: white;
}

.tech-badge.express {
  background: linear-gradient(135deg, #000000, #404040);
  color: white;
}

.tech-badge.sqlite {
  background: linear-gradient(135deg, #0f80cc, #003b57);
  color: white;
}

.tech-badge.leaflet {
  background: linear-gradient(135deg, #199900, #0d5c00);
  color: white;
}

.tech-badge.vite {
  background: linear-gradient(135deg, #646cff, #747bff);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .profile-image-wrapper {
    width: 200px;
    height: 200px;
  }
  
  .info-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
  
  .card-icon {
    font-size: 2.5rem;
    min-width: 70px;
    height: 70px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-badges {
    gap: 0.8rem;
  }
}

@media (min-width: 1024px) {
  .hero-section {
    flex-direction: row;
    justify-content: center;
    gap: 4rem;
  }
  
  .hero-text {
    text-align: left;
  }
  
  .title-underline {
    margin: 1rem 0;
  }
}
</style>

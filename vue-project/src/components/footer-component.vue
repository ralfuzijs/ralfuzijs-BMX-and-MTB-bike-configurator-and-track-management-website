<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer>
    <div class="footer-container">
      <div class="footer-section">
        <h3>BMX/MTB</h3>
        <p>Your ultimate resource for BMX and MTB enthusiasts. Explore tracks, customize your ride, and connect with the community.</p>
      </div>
      
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/about">About Me</RouterLink></li>
          <li><RouterLink to="/contact">Contact</RouterLink></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Connect</h3>
        <div class="social-links">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} BMX/MTB. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 50px;
  padding: 40px 20px 20px;
  /* Colors are set in theme.css */
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 30px;
}

.footer-section {
  flex: 1;
  min-width: 250px;
}

.footer-section h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  background-color: var(--accent-color);
}

.footer-section p {
  line-height: 1.6;
  opacity: 0.8;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 10px;
}

.footer-section ul li a {
  text-decoration: none;
  transition: 0.3s ease;
  display: inline-block;
  position: relative;
}

.footer-section ul li a:hover {
  transform: translateX(5px);
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--background-color);
  font-size: 1.2rem;
  transition: transform 0.3s, background-color 0.3s;
}

.social-links a:hover {
  transform: translateY(-5px);
  background-color: var(--accent-color);
}

.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-section h3::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>

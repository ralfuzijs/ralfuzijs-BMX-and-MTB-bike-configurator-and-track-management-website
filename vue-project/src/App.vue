<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import HeaderComponent from '@/components/header-component.vue';
import FooterComponent from '@/components/footer-component.vue';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const showHeader = computed(() => route.name !== 'admin');
const showFooter = computed(() => route.name !== 'admin');

// Check auth status when app is mounted to maintain session
const { checkAuth } = useAuth();
onMounted(() => {
  checkAuth();
});
</script>

<template>
  <HeaderComponent v-if="showHeader" />

  <RouterView />
  
  <FooterComponent v-if="showFooter" />
</template>

<style scoped>
header {
    text-align: center;
    background-color: rgb(66, 62, 62);
    padding: 1em;
    color: white;
    border-radius: 25px; 
}

h1 {
    margin: 0;
    padding: 10px; 
    text-align: center;
    font-size: 3em;
  }

nav {
    display: flex;
    justify-content: center;
    align-items: center; 
    padding: 0;
    margin-top: 3px;
}

nav a {
    color: white;
    margin: 30px; /* space between home, about us, contact */
    text-decoration: none;
    font-size: 1.2em;
}

nav a:hover {
    background-color: rgba(0, 0, 0, 0.2);
    color: white;
    border-radius: 5px;
}
</style>

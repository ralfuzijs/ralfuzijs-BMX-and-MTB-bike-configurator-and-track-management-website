import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/about-me-view.vue'),
    },
    {
      path: '/MapOfTracks',
      name: 'MapOfTracks',
      component: () => import('../views/map-of-tracks-view.vue'),
    },
    // Add bike configurator route
    {
      path: '/bike-configurator',
      name: 'bike-configurator',
      component: () => import('@/views/bike-config-view.vue'),
    },
    // Add bike size calculator route
    {
      path: '/bike-size-calculator',
      name: 'bike-size-calculator',
      component: () => import('@/views/bike-size-calc-view.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/admin/views/admin-view.vue'),
      meta: { requiresAdminAuth: true }
    },
    // Add the user login route
    {
      path: '/login',
      name: 'user-login',
      component: () => import('@/views/user-login/user-login-view.vue'),
    },
    // Add user register route
    {
      path: '/register',
      name: 'user-register',
      component: () => import('@/views/user-login/user-register-view.vue'),
    },
    // Add user profile route
    {
      path: '/user-profile',
      name: 'user-profile',
      component: () => import('@/views/user-view.vue'),
      meta: { requiresUserAuth: true }
    },
  ],
})

// Navigation guard to check authentication for routes that require it
router.beforeEach((to, from, next) => {
  const requiresAdminAuth = to.matched.some(record => record.meta.requiresAdminAuth);
  const requiresUserAuth = to.matched.some(record => record.meta.requiresUserAuth);
  
  const userToken = localStorage.getItem('user_token');
  const userRole = localStorage.getItem('user_role');
  
  if (requiresAdminAuth && (!userToken || userRole !== 'admin')) {
    // Redirect to user login page if admin auth required but not an admin
    console.log('Route requires admin authentication but user is not admin. Redirecting to login.');
    next({ name: 'user-login' });
  } else if (requiresUserAuth && !userToken) {
    // Redirect to user login page if user auth required
    console.log('Route requires user authentication but no token found. Redirecting to login.');
    next({ name: 'user-login' });
  } else {
    next();
  }
});

export default router
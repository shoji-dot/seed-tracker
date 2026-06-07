import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/',          name: 'home',      component: () => import('../views/HomeView.vue') },
  { path: '/activities', name: 'activities', component: () => import('../views/ActivitiesView.vue') },
  { path: '/seeds/new', name: 'seed-new',  component: () => import('../views/SeedForm.vue') },
  { path: '/seeds/:id', name: 'seed-detail', component: () => import('../views/SeedDetail.vue') },
  { path: '/seeds/:id/edit', name: 'seed-edit', component: () => import('../views/SeedForm.vue') },
  { path: '/activities/select', name: 'activity-select', component: () => import('../views/ActivityTypeSelect.vue') },
  { path: '/activities/new/:type', name: 'activity-new', component: () => import('../views/ActivityForm.vue') },
  { path: '/activities/:activityId/edit/:type', name: 'activity-edit', component: () => import('../views/ActivityForm.vue') },
  { path: '/persons',   name: 'persons',   component: () => import('../views/PersonsView.vue') },
  { path: '/companies', name: 'companies', component: () => import('../views/CompaniesView.vue') },
  { path: '/settings',  name: 'settings',  component: () => import('../views/SettingsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const token = localStorage.getItem('st_token')
  if (!to.meta.public && !token) return '/login'
  if (to.path === '/login' && token) return '/'
})

export default router

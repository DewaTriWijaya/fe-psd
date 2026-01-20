import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/import-production',
      name: 'import-production',
      component: () => import('../views/ImportProductionView.tsx')
    },
    {
      path: '/import-price',
      name: 'import-price',
      component: () => import('../views/ImportPriceView.tsx')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.tsx')
    },
  ],
})

export default router

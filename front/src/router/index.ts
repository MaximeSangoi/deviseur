import { createRouter, createWebHistory } from 'vue-router'
import FacturesView from '../views/FacturesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/template',
      name: 'template',
      component: () => import('../views/TemplateView.vue'),
    },
    {
      path: '/factures',
      name: 'factures',
      component: FacturesView,
    },
    {
      path: '/devis',
      name: 'devis',
      component: () => import('../views/DevisView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: 'factures'
    },
    {
      path: '/compta',
      name: 'compta',
      component: () => import('../views/ComptaView.vue'),
    }
  ],
})

export default router

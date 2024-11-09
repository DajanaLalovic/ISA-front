import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';

import HelloWorld from '@/components/HelloWorld.vue';

const routes = [
  { path: '/', name: 'HelloWorld', component: HelloWorld },
  { path: '/signup', name: 'SignUp', component: SignUp }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

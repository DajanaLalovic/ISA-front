import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';
import Activate from '@/components/Activate.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import LogIn from '@/components/LogIn.vue';
import Profile from '@/components/Profile.vue';

const routes = [
  { path: '/', name: 'HelloWorld', component: HelloWorld },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/login', name: 'LogIn', component: LogIn },
  { path: '/auth/authorize',name: 'ActivateAccount', component: Activate },
  {path: '/profile/:userId', name: 'ProfileView',component: Profile},
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';
import Activate from '@/components/Activate.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import LogIn from '@/components/LogIn.vue';
import AddPost from '@/components/AddPost.vue';

const routes = [
  { path: '/', name: 'HelloWorld', component: HelloWorld },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/login', name: 'LogIn', component: LogIn },
  { path: '/auth/authorize',name: 'ActivateAccount', component: Activate },
  {path: '/posts', name: 'AddPost', component: AddPost}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

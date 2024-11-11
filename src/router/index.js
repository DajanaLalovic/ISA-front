import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';
import Activate from '@/components/Activate.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import LogIn from '@/components/LogIn.vue';
import AddPost from '@/components/AddPost.vue';
import Profile from '@/components/Profile.vue';
import AllPosts from '@/components/AllPosts.vue';
import UsersAnalitics from '@/components/UsersAnalitics.vue';
import UsersChat from '@/components/UsersChat.vue';
import NearPosts from '@/components/NearPosts.vue';
import FollowedPosts from '@/components/FollowedPosts.vue';

const routes = [
  { path: '/', name: 'HelloWorld', component: HelloWorld },
  { path: '/signup', name: 'SignUp', component: SignUp , meta: { requiresGuest: true }},
  { path: '/login', name: 'LogIn', component: LogIn, meta: { requiresGuest: true } },
  { path: '/auth/authorize',name: 'ActivateAccount', component: Activate },
  {path: '/posts', name: 'AddPost', component: AddPost,  meta: { requiresAuth: true } },
  {path: '/profile/:userId', name: 'ProfileView',component: Profile},
  { path: '/allPosts', name: 'AllPosts', component: AllPosts },
  { path: '/analitics', name: 'UsersAnalitics', component: UsersAnalitics,  meta: { requiresAuth: true }},
  {path: '/chat', name: 'UsersChat', component: UsersChat,  meta: { requiresAuth: true }},
  {path:'/nearPosts', name: 'NearPosts', component: NearPosts,  meta: { requiresAuth: true }},
  {path: '/followedPosts', name:'FollowedPosts', component:FollowedPosts,  meta: { requiresAuth: true }}

];

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  console.log('Starting beforeEach');
  console.log('Navigating to:', to.path, '| Logged in status:', isLoggedIn);
  // Provera da li ruta zahteva prijavljenog korisnika
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      return next('/login'); // Preusmerava neprijavljene korisnike na login stranicu
    }
  }
  const authToken = localStorage.getItem('authToken');
  const login = authToken ? true : false; 
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (login) {
      console.log('Redirecting to home because user is already logged in');
      return next('/'); // Preusmerava prijavljene korisnike na početnu stranicu
    }
  }

  next(); // Dozvoljava pristup ako sve provere prođu
});

export default router;

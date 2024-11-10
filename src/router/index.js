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
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/login', name: 'LogIn', component: LogIn },
  { path: '/auth/authorize',name: 'ActivateAccount', component: Activate },
  {path: '/posts', name: 'AddPost', component: AddPost},
  {path: '/profile/:userId', name: 'ProfileView',component: Profile},
  { path: '/allPosts', name: 'AllPosts', component: AllPosts },
  { path: '/analitics', name: 'UsersAnalitics', component: UsersAnalitics},
  {path: '/chat', name: 'UsersChat', component: UsersChat},
  {path:'/nearPosts', name: 'NearPosts', component: NearPosts},
  {path: '/followedPosts', name:'FollowedPosts', component:FollowedPosts}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

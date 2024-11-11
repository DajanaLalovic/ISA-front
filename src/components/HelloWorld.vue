<template>
<div class="links-container" >
  <router-link to="/signup" class="link" v-if="!isLoggedIn">Sign up</router-link>
  <router-link to="/login" class="link" v-if="!isLoggedIn">Login</router-link>
  <router-link to="/posts" class="link" v-if="isLoggedIn">AddPost</router-link>
  <router-link to="/allPosts" class="link">Posts</router-link>
  <router-link to="/profile/1" class="link" v-if="isLoggedIn">My Profile</router-link>
</div>

<div class="links-container" >
    <router-link to="/analitics" class="link" v-if="isLoggedIn">User Analytics</router-link>
    <router-link to="/chat" class="link" v-if="isLoggedIn">User Chat</router-link>
    <router-link to="/nearPosts" class="link" v-if="isLoggedIn">Near Posts</router-link>
    <router-link to="/followedPosts" class="link" v-if="isLoggedIn">Followed Posts</router-link>
    
  </div>
<p>Hello</p>
</template>
<script>



export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      
      isLoggedIn: false 
    };
  },

  mounted() {
    const authStatus = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = authStatus === 'true'; // Ako je ulogovan, status će biti 'true'
    console.log('Login status:', this.isLoggedIn);

  }, 
  created() {

  },
    


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.links-container {
  display: flex;
  justify-content: flex-end;  /* Poravnanje levo */
  align-items: center;  /* Poravnanje vertikalno */
  margin-top: 20px;  /* Razmak od vrha */
}

.link {
  text-decoration: none;  /* Uklanja podvlačenje */
  color: #42b983;  /* Zelena boja */
  margin-right: 20px;  /* Razmak između linkova */
  font-size: 16px;  /* Veličina fonta */
}

.link:hover {
  text-decoration: underline;  /* Podvlačenje pri hoveru */
}


h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

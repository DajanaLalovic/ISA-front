<template>
  <div class="container">
    <!-- Navigacioni bar -->
    <nav class="navbar">
      <div class="navbar-logo">OnlyBuns</div>
      <div class="nav-links">
        <router-link to="/signup" class="nav-link" v-if="!isLoggedIn">Sign up</router-link>
        <router-link to="/login" class="nav-link" v-if="!isLoggedIn">Log in</router-link>
        <router-link :to="`/usermap/${userId}`" class="nav-link" v-if="isLoggedIn">Map</router-link>
        <router-link to="/posts" class="nav-link" v-if="isLoggedIn">AddPost</router-link>
        <router-link to="/allPosts" class="nav-link">Posts</router-link>
        <router-link to="/allUsers" class="nav-link" v-if="isAdmin">Users</router-link>
        <a @click.prevent="logout" class="nav-link" v-if="isLoggedIn">Logout</a>
        <router-link :to="`/profile/${userId}`" class="nav-link" v-if="isLoggedIn">My Profile</router-link>
      </div>
    </nav>

    <!-- Glavna sekcija sa slikom i tekstom -->
    <section class="hero-section">
      <div class="hero-text">
        <h1>Post your bun and have fun!</h1>
        <p>OnlyBuns helps you follow and post pictures, comments, and posts...enjoy</p>
        <button class="cta-button" v-if="!isLoggedIn"  @click="navigateToSignUp">Sign up for free</button>
      </div>
      <div class="hero-image">
        <img src="@/assets/slatkis.jpg" alt="Hero Image" />
      </div>
    </section>
    <div class="links-container">
      <router-link to="/trends" class="link"  v-if="isLoggedIn">Trends Dashboard</router-link>
      <router-link to="/analytics" class="link"  v-if="isAdmin">Application Analytics</router-link>
      <router-link to="/chat" class="link" v-if="isUser && isLoggedIn">User Chat</router-link> <!--samo user    v-if="isLoggedIn"-->
      <router-link to="/nearPosts" class="link" v-if="isUser && isLoggedIn">Posts from followers</router-link><!--samo user    v-if="isLoggedIn"-->
      <router-link to="/followedPosts" class="link" v-if="isUser && isLoggedIn">Followed Posts</router-link><!--samo user   v-if="isLoggedIn"-->


    </div>
  
  </div>

</template>
<script>


import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      
      isLoggedIn: false ,
      userId: null,
      userRole: null,

    };
  },
  computed: {
    isAdmin() {
      return this.userRole === 'ADMIN';
    },
    isUser() {
      return this.userRole === 'USER';
    },
  },
  mounted() {
    const authStatus = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = authStatus === 'true'; // Ako je ulogovan, status će biti 'true'
    console.log('Login status:', this.isLoggedIn);
    this.userId = localStorage.getItem('userId');
    console.log('User ID:', this.userId);
    if (this.userId) {
      const token = localStorage.getItem('authToken'); // Pretpostavka da je token sačuvan u localStorage

        // Pozovite backend API da biste dobili userRole
        axios.get(`http://localhost:8080/api/user/${this.userId}/role`,
        {
          headers: {
            Authorization: `Bearer ${token}` // Ovdje se koristi token
          }
        })
            .then(response => {
                this.userRole = response.data;
                console.log('User role:', this.userRole);
            })
            .catch(error => {
                console.error("Error fetching user role:", error);
            });
    }

  }, 
  created() {

  },
  methods: {
    navigateToSignUp() {
      this.$router.push('/signup');
    },
    logout() {
      // Prikazivanje poruke
     
      Swal.fire({
        icon: 'info',
        title: 'Logged Out',
        text: 'You are logged out.',
        confirmButtonText: 'OK'
      });
      // Brisanje podataka iz localStorage-a
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');

      // Resetovanje statusa u komponenti
      this.isLoggedIn = false;
      this.userId = null;

      // Preusmeravanje na početnu stranicu
      this.$router.push('/');
    }
  }
};



</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  width: 100%;
}
.links-container {
  display: flex;
  justify-content: space-around; /* Rasporedi linkove ravnomerno */
  padding: 20px;
  background-color: #faf3e0; /* Svetlija krem boja */
  border-top: 1px solid #e0d8b8; /* Blaga ivica */
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5deb3; /* Krem boja za pozadinu */
}

.navbar-logo {
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #333; /* Tamnija krem boja za tekst */
  text-decoration: none;
  font-size: 16px;
}

.nav-link:hover {
  text-decoration: underline;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px;
  background-color: #faf3e0; /* Svetlija krem pozadina */
}

.hero-text {
  max-width: 50%;
}

.hero-text h1 {
  font-size: 48px;
  color: #333;
}

.hero-text p {
  font-size: 18px;
  margin: 20px 0;
  color: #555;
}

.cta-button {
  background-color: #f5deb3; /* Krem boja za dugme */
  color: #333; /* Tamnija boja za tekst */
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #e6c79c; /* Tamnija krem boja za hover */
}

.hero-image img {
  max-width: 100%;
  border-radius: 10px;
}
</style>

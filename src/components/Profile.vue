<template>
  <div v-if="user" class="profile-container">
    <h1>User Profile</h1>
    <div class="profile-info">
      <div class="profile-item">
        <strong>First Name:</strong> <span>{{ user.name }}</span>
      </div>
      <div class="profile-item">
        <strong>Last Name:</strong> <span>{{ user.surname }}</span>
      </div>
      <div class="profile-item">
        <strong>Username:</strong> <span>{{ user.username }}</span>
      </div>
      <div class="profile-item">
        <strong>Email:</strong> <span>{{ user.email }}</span>
      </div>
      <div class="profile-item">
        <strong>Role:</strong> <span>{{ user.role }}</span>
      </div>
    </div>
  </div>
  <div v-else class="loading-message">
    <p>Loading user data...</p>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'ProfileView',
  setup() {
    const user = ref(null);
    const route = useRoute();
    const userId = route.params.userId;
    console.log('User ID:', userId);

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/profile/${userId}`, {
          // Uncomment the line below if authentication token is required
         // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        user.value = response.data;
      } catch (error) {
        console.error('Error loading profile: ', error);
      }
    };

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      user
    };
  }
};
</script>
<style scoped>
.profile-container {
  margin-top: 7%;
  margin-left: 27%;
  max-width: 600px;
 /* margin: 40px auto;*/
  padding: 30px;
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.profile-info {
  border-top: 2px solid #d73ea9;
  padding-top: 20px;
  margin-top: 20px;
}

.profile-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
  margin-left: 20%;
}

.profile-item strong {
  width: 150px;
  color: #d73ea9;
  text-align: left;
  font-weight: 600;
  font-size: 18px;
  font-family: 'Georgia', serif;
  letter-spacing: 0.5px;
}

.profile-item span {
  font-size: 18px;
  color: #333;
  font-family: 'Georgia', serif;
  font-style: italic;
  color: #444;
}

h1 {
  font-family: 'Georgia', serif;
  color: #d73ea9;
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  margin-top: 50px;
  color: #d73ea9;
  font-family: 'Georgia', serif;
}
</style>

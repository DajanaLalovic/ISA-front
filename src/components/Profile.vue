<template>
  <div v-if="user" class="profile-container">
    <div class="profile-header">
      <img src="@/assets/ikonica.jpeg" alt="User Image" class="profile-image" />
      <div class="profile-username">{{ user.username }}</div>
    </div>
    <hr class="profile-divider" />
    <div class="profile-info">
      <div class="profile-item">
        <strong>First Name:</strong> <span>{{ user.name }}</span>
      </div>
      <div class="profile-item">
        <strong>Last Name:</strong> <span>{{ user.surname }}</span>
      </div>
      <div class="profile-item">
        <strong>Email:</strong> <span>{{ user.email }}</span>
      </div>
      <div class="profile-item">
        <strong>Role:</strong> <span>{{ user.role }}</span>
      </div>
    </div>
    <hr class="profile-divider" />

    <!-- Dugmad za follow/unfollow i return -->
    <div class="profile-footer">
      <div v-if="currentUserId !== user.id">
        <button v-if="!isFollowing" @click="followUser" class="follow-button">Follow</button>
        <button v-else @click="unfollowUser" class="unfollow-button">Unfollow</button>
      </div>
      <button @click="returnToHome" class="return-button">Return</button>
    </div>
  </div>
  <div v-else class="loading-message">
    <p>Loading user data...</p>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "ProfileView",
  setup() {
    const user = ref(null);
    const isFollowing = ref(false);
    const route = useRoute();
    const userId = parseInt(route.params.userId); // ID korisnika čiji profil gledamo
    const currentUserId = parseInt(localStorage.getItem("userId")); // ID trenutnog korisnika

    // Učitavanje profila korisnika
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:8080/api/profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        user.value = response.data;

        // Provera da li trenutni korisnik prati cilj korisnika
        isFollowing.value = user.value.followers?.includes(currentUserId);
      } catch (error) {
        console.error("Error loading profile: ", error);
      }
    };

    // Funkcija za Follow
    const followUser = async () => {
      const token = localStorage.getItem("authToken");

      if (!token || !currentUserId) {
        alert("You are not logged in!");
        return;
      }

      try {
        await axios.post(
          `http://localhost:8080/api/follow/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        isFollowing.value = true; // Ažuriraj stanje nakon Follow
        alert("You are now following this user.");
      } catch (error) {
        console.error("Error following user:", error);
        if (error.response && error.response.status === 429) {
          alert("You have exceeded the follow limit. Please wait a minute.");
        } else {
          alert("Failed to follow user.");
        }
      }
    };
    const checkIfFollowing = async () => {
      const token = localStorage.getItem("authToken");

      if (!token || !currentUserId) {
        console.error("You are not logged in!");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/follow/status/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        isFollowing.value = response.data; // Rezultat provere
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };


    // Funkcija za Unfollow
    const unfollowUser = async () => {
      const token = localStorage.getItem("authToken");

      if (!token || !currentUserId) {
        alert("You are not logged in!");
        return;
      }

      try {
        await axios.delete(`http://localhost:8080/api/unfollow/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        isFollowing.value = false; // Ažuriraj stanje nakon Unfollow
        alert("You have unfollowed this user.");
      } catch (error) {
        console.error("Error unfollowing user:", error);
        alert("Failed to unfollow user.");
      }
    };

    // Funkcija za povratak na početnu stranicu
    const returnToHome = () => {
      window.location.href = "http://localhost:8081/allPosts";
    };

    // Kada se komponenta montira, učitava se profil korisnika
    onMounted(() => {
      fetchUserProfile();
      checkIfFollowing(); //mora da bude za automatski follow ili unfollow
    });

    return {
      user,
      isFollowing,
      followUser,
      unfollowUser,
      returnToHome,
      currentUserId,
    };
  },
};
</script>

<style scoped>
.profile-container {
  position: fixed;
  top: 20px;
  left: 10px;
  height: calc(100% - 100px);
  width: 280px;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  color: #2c3e50;
  background-color: #fff5e6;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  overflow-y: auto;
}
.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 15px;
  border: 3px solid #ff9f43;
}

.profile-username {
  font-size: 22px;
  font-weight: bold;
  color: #e67e22;
}

.profile-info {
  margin-top: 20px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.profile-item strong {
  color: #e67e22;
  font-weight: bold;
  font-size: 14px;
}

.profile-item span {
  font-size: 14px;
  color: #2c3e50;
  font-style: italic;
}

.profile-divider {
  border: none;
  border-top: 2px solid #e0d8b8;
  margin: 15px 0;
}

.profile-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.follow-button,
.unfollow-button,
.return-button {
  background-color: #ff9f43;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.follow-button:hover,
.unfollow-button:hover,
.return-button:hover {
  background-color: #e67e22;
}
</style>

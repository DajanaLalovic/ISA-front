<template>
  <div v-if="user" class="profile-container">
    <div class="profile-header">
      <img src="@/assets/ikonica.jpeg" alt="User Image" class="profile-image" />
      <div class="profile-username">{{ user.username }}</div>
    </div>
    <hr class="profile-divider" />
    <div class="profile-info">
      <div class="profile-item">
        <strong>First Name:</strong>  <button @click="openEditModal" v-if="currentUserId == user.id" class="edit-btn">✏️</button><span>{{ user.name }}</span>
        
      </div>
      <div class="profile-item">
        <strong>Last Name:</strong> 
         <button @click="openEditModal" v-if="currentUserId == user.id" class="edit-btn">✏️</button>
         <span>{{ user.surname }}</span>
      </div>
      <div class="profile-item">
        <strong>Email:</strong> <span>{{ user.email }}</span>
      </div>
      <div class="profile-item">
        <strong>Role:</strong> <span>{{ user.role }}</span>
      </div>
      <div class="profile-item">
        <strong>Address:</strong>
         <button @click="openEditModal" v-if="currentUserId == user.id" class="edit-btn">✏️</button>
        <span>🏡{{user.address.street }},{{ user.address.number }} 
            🌎{{ user.address.country }},{{  user.address.city }} 📬{{ user.address.postalCode }}</span>
      </div>
      <div class="profile-item">
        <strong>Followers:</strong> <span>{{ user.followersCount }}</span>
      </div>
      <div>
       

        <div class="profile-item">
        
        <button @click="showChangePassword" v-if="currentUserId == user.id" class="change-password-btn">
          Change Password
        </button>
      </div>
      <div v-if="isChangingPassword" class="password-change">
        <h3>Change Password</h3>
        <input v-model="newPassword" type="password" placeholder="New Password" />
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm Password"
        />
        <div v-if="confirmPasswordError" class="error-message">
          <span>Passwords do not match!</span>
        </div>
        <button @click="updatePassword">Update Password</button>
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
        <!-- <div class="password-change">
      <h2>Change Password</h2>
      <input v-model="newPassword" type="password" placeholder="New Password" />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" />
      <button @click="updatePassword">Update Password</button>
    </div> -->
    
      </div>
    </div>
    

  </div>
  <div  class="profile-container-right" v-if="currentUserId === profileUserId">
    <div class="user-connections">
  <h3>User Connections</h3>

  <div class="lists-container">
    <!-- Prikaz Followers -->
    <div class="list-section">
      <h4>Followers ({{ followers.length }})</h4>
      <div class="connections-list" v-if="followers.length > 0">
        <div v-for="follower in followers" :key="follower.id" class="user-card">
          <img :src="require('@/assets/ikonica.jpeg')" alt="User Avatar" class="user-avatar" />
          <div class="user-info">
            <p>{{ follower.name }} {{ follower.surname }}</p>
           <p>@{{ follower.username }}</p>
           <p class="email">{{ follower.email }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-followers">
        <img :src="require('@/style/bunny_sad.png')" alt="No Followers" class="no-followers-image" /> 
  <p class="no-followers-text">You don't have followers yet.Post more so users can find you!</p>
</div>
    </div>

    <!-- Prikaz Following -->
    <div class="list-section">
      <h4>Following ({{ following.length }})</h4>
      <div class="connections-list" v-if="following.length > 0">
        <div v-for="followed in following" :key="followed.id" class="user-card">
          <img :src="require('@/assets/ikonica.jpeg')" alt="User Avatar" class="user-avatar" />
          <div class="user-info">
            <p>{{ followed.name }} {{ followed.surname }}</p>
           <p>@{{ followed.username }}</p>
           <p class="email">{{ followed.email }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-followers">
   <img :src="require('@/style/bunny_sad.png')" alt="No Followers" class="no-followers-image" /> 
  <p class="no-followers-text">You don't follow anyone yet.Go explore and find new friends!</p>
</div>
    </div>
  </div>
</div>

    <!-- <div class="user-connections">
  <h3>User Connections</h3>
  
  
  <div v-if="followers.length > 0">
    <h4>Followers ({{ followers.length }})</h4>
    <div class="connections-list">
      <div v-for="follower in followers" :key="follower.id" class="user-card">
        <img :src="require('@/assets/ikonica.jpeg')" alt="User Avatar" class="user-avatar" />
        <div class="user-info">
          <p><strong>Username:</strong> {{ follower.username }}</p>
          <p><strong>Name:</strong> {{ follower.name }} {{ follower.surname }}</p>
          <p><strong>Email:</strong> {{ follower.email }}</p>
        </div>
      </div>
    </div>
  </div>

 
  <div v-if="following.length > 0">
    <h4>Following ({{ following.length }})</h4>
    <div class="connections-list">
      <div v-for="followed in following" :key="followed.id" class="user-card">
        <img :src="require('@/assets/ikonica.jpeg')" alt="User Avatar" class="user-avatar" />
        <div class="user-info">
          <p><strong>Username:</strong> {{ followed.username }}</p>
          <p><strong>Name:</strong> {{ followed.name }} {{ followed.surname }}</p>
          <p><strong>Email:</strong> {{ followed.email }}</p>
        </div>
      </div>
    </div>
  </div>
</div> -->


  <h3>YOUR POSTS</h3> 
    <div class="posts-list">
   <!-- Prikazivanje naslova MY POSTS -->
    <div v-for="post in myPosts" :key="post.id" class="post-card">
      <div class="post-date">{{ formatDate(post.createdAt) }}</div>
      <div class="post-header">
        <img :src="post.imagePath" alt="Post image" class="post-image" />
        
        
      </div>

      <div class="post-details">
        <div class="post-info">
          
          <p>{{ post.description }}</p>
        </div>
        <div class="post-actions">
          <span  class="action-icon">👍  {{ post.likesCount }}</span>
           <span @click="viewComments(post.id)" class="action-icon-click">💬 {{ post.comments?.length || 0 }}</span> 
        </div>
        
        <!-- <div v-if="commentsVisible[post.id]" class="comments-section">
  <div v-if="post.comments && post.comments.length > 0">
    <div v-for="comment in post.comments" :key="comment.id" class="comment">
      <strong>User {{ comment.userId }}:</strong> {{ comment.text }}
      <br/>
      <small>{{ formatDate(comment.createdAt) }}</small>
    </div>
  </div>
  <div v-else>
    <em>No comments yet.</em>
  </div>
</div>"commentsVisible.value[post.id]" -->
<div v-if="commentsVisible[post.id]" class="comments-section">
  <div v-if="post.comments && post.comments.length > 0">
    <div v-for="comment in post.comments" :key="comment.id" class="comment">
      <strong>{{ usernames[comment.userId] }}:</strong> {{ comment.text }}
      <br/>
      <small>{{ formatDate(comment.createdAt) }}</small>
    </div>
  </div>
  <div v-else>
    <em>No comments yet.</em>
  </div>
</div>



      </div>

   
    </div>
  </div>

  </div>





<div v-if="showModal" class="modal-overlay">
  <div class="modal-content">
    <h3>Edit Profile Info</h3>
    <input v-model="editData.name" placeholder="First Name" />
    <input v-model="editData.surname" placeholder="Last Name" />
    <input v-model="editData.street" placeholder="Street" />
    <input v-model="editData.number" placeholder="Number" />
    <input v-model="editData.city" placeholder="City" />
    <input v-model="editData.country" placeholder="Country" />
    <input v-model="editData.postalCode" placeholder="Postal Code" />
    <div class="modal-buttons">
      <button @click="submitChanges">Save</button>
      <button @click="showModal = false">Cancel</button>
    </div>
  </div>
</div>
</template>

<script>
import axios from "axios";
import { ref, computed,onMounted , reactive} from "vue";
import { useRoute } from "vue-router";
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  name: "ProfileView",
  setup() {
    const user = ref(null);
    const isFollowing = ref(false);
    const route = useRoute();
    const router = useRouter();
    const userId = parseInt(route.params.userId); // ID korisnika čiji profil gledamo
    const currentUserId = parseInt(localStorage.getItem("userId")); // ID trenutnog korisnika
    const newPassword = ref('');
    const confirmPassword = ref('');
    const isChangingPassword = ref(false);
    const confirmPasswordError = ref(false);
    const menuOpen = ref({}); // Za praćenje stanja menija za svaki post
    const commentsVisible = reactive({});
 // Za praćenje komentara po postu
    const posts = ref([]); // Dodajemo ovu varijablu za postove
    const myPosts = ref([]);
    const isAuthen = !!localStorage.getItem('authToken'); // Proveravamo da li je korisnik ulogovan
    const followers = ref([]);
    const following = ref([]);
    const profileUserId =  ref(0);
    const usernames = reactive({}); 

    const maskedPassword = computed(() => {
   return user.value && user.value.password
    ? '*'.repeat(user.value.password.length)
    : '';
    });
   // const usernames = reactive({});
   // const fetchUsername = (userId) => {
   const fetchUsername = async (userId) => {

       if (usernames[userId]) {
        // Ako već postoji u mapi, vraćamo odmah (nije async)
        return usernames[userId];
      }
      try {
        const response = await axios.get(`http://localhost:8080/api/getOneUser/${userId}`);
        usernames[userId] = response.data.username;  // dodaj u mapu
        console.log(usernames[userId])
        return usernames[userId];
      } catch (error) {
        usernames[userId] = 'nepoznat';
        return 'nepoznat';
      }
}   

    const showChangePassword = () => {
      isChangingPassword.value = true;
      confirmPasswordError.value = false;
    };

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
        profileUserId.value = user.value.id;

        // Provera da li trenutni korisnik prati cilj korisnika
        isFollowing.value = user.value.followers?.includes(currentUserId);
        await fetchPosts();
        if (currentUserId === user.value.id) {
      await fetchFollowersAndFollowing();
    }
      } catch (error) {
        console.error("Error loading profile: ", error);
      }
    };

    //////////////
const showModal = ref(false);
const editData = reactive({
  name: '',
  surname: '',
  street: '',
  number: '',
  city: '',
  country: '',
  postalCode: ''
});

const openEditModal = () => {
  console.log('openEditModal called');
  console.log(user);
  if (user.value) {
    editData.name = user.value.name;
    editData.surname = user.value.surname;
    editData.street = user.value.address.street;
    editData.number = user.value.address.number;
    editData.city = user.value.address.city;
    editData.country = user.value.address.country;
    editData.postalCode = user.value.address.postalCode;
    showModal.value = true;
  }
};

const submitChanges = async () => {
  try {
    const token = localStorage.getItem('authToken');
    await axios.put(`http://localhost:8080/api/updateprofile/${userId}`, {
      name: editData.name,
      surname: editData.surname,
      address: {
        street: editData.street,
        number: editData.number,
        city: editData.city,
        country: editData.country,
        postalCode: editData.postalCode
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Swal.fire('Success', 'Profile updated successfully!', 'success');
    showModal.value = false;
    fetchUserProfile(); // ponovo učitaj podatke

  } catch (error) {
    console.error('Update error:', error);
    Swal.fire('Error', 'Could not update profile.', 'error');
  }
};

    ////////////

    // Funkcija za Follow
    const followUser = async () => {
      const token = localStorage.getItem("authToken");

      if (!token || !currentUserId) {
        Swal.fire({
        icon: 'warning',
        title: 'Not logged in',
        text: 'You are not logged in!',
        confirmButtonText: 'OK'
      });
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
        // isFollowing.value = true; // Ažuriraj stanje nakon Follow
        Swal.fire({
        icon: 'success',
        title: 'Followed',
        text: 'You are now following this user.',
        confirmButtonText: 'OK'
      });
        
        await fetchUserProfile(); // Osveži podatke o korisniku
        isFollowing.value = true; // Ažuriraj stanje nakon Follow
      } catch (error) {
        console.error("Error following user:", error);
        if (error.response && error.response.status === 429) {
          Swal.fire({
      icon: 'error',
      title: 'Follow limit exceeded',
      text: 'You have exceeded the follow limit. Please wait a minute.',
      confirmButtonText: 'OK'
    });
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
        
        Swal.fire({
          icon: 'info',
          title: 'Unfollowed',
          text: 'You have unfollowed this user.',
          confirmButtonText: 'OK'
        });

        await fetchUserProfile(); // Osveži podatke o korisniku
      } catch (error) {
        console.error("Error unfollowing user:", error);
        alert("Failed to unfollow user.");
      }
    };

    const updatePassword = async () => {
  // if (newPassword.value !== confirmPassword.value) {
  //   alert('Passwords do not match!');
  //   return;
  // }
  if (newPassword.value !== confirmPassword.value) {
        confirmPasswordError.value = true; // Ako lozinke nisu iste, postavite grešku
        return;
      }
      confirmPasswordError.value = false;

  // Dohvati token iz Local Storage
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Nedostaje token za autentifikaciju. Prijavi se ponovo.');
    return;
  }

  try {
    await axios.put(
      `http://localhost:8080/api/profile/${userId}/password`,
      {
        newPassword: newPassword.value, // Podaci koji se šalju u telu zahteva
      },
      {
        headers: {
          'Content-Type': 'application/json', // Specifikacija tipa sadržaja
          'Authorization': `Bearer ${token}`, // Token za autentifikaciju
        },
      }
    );
        Swal.fire({
      icon: 'success',
      title: 'Password Updated',
      text: 'Password updated successfully!',
      confirmButtonText: 'OK'
    });
    isChangingPassword.value = false;
  } catch (error) {
    console.error('Error updating password:', error.response?.status, error.response?.data);
    if (error.response && error.response.status === 401) {
      Swal.fire({
      icon: 'error',
      title: 'Authentication Failed',
      text: 'Authentication failed. Please log in again.',
      confirmButtonText: 'OK'
    });
      
    } else {
      Swal.fire({
      icon: 'error',
      title: 'Password Update Failed',
      text: 'Failed to update password.',
      confirmButtonText: 'OK'
    });
    }
  }
};





const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts/all');
        const processedPosts = await Promise.all(
          response.data
            .filter(post => !post.isRemoved && post.userId === user.value.id) 
            // .map(async post => ({
            //   ...post,
            //   imagePath: `http://localhost:8080/images/${post.imagePath}`,
            //   likesCount: await fetchLikesCount(post.id),
            //   comments: post.comments || [],
            // }))
             .map(async post => {
          // Za svaki komentar u postu, pozovi fetchUsername i napuni mapu
          if (post.comments && post.comments.length > 0) {
            await Promise.all(post.comments.map(comment => fetchUsername(comment.userId)));
          }
          return {
            ...post,
            imagePath: `http://localhost:8080/images/${post.imagePath}`,
            likesCount: await fetchLikesCount(post.id),
            comments: post.comments || [],
          };
        })
        );
        
        posts.value = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       // const username = this.fetchUsername(post.comme)
        myPosts.value = posts.value;
        
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };



const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const likePost = async (postId) => {
      try {
        await axios.post(`http://localhost:8080/api/posts/${postId}/like`);
        fetchPosts(); // Ponovno učitaj postove nakon lajkovanja
      } catch (error) {
        console.error('Error liking post:', error);
      }
    };
//     const fetchFollowersAndFollowing = async () => {
//   try {
//     const token = localStorage.getItem("authToken");

//     // Fetch followers
//     const followersResponse = await axios.get(
//       `http://localhost:8080/api/${userId}/followers`,
//       { headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
//     );
//     followers.value = followersResponse.data;

//     // Fetch following
//     const followingResponse = await axios.get(
//       `http://localhost:8080/api/${userId}/following`,
//       { headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
//     );
//     following.value = followingResponse.data;
//   } catch (error) {
//     console.error("Error fetching followers/following: ", error);
//   }
// };

const fetchFollowersAndFollowing = async () => {
  try {
    const token = localStorage.getItem("authToken");

    // Fetch followers
    const followersResponse = await axios.get(
      `http://localhost:8080/api/${userId}/followers`,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    );
    followers.value = followersResponse.data;
    console.log("Fetched followers:", followers.value);
    //console.log(followers.value.at(0).username);

    // Fetch following
    const followingResponse = await axios.get(
      `http://localhost:8080/api/${userId}/following`,
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
    );
    following.value = followingResponse.data;
    console.log("Fetched following:", following.value);

  } catch (error) {
    console.error("Error fetching followers/following: ", error);
  }
};



const toggleMenu = (postId) => {
      menuOpen.value[postId] = !menuOpen.value[postId]; // Otvoriti/zatvoriti meni za post
    };

    const deletePost = async (postId) => {
      try {
        await axios.delete(`http://localhost:8080/api/posts/${postId}`);
        fetchPosts(); // Ponovo učitaj postove nakon brisanja
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    };

    const hidePost = async (postId) => {
      try {
        await axios.put(`http://localhost:8080/api/posts/${postId}/hide`);
        fetchPosts(); // Ponovo učitaj postove nakon sakrivanja
      } catch (error) {
        console.error('Error hiding post:', error);
      }
    };
    const viewComments = (postId) => {
      commentsVisible[postId] = !commentsVisible[postId]; // Prikazivanje/sakrivanje komentara
    };

    
    const fetchLikesCount = async (postId) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/likesCount/${postId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching likes count for post ${postId}:`, error);
        return 0;
      }
    };
    const openUpdateModal = (post) => {
      const loggedInUserId = parseInt(localStorage.getItem('userId'));

      if (post.userId !== loggedInUserId) {
        alert('You do not have permission to edit this post.');
        return;
      }
      router.push({
        name: 'AddPost',
        query: {
          id: post.id,
          description: post.description,
          latitude: post.latitude,
          longitude: post.longitude,
          imagePath: post.imagePath,
          createdAt:post.createdAt
        },
      });
    };


    // Funkcija za povratak na početnu stranicu
    const returnToHome = () => {
      window.location.href = "http://localhost:8081/allPosts";
    };

    // Kada se komponenta montira, učitava se profil korisnika
    onMounted(() => {
      fetchUserProfile();
      checkIfFollowing(); //mora da bude za automatski follow ili unfollow
      // fetchPosts();
      console.log(userId);
      console.log(currentUserId);
    });

    return {
      user,
      isFollowing,
      followUser,
      unfollowUser,
      returnToHome,
      currentUserId,
      newPassword,
      confirmPassword,
      isChangingPassword,
      maskedPassword,
      updatePassword,
      showChangePassword,
      confirmPasswordError, 
      posts,
      myPosts,
      menuOpen,
      likePost,
      openUpdateModal,
      toggleMenu,
      deletePost,
      hidePost,
      fetchLikesCount,
      viewComments,
      formatDate,
      isAuthen,
      following,
      followers,
      profileUserId,
      commentsVisible,
      fetchUsername,
      usernames,
      openEditModal,
      submitChanges,
      showModal,
      editData
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff5e6;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 0 10px #00000050;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-content input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.edit-btn {
  margin-left: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.profile-container-right {
  position: fixed;
  top: 20px;
  right: 10px; /* Pozicioniranje desno */
  height: calc(100% - 100px); /* Zadržava istu visinu kao originalni panel */
  width: 71%; /* Preostali prostor (280px + 30px margine između panela) */
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  color: #2c3e50;
  background-color: #fff5e6; /* Svetla narandžasta pozadina */
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1); /* Sjena prema unutra */
  border-radius: 15px;
  overflow-y: auto;
}

.profile-container {
  position: fixed;
  top: 20px;
  left: 10px;
  height: calc(100% - 100px);
  /*width: 280px;*/
  width: 20%;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
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
}
h3{
  color: #e67e22;
}

.follow-button {
  background-color: #ff9f43;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.follow-button:hover {
  background-color: #e67e22;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  margin-top: 50px;
  color: #ff9f43;
  font-family: 'Roboto', sans-serif;
}

h1 {
  font-family: 'Georgia', serif;
  color: #d73ea9;
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
}

.password-change {
  margin-top: 10px;
  padding: 4px; /* Smanjen padding */
  background-color: #fff5e6; /* Svetla narandžasta pozadina */
  border: 1px solid #e0d8b8;
  border-radius: 15px;
  height: 150px; /* Smanjena visina */
  max-height: 150px; /* Ograničenje maksimalne visine */
  overflow-y: auto; /* Dodato skrolovanje ako sadržaj prelazi visinu */
}

.password-change input {
  display: block;
  margin-left: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
  padding: 3px;
  width: 80%; /* Smanjena širina */
  border: 1px solid #ff9f43; /* Narandžasta ivica */
  border-radius: 10px; /* Zaobljene ivice */
  font-size: 10px;
  font-family: 'Roboto', sans-serif;
  color: #2c3e50;
  background-color: #fff; /* Bela pozadina za kontrast */
}

.password-change input:focus {
  border-color: #e67e22; /* Tamnija narandžasta pri fokusu */
  outline: none;
  box-shadow: 0 0 5px rgba(230, 126, 34, 0.5);
}

.password-change button {
  background-color: #ff9f43; /* Narandžasta pozadina */
  color: #fff;
  padding: 4px 8px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.password-change button:hover {
  background-color: #e67e22; /* Tamnija narandžasta pri hoveru */
}

.change-password-btn {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #ff9f43; /* Usklađeno sa narandžastim stilom */
  color: #fff;
  border: none;
  border-radius: 20px; /* Zaobljene ivice */
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.change-password-btn:hover {
  background-color: #e67e22; /* Tamnija narandžasta */
}
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}


.posts-list {
  margin-right: 0;
  display: flex;
  flex-wrap: wrap; /* Kartice prelaze u sledeći red kada nema dovoljno mesta */
  gap: 16px; /* Razmak između kartica */
}

.post-card {
  flex: 1 1 calc(25% - 16px); /* Kartica zauzima četvrtinu reda minus razmak */
  max-width: calc(25% - 16px); /* Osigurava da kartica ne pređe ovu širinu */
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f4dece;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.post-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.post-details {
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.post-info {
  text-align: left;
  margin-bottom: 10px;
}

.post-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.post-info p {
  margin: 5px 0 0;
  font-size: 16px;
  color: #666;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  }
  .user-info h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

.post-date {
  margin-left: 70%;
  margin-top: 2%;
  
  font-size: 14px;
  color: #040404;
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
.user-connections {
  margin-top: 20px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lists-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.list-section {
  flex: 1; /* Svaka lista zauzima jednaku širinu */
  background-color: #f5e6dc;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-section h4 {
  color: #e67e22;
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
}

.connections-list {
  display: flex;
  flex-direction: column;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-height: 250px;
  overflow-y: auto;
   scrollbar-width: thin;         /* Za Firefox */
  scrollbar-color: #ff9f43 transparent;  
}

.user-card {
  width: 100%; /* Automatska širina kartice */
  max-width: 300px; /* Maksimalna širina kartice */
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex; /* Flexbox za raspored slike i teksta */
  align-items: center;
  gap: 15px; /* Razmak između slike i teksta */
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column; /* Vertikalno poravnanje teksta */
  font-size: 14px;
}

.user-info p {
  margin: 2px 0; /* Smanjen razmak između linija */
  color: #333;
}

.user-info .email {
  color: #e67e22; /* Narandžasta boja za email */
  font-weight: bold;
}

.user-info strong {
  color: #e67e22;
}

.no-followers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.no-followers-image {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.comments-section {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.comment {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.comment:last-child {
  border-bottom: none;
}

.action-icon-click{
  cursor: pointer;
}
</style>

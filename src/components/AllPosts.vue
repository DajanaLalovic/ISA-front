<template>
  <div class="posts-list">
    <button @click="goBackToHome" class="return-button">Return </button>
    <div v-for="post in posts" :key="post.id" class="post-card">
      <div class="post-date">{{ formatDate(post.createdAt) }}</div>
      <div class="post-header">
        <img :src="post.imagePath" alt="Post image" class="post-image" />

        <!-- Prikazuje tri tačke samo ako je korisnik ulogovan -->
        <div v-if="isAuthen" class="menu-container">
          <span class="menu-icon" @click="toggleMenu(post.id)">⋮</span>
          <div v-if="menuOpen[post.id]" class="dropdown-menu">
            <span @click="openUpdateModal(post)">Update</span>
            <span @click="deletePost(post.id)">Delete</span>
            <span @click="hidePost(post.id)">Hide</span>
          </div>
        </div>
      </div>

      <div class="post-details">
        <div class="post-info">
          <div class="user-info">
            <h3>{{ users[post.userId] ? `${users[post.userId].name} ${users[post.userId].surname}` : "Unknown User" }}
            </h3>
            <span @click="goToProfile(post.userId)" class="action-icon">👤</span>
          </div>
          <p>{{ post.description }}</p>
          <div>
            <button v-if="isAdmin" @click="approveAd(post.id)" class="approve-button">
              Approve for Ad
            </button>
          </div>


        </div>
        <div class="post-actions">
          <span @click="likePost(post.id)" class="action-icon">👍 {{ post.likesCount }}</span>
          <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span>
        </div>
      </div>

      <!-- Display comments section if commentsVisible is true for this post -->
      <div v-if="commentsVisible[post.id]" class="comments-section">
        <p v-if="!post.comments || post.comments.length === 0">There are no comments.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'AllPosts',
  setup() {
    const router = useRouter();
    const posts = ref([]);
    const users = ref({});
    const menuOpen = ref({});
    const isAuthen = !!localStorage.getItem('authToken'); // Proveravamo da li je korisnik ulogovan
    const commentsVisible = ref({}); // Track visibility of comments per post
    //const userRole = localStorage.getItem('userRole'); // npr. "ADMIN"
    const userId = ref(null);
    const userRole = ref(null);
    const isAdmin = ref(false);

    onMounted(() => {
      fetchPosts();
      fetchUserRole();
    });

    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/posts/all');
        const processedPosts = await Promise.all(
          response.data
            .filter(post => !post.isRemoved)
            .map(async post => ({
              ...post,
              imagePath: `http://localhost:8080/images/${post.imagePath}`,
              likesCount: await fetchLikesCount(post.id)
            }))
        );

        posts.value = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        processedPosts.forEach(post => {
          fetchUser(post.userId);
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };


    const fetchUserRole = async () => {
      const storedUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');

      if (storedUserId && token) {
        userId.value = parseInt(storedUserId);
        try {
          const response = await axios.get(`http://localhost:8080/api/user/${userId.value}/role`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          userRole.value = response.data;
          isAdmin.value = userRole.value === 'ADMIN';
          console.log('Fetched user role:', userRole.value);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };


    const goBackToHome = () => {
      router.push('/');
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

    const fetchUser = async (userId) => {
      if (!users.value[userId]) {
        try {
          const response = await axios.get(`http://localhost:8080/api/getOneUser/${userId}`);
          users.value[userId] = response.data;
        } catch (error) {
          console.error(`Error with userId ${userId}:`, error);
        }
      }
    };

    const toggleMenu = (postId) => {
      menuOpen.value[postId] = !menuOpen.value[postId];
    };

    const viewComments = (postId) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert("You cannot leave comments, you are not logged in!");
        return;
      }
      commentsVisible.value[postId] = !commentsVisible.value[postId];
    };

    const goToProfile = (userId) => {
      router.push(`/profile/${userId}`);
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const likePost = async (postId) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert("You cannot like post, you are not logged in!");
        return;
      }

      try {
        const userId = parseInt(localStorage.getItem('userId'));
        const postIndex = posts.value.findIndex((post) => post.id === postId);

        if (postIndex !== -1) {
          const post = posts.value[postIndex];
          if (!post.likes) post.likes = [];
          if (post.likes.includes(userId)) {
            console.log("User has already liked this post.");
            return;
          }

          await axios.put(`http://localhost:8080/api/posts/like/${postId}`, null, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { userId }
          });

          post.likes.push(userId);
          post.likesCount += 1;
        }
      } catch (error) {
        console.error('Error liking post:', error);
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
          createdAt: post.createdAt
        },
      });
    };

    const deletePost = async (postId) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('User not authenticated');
        return;
      }

      try {
        const response = await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
          posts.value = posts.value.filter(post => post.id !== postId);
          alert('Post deleted successfully.');
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('You do not have permission to delete this post.');
        } else {
          console.error('Error deleting post:', error);
        }
      }
    };
    const approveAd = async (postId) => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert("You are not authenticated!");
          return;
        }

        await axios.post(`http://localhost:8080/api/posts/${postId}/approve-ad`, null, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        alert("Post approved for advertisement successfully!");
      } catch (error) {
        console.error("Error approving post:", error);
        alert("Failed to approve post for advertisement.");
      }
    };

    const hidePost = async (postId) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('User not authenticated');
        return;
      }

      try {
        const response = await axios.put(`http://localhost:8080/api/posts/deleteLogically/${postId}`, null, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
          const postIndex = posts.value.findIndex(post => post.id === postId);
          if (postIndex !== -1) posts.value.splice(postIndex, 1);
          alert('Post hidden successfully.');
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('You do not have permission to hide this post.');
        } else {
          console.error('Error hiding post:', error);
        }
      }
    };



    return {
      posts,
      users,
      menuOpen,
      likePost,
      openUpdateModal,
      toggleMenu,
      goBackToHome,
      deletePost,
      hidePost,
      fetchLikesCount,
      viewComments,
      goToProfile,
      formatDate,
      isAuthen,
      commentsVisible,
      approveAd,
      isAdmin
    };
  }


};
</script>

<style scoped>
.posts-list {
  background-size: cover;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.post-card {
  width: 600px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.menu-container {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 20px;
  color: #666;
  z-index: 2;
}

.menu-icon {
  font-size: 24px;
  color: #888;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 30px;
  right: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 5;
}

.dropdown-menu span {
  display: block;
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
}

.dropdown-menu span:hover {
  background-color: #f0f0f0;
}

.post-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding-top: 10px;
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

.action-icon {
  cursor: pointer;
  font-size: 18px;
  margin-left: 15px;
  color: #888;
}

.action-icon:hover {
  color: #007bff;
}

.return-button {
  margin-bottom: 20px;
}

.post-date {
  margin-left: 70%;
  margin-top: 3%;
  font-size: 14px;
  color: #666;
}
</style>

<template>
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-date">{{ formatDate(post.createdAt) }}</div>
        <img :src="post.imagePath" alt="Post image" class="post-image" />
  
        <div class="post-details">
          <div class="post-info">
            <div class="user-info">
              <h3>{{ users[post.userId] ? `${users[post.userId].name} ${users[post.userId].surname}` : "Unknown User" }}</h3>
            <span @click="goToProfile(post.userId)" class="action-icon">    👤 </span>
          </div>
            <p>{{ post.description }}</p>
          </div>
          <div class="post-actions">
            <span @click="likePost(post.id)" class="action-icon">👍 {{ post.likes?.length  || 0}}</span>
            <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span>
          </div>
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
      const posts = ref([]);
      const users = ref({});
      const router = useRouter();
      const fetchPosts = async () => {
        try {
          const response = await axios.get('http://localhost:8080/api/posts/all');
          posts.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          response.data.forEach(post => fetchUser(post.userId));
        } catch (error) {
          console.error('Error fetching posts:', error);
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
  
      const likePost = async (postId) => {
        const authToken = localStorage.getItem('authToken');
        console.log(authToken);
        if (!authToken) {
          alert("You cannot like post, you are not logged in!");
          return;
        }

        try {
          const userId = 1; 

          const response = await axios.put(`http://localhost:8080/api/posts/like/${postId}`, null, {
            params: {
              userId: userId
            }
          });

          const updatedPost = response.data;
          const postIndex = posts.value.findIndex((post) => post.id === postId);
          if (postIndex !== -1) {
            posts.value[postIndex] = updatedPost;
          }
          
          console.log(`Post with ID ${postId} liked by user ${userId}`);
        } catch (error) {
          console.error('Error liking post:', error);
        }
        //ne radi zbog cors-a,spojiti sa arijaninim
};

  
      const viewComments = (postId) => {
        console.log(`Viewing comments for post with ID: ${postId}`);
        const authToken = localStorage.getItem('authToken');
        console.log(authToken);
        if (!authToken) {
          alert("You cannot leave comments, you are not logged in!");
          return;
        }
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

  
      onMounted(() => {
        fetchPosts();
      });
  
      return {
        posts,
        users,
        likePost,
        viewComments,
        goToProfile,
        formatDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .posts-list {
    background-image: url('https://www.example.com/your-background-image.jpg'); /* Postavi URL svoje pozadine */
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
    align-items: center; 
  }
  
  .post-image {
    width: 100%;
    height: 250px;
    object-fit: contain; 
    margin: 10px 0;
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
  color: #666;
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
  
  .action-icon {
    cursor: pointer;
    font-size: 18px;
    margin-left: 15px;
    color: #888;
  }
  
  .action-icon:hover {
    color: #007bff;
  }
  </style>
  
<template>
    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <img :src="post.imagePath" alt="Post image" class="post-image" />
  
        <div class="post-details">
          <div class="post-info">
            <h3>{{ users[post.userId] ? `${users[post.userId].name} ${users[post.userId].surname}` : "Unknown User" }}</h3>
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
  
  export default {
    name: 'AllPosts',
    setup() {
      const posts = ref([]);
      const users = ref({});
      const fetchPosts = async () => {
        try {
          const response = await axios.get('http://localhost:8080/api/posts/all');
          posts.value = response.data;
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
  
      const likePost = (postId) => {
        console.log(`Liked post with ID: ${postId}`);
      };
  
      const viewComments = (postId) => {
        console.log(`Viewing comments for post with ID: ${postId}`);
      };
  
      onMounted(() => {
        fetchPosts();
      });
  
      return {
        posts,
        users,
        likePost,
        viewComments,
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
    width: 90%;
    height: 250px;
    object-fit: cover; /* Opcionalno, zadrži proporcije slike */
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
  
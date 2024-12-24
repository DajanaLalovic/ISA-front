<template>
  <div class="trends-container">
    <button @click="goBackToHome" class="return-button">Return</button>

    <div class="statistic">
      <h2>Total number of posts: {{ totalPosts }}</h2>
      <h2>Posts in the last 30 days: {{ postsLast30Days }}</h2>
    </div>

    <div class="posts-section">
      <div class="popular-posts1">
        <h2>Top 5 most liked posts in the last 7 days:</h2>
        <div v-for="(post, index) in top5Last7Days" :key="post.id" class="post-card2">
          <div class="post-number">🏆{{ index + 1 }}</div>
          <div class="post-date">{{ formatDate(post.createdAt) }}</div>
          <div class="post-header">
            <img :src="post.imagePath" alt="Post image" class="post-image" />
          </div>
          <div class="post-details">
            <div class="post-info">
              <p>{{ post.description }}</p>
            </div>
            <div class="post-actions">
              <span class="action-icon">👍 {{ post.likesCount }}</span>
              <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="popular-posts2">
        <h2>Top 10 most liked posts of all time:</h2>
        <div class="posts-list1">
          <div v-for="(post, index) in top10AllTime" :key="post.id" class="post-card1">
            <div class="post-number">🏆{{ index + 1 }}</div>
            <div class="post-date">{{ formatDate(post.createdAt) }}</div>
            <div class="post-header">
              <img :src="post.imagePath" alt="Post image" class="post-image" />
            </div>
            <div class="post-details">
              <div class="post-info">
                <p>{{ post.description }}</p>
              </div>
              <div class="post-actions">
                <span class="action-icon">👍 {{ post.likesCount }}</span>
                <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="top-users">
  <h2>Top Users with Most Likes:</h2>
  <div class="user-list">
    <div v-for="(user, index) in topUsers" :key="user.id" class="user-card1">
      <div class="user-rank">#{{ index + 1 }}</div>
      <h2>{{ user.name }} {{ user.surname }}</h2>
      <div class="user-info">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
    </div>
  </div>
</div>
  </div>
</template>
  
  <script>
  import axios from "axios";
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  
  export default {
    name: "TrendsList",
    setup() {
      const router = useRouter();
      const totalPosts = ref(0);
      const postsLast30Days = ref(0);
      const top5Last7Days = ref([]);
      const top10AllTime = ref([]);
      const topUsers = ref([]);
  
    //   const fetchTrends = async () => {
    //     try {
    //       // API endpoint for trends data
    //       const response = await axios.get('http://localhost:8080/api/trends'); 
  
    //       totalPosts.value = response.data.totalPosts;
    //       postsLast30Days.value = response.data.postsLast30Days;
    //       top5Last7Days.value = response.data.top5Last7Days;
    //       top10AllTime.value = response.data.top10AllTime;
    //     } catch (error) {
    //       console.error('Error fetching trends data:', error);
    //     }
    //   };
    const fetchTrends = async () => {
  try {
    // Dohvati token iz Local Storage
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Nedostaje token za autentifikaciju. Prijavi se ponovo.');
      return;
    }

    // API endpoint for trends data
    const response = await axios.get('http://localhost:8080/api/trends', {
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`, // Token za autentifikaciju
      }
    });

    totalPosts.value = response.data.totalPosts;
    postsLast30Days.value = response.data.postsLast30Days;
    const processedTop5 = await Promise.all(
      response.data.top5Last7Days.map(async post => ({
        ...post,
        imagePath: `http://localhost:8080/images/${post.imagePath}`,
        likesCount: await fetchLikesCount(post.id)
      }))
    );
    top5Last7Days.value = processedTop5;

    const processedTop10 = await Promise.all(
      response.data.top10AllTime.map(async post => ({
        ...post,
        imagePath: `http://localhost:8080/images/${post.imagePath}`,
        likesCount: await fetchLikesCount(post.id)
      }))
    );
    top10AllTime.value= processedTop10;


    ////

    // const userIds = await axios.get('http://localhost:8080/api/top-users');
    //     const users = await Promise.all(
    //       userIds.data.map(async userId => {
    //         const userResponse = await axios.get(`http://localhost:8080/api/getOneUser/${userId}`);
    //         return userResponse.data;
    //       })
    //     );
    //     topUsers.value = users;
    const userIds = await axios.get('http://localhost:8080/api/top-users', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // Token za autentifikaciju
  },
});
const users = await Promise.all(
  userIds.data.map(async userId => {
    const userResponse = await axios.get(`http://localhost:8080/api/getOneUser/${userId}`);
    return userResponse.data;
  })
);
topUsers.value = users;

    ///

    
  } catch (error) {
    console.error('Error fetching trends data:', error);
    alert('Failed to fetch trends data.');
  }
};




        const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
  
      const goBackToHome = () => {
        router.push('/');
      };
  
      onMounted(() => {
        fetchTrends();
      });
  
      return {
        totalPosts,
        postsLast30Days,
        top5Last7Days,
        top10AllTime,
        topUsers,
        goBackToHome,
        formatDate
      };
    },
  };
  </script>
  
  <!-- <style scoped>
  .trends-container {
    background-size: cover;
    padding: 20px;
    min-height: 100vh;
  }
  
  .statistic {
    margin-bottom: 20px;
  }
  
  .popular-posts1 {
    margin-top: 20px;
    width: 50%; /* Zauzima 50% širine ekrana */
    float: left; /* Pozicionira element skroz levo */
    margin-left: 0; /* Osigurava da nema dodatnog margina s leve strane */
    margin-right: 0; /* Neutralisanje desnog margina ako postoji */
}
.popular-posts2 {
    margin-top: 20px;
    width: 50%; /* Zauzima 50% širine ekrana */
    float: right; /* Pozicionira element skroz levo */
    margin-left: 0; /* Osigurava da nema dodatnog margina s leve strane */
    margin-right: 0; /* Neutralisanje desnog margina ako postoji */
}
  
 
.post-card {
  flex: 1 1 calc(70%); /* Kartica zauzima četvrtinu reda minus razmak */
  max-width: calc(70%); /* Osigurava da kartica ne pređe ovu širinu */
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.post-card1 {
  flex: 1 1 calc(40%); /* Kartica zauzima četvrtinu reda minus razmak */
  max-width: calc(40%); /* Osigurava da kartica ne pređe ovu širinu */
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.posts-list {
  display: flex;
  flex-wrap: wrap; /* Kartice prelaze u sledeći red kada nema dovoljno mesta */
  gap: 2px; /* Razmak između kartica */
}
  
.post-date {
  margin-left: 70%;
  margin-top: 2%;
  
  font-size: 14px;
  color: #666;
  }
  .return-button {
    margin-bottom: 20px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  .post-number{
    font-size: large;
  }

  .return-button:hover {
    background-color: #0056b3;
  }
  .post-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
  </style>
   -->
   
<style scoped>
.trends-container {
  background-color: #fff5e6;
  color: #2c3e50;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Roboto', sans-serif;
  background-size: cover;
  min-height: 100%;
}

.return-button {
  background-color: #ff9f43;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.return-button:hover {
  background-color: #e67e22;
}

.statistic {
  margin-bottom: 20px;
}

.posts-section {
  display: flex;
  justify-content: space-between;
}

.popular-posts1,
.popular-posts2 {
  width: 48%;
}

.posts-list1 {
  display: flex;
  flex-wrap: wrap;
  gap: 2%;
  justify-content: space-between;
}

.post-card1 {
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  overflow: hidden;
  width: 48%;
}
.post-card2 {
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  overflow: hidden;
  width: 90%;
}

.post-card2:hover,
.post-card1:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.post-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.top-users {
  margin-top: 40px;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.user-card1 {
  background-color: #fff5cc;
  border-radius: 15px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.user-card1:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.user-rank {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ff9f43;
  color: white;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom-right-radius: 15px;
}

.user-card1 h2 {
  font-size: 22px;
  margin: 10px 0;
  color: #2c3e50;
}

.user-card1 p {
  font-size: 16px;
  color: #555;
  margin: 5px 0;
}
</style>

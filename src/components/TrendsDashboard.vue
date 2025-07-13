<template>
  <div class="trends-container">

    <button @click="goBackToHome" class="return-button">Return</button>
  <div class="center-container">
  <p class="title">Trendings</p>
</div>

  
   
  
    <div class="statistic">
      
        <div class="stat-item">
          <div class="stat-label">Total number of posts</div>
          <div class="stat-value">{{ totalPosts }}</div>
        </div>
      <div class="stat-item">
        <div class="stat-label">Posts in the last 30 days</div>
        <div class="stat-value">{{ postsLast30Days }}</div>
      </div>
</div>


    <div class="posts-section">
      <div class="popular-posts1">
        <div class="title-item">
        <h2 class="title-label">Top 5 most liked posts in the last 7 days:</h2>
        </div>
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
        <div class="title-item">
        <h2 class="title-label">Top 10 most liked posts of all time:</h2>
        </div>
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
  import Swal from 'sweetalert2';

  export default {
    name: "TrendsList",
    setup() {
      const router = useRouter();
      const totalPosts = ref(0);
      const postsLast30Days = ref(0);
      const top5Last7Days = ref([]);
      const top10AllTime = ref([]);
      const topUsers = ref([]);
  

    const fetchTrends = async () => {
  try {
 
    const token = localStorage.getItem('authToken');
    if (!token) {
      Swal.fire({
  icon: 'error',
  title: 'Missing authentication token',
  text: 'Please log in again.',
  confirmButtonText: 'OK'
});
      return;
    }

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
        likesCount: await fetchLikesCount(post.id),
        comments: []

      }))
    );
    top5Last7Days.value = processedTop5;

    const processedTop10 = await Promise.all(
      response.data.top10AllTime.map(async post => ({
        ...post,
        imagePath: `http://localhost:8080/images/${post.imagePath}`,
        likesCount: await fetchLikesCount(post.id),
        comments: []
      }))
    );
    top10AllTime.value= processedTop10;


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
  align-self: center;
}

.statistic h2 {
  font-size: 22px;           /* povećaj font */
  font-weight: 700;          /* podebljaj */
  color: #f07726;            /* toplija boja za akcenat */
  margin-bottom: 10px;       /* malo prostora između linija */
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1); /* blaga senka za dubinu */
}
.statistic {
  display: flex;
  gap: 40px; /* razmak između stavki */
  justify-content: center;
  margin-bottom: 30px;
}

.stat-item {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(246, 211, 101, 0.4);
  text-align: center;
  min-width: 180px;
  color: white;
  font-family: 'Roboto', sans-serif;
  cursor: default;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(246, 211, 101, 0.7);
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.15);
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

.title-item {
  text-align: center;
  font-family: 'Roboto', sans-serif;
}

.title-label {
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 8px;
  opacity: 0.9;
  color:  #f07726;
  padding: 20px;
}

.center-container {
  margin-left:380px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #555;
  text-align: center;
}


.title-value {
  font-size: 40px;
  font-weight: 900;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);

  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.title-value:hover {
  transform: scale(1.1);
}

</style>

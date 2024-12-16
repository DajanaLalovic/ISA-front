<template>
    
    
      <button @click="goBackToHome" class="return-button">Return</button>
  <div class="trends-container">
      <div class="statistic">
        <h2>Total number of posts: {{ totalPosts }}</h2>
        <h2>Posts in the last 30 days: {{ postsLast30Days }}</h2>
      </div>
  
      <div class="popular-posts1">
        <h2>Top 5 most liked posts in the last 7 days:</h2>
       
        <div v-for="(post, index) in top5Last7Days" :key="post.id" class="post-card">
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
          <span  class="action-icon">👍  {{ post.likesCount }}</span>
           <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span> 
        </div>
      </div>
        </div>
  
      </div>
  
      <div class="popular-posts2">
        <h2>Top 10 most liked posts of all time:</h2>
        <div class="posts-list">
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
              <span  class="action-icon">👍  {{ post.likesCount }}</span>
               <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span> 
            </div>
          </div>
            </div>
        </div>
      </div>



      <div class="top-users">
      <h2>Top Users with Most Likes:</h2>
      <ul>
        <li v-for="(user, index) in topUsers" :key="user.id">
      {{ index + 1 }}. 
      <div class="user-card">
        <h2>{{ user.name }} {{ user.surname }}</h2>
        <div class="user-info">
         
            <p><strong>Username:</strong> <span>{{ user.username }}</span></p>
            <p><strong>Email:</strong> <span>{{ user.email }}</span></p>
          
        </div>
      </div> 
    </li>
      </ul>
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
   
.container{
    background-color: #fff5e6;  
    border-radius: 15px; 
}

.trends-container {
  background-color: #fff5e6; /* Svetlo narandžasta pozadina */
  color: #2c3e50; /* Tamno sivi tekst */
  padding: 20px;
  border-radius: 15px; /* Zaobljene ivice */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Blaga senka */
  font-family: 'Roboto', sans-serif;
  background-size: cover;
  min-height: 100%
}

.return-button {
  background-color: #ff9f43; /* Narandžasta boja */
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
  background-color: #e67e22; /* Tamnija narandžasta */
}

.statistic {
  margin-bottom: 20px;
}


.statistic h2 {
  color: #e67e22; /* Tamno narandžasta */
  margin-bottom: 15px;

}
h2 {
  color: #e67e22; /* Tamno narandžasta */
  margin-bottom: 15px;
margin-right: 30%;
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
  float: right; /* Pozicionira element skroz desno */
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
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: scale(1.02); /* Blago povećanje na hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
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

.post-number {
 background-color: #fff5e6;
  color: #c36a26;
  font-size: large;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  /*position: absolute;*/
  top: 10px;
  left: 10px;
 /* z-index: 2; /* Uvek prikazano iznad slike i drugih elemenata */
}

.post-details {
  padding: 15px;
}

.post-actions .action-icon {
  color: #e67e22;
  margin-right: 10px;
  cursor: pointer;
  font-size: 16px;
}

.post-actions .action-icon:hover {
  color: #ff9f43;
}

.post-date {
  margin-left: 70%;
  margin-top: 2%;
  font-size: 14px;
  color: #2c3e50;
  font-style: italic;
  margin-bottom: 10px;
}

.post-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.user-card {
  background-color: #fffae5;  /* Light yellow background */
  border-radius: 15px;  /* Rounded corners */
  padding: 20px;
  width: 90%;  /* Card width is 90% of the parent container */
  margin: 10px auto;  /* Center the card horizontally */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);  /* Shadow for better visibility */
  text-align: center;  /* Center the text inside */
}

.user-card h2 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;  /* Dark text for the name */
}

.user-card p {
  font-size: 18px;  /* Increased font size for other text */
  color: #555;  /* Slightly lighter color for text */
}

.user-card .user-info {
  display: flex;
  justify-content: space-between;  /* Align text to the left and right */
  align-items: center;
}


</style>

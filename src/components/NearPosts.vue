<template>
    <div class="posts-list">
      <!-- Dugme za povratak na početnu stranicu -->
      <button class="return-button" @click="goBackToHome">Return to Home</button>
      <h1>🌍your feed of bunspiration    </h1>
      <div v-if="posts.length === 0" class="no-posts">
        <p>🚫No nearby posts available. Please try again later!🕒</p>
      </div>
      <div v-else>
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-date">{{ formatDate(post.createdAt) }}</div>
          <div class="post-header">
            <img :src="post.imagePath" alt="Post image" class="post-image" />
          </div>
  
          <div class="post-details">
            <div class="user-info">
              <h3>{{ users[post.userId] ? `${users[post.userId].name} ${users[post.userId].surname}` : "Unknown User" }}</h3>
              <span @click="goToProfile(post.userId)" class="action-icon">👤</span>
            </div>
            <p>{{ post.description }}</p>
            <div class="post-actions">
              <span @click="likePost(post.id)" class="action-icon">👍 {{ post.likesCount }}</span>
              <span @click="viewComments(post.id)" class="action-icon">💬 {{ post.comments?.length || 0 }}</span>
            </div>
          </div>
  
          <div v-if="commentsVisible[post.id]" class="comments-section">
            <p v-if="!post.comments || post.comments.length === 0">No comments yet.</p>
            <p v-else v-for="comment in post.comments" :key="comment.id" class="comment">{{ comment.text }}</p>

           <!-- Forma za dodavanje komentara -->
            <div class="add-comment">
              <input  v-model="newComments[post.id]" type="text" placeholder="Add a comment..." class="comment-input"/>
              <button @click="addComment(post.id)">Post Comment</button>
           </div>
        </div>

        </div>
      </div>
    </div>
  </template>
  
  
  
  <script>
  import axios from "axios";
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router';

  
  export default {
    name: "NearPosts",
    setup() {
      const router = useRouter();
      const posts = ref([]);
      const users = ref({});
      const commentsVisible = ref({});
      const newComments = ref({});


      
    const addComment = async (postId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You need to be logged in to comment!");
      return;
    }

    const commentText = newComments.value[postId];
    if (!commentText || commentText.trim() === "") {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/comments",
        { text: commentText, postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Ažurirajte listu komentara za post
      const postIndex = posts.value.findIndex((post) => post.id === postId);
      if (postIndex !== -1) {
        posts.value[postIndex].comments.push(response.data);
      }

      // Očistite unos komentara
      newComments.value[postId] = "";
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };
  
    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get("http://localhost:8080/api/posts/followed", {
            headers: { Authorization: `Bearer ${token}` },
            });
            console.log("API response data:", response.data);
            const processedPosts = await Promise.all(
            response.data.map(async (post) => ({
                ...post,
                comments: post.comments || [],
                imagePath: `http://localhost:8080/images/${post.imagePath}`,
                likesCount: await fetchLikesCount(post.id), // Dobavljanje broja lajkova
            }))
            );

            posts.value = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            posts.value.forEach((post) => fetchUser(post.userId));
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
        };

  
      const fetchUser = async (userId) => {
        if (!users.value[userId]) {
          try {
            const response = await axios.get(`http://localhost:8080/api/getOneUser/${userId}`);
            users.value[userId] = response.data;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
      };
  
      const likePost = async (postId) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("You cannot like post, you are not logged in!");
            return;
        }

        try {
            const userId = parseInt(localStorage.getItem("userId"));
            const postIndex = posts.value.findIndex((post) => post.id === postId);

            if (postIndex !== -1) {
            const post = posts.value[postIndex];
            if (!post.likes) post.likes = [];
            if (post.likes.includes(userId)) {
                alert("You have already liked this post.");
                return;
            }

            await axios.put(`http://localhost:8080/api/posts/like/${postId}`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId },
            });

            post.likes.push(userId);
            post.likesCount += 1;
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
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

  
      const viewComments = (postId) => {
        commentsVisible.value[postId] = !commentsVisible.value[postId];
      };
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
      };
  

      const goToProfile = (userId) => {
        router.push({ path: `/profile/${userId}` });
        };

      onMounted(() => {
        fetchPosts();
      });
      const goBackToHome = () => {
        router.push("/");
        };

  
      return {
        posts,
        users,
        commentsVisible,
        newComments,
        likePost,
        viewComments,
        addComment,
        formatDate,
        goToProfile,
        goBackToHome
      };
    },
  };
  </script>
  
  <style scoped>
  .posts-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff8e1; /* Svetlija krem boja */
}

.post-card {
  width: 600px;
  border: 1px solid #ffb347; /* Svetlija narandžasta */
  border-radius: 15px; /* Zaobljeni uglovi */
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* Suptilnija senka */
  transition: transform 0.2s ease; /* Efekat pri hoveru */
}

.post-card:hover {
  transform: translateY(-5px); /* Podizanje pri hoveru */
}

.post-date {
  font-size: 14px;
  color: #888; /* Neutralnija siva boja */
  text-align: right;
  margin: 5px 10px;
}

.post-header img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-top-left-radius: 15px; /* Zaobljeni gornji uglovi */
  border-top-right-radius: 15px;
}

.post-details {
  padding: 20px; /* Veći razmak unutar sekcije */
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-info h3 {
  margin: 0;
  font-size: 18px;
  color: #ffb347; /* Svetlija narandžasta */
  font-weight: bold;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.action-icon {
  cursor: pointer;
  font-size: 18px;
  color: #ffb347;
  transition: color 0.3s ease, transform 0.2s ease; /* Efekti prelaza */
}

.action-icon:hover {
  color: #ffa64d; /* Još svetlija narandžasta */
  transform: scale(1.2); /* Blago povećanje pri hoveru */
}

.comments-section {
  padding: 15px;
  background-color: #fffaf0; /* Svetlija krem boja */
  border-top: 1px solid #ffe4b5; /* Blaga ivica */
  border-radius: 0 0 15px 15px; /* Zaobljeni donji uglovi */
}

.comment {
  font-size: 14px;
  color: #444;
  margin-bottom: 8px;
}

.no-posts {
  text-align: center;
  padding: 30px;
  background-color: #fffaf0; /* Svetlija krem boja */
  border: 2px dashed #ffb347; /* Svetlija narandžasta ivica */
  border-radius: 10px;
  margin: 20px;
}

.no-posts p {
  font-size: 18px;
  color: #ffb347;
  font-weight: bold;
}
.return-button {
  display: inline-block;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #f5deb3; /* Svetlija narandžasta */
  color: #333;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.return-button:hover {
  background-color: #e6c79c; /* Svetliji hover efekat */
}
.add-comment {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.comment-input {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ffb347;
  border-radius: 5px;
  margin-right: 10px;
}

.add-comment button {
  background-color: #ffb347;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.add-comment button:hover {
  background-color: #ffa64d;
}

  </style>
  
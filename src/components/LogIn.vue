<template>
  <div class="global">
  <img src="@/style/LOGIN.png" alt="Bunny Image" class="bunny-image" />
    <div class="content">
      <div class="login-card">
        <h2>{{ title }}</h2>
        <p v-if="notification" :class="notification.msgType">{{ notification.msgBody }}</p>
        <form @submit.prevent="onSubmit" v-if="!submitted">
          <label>
            Username:
            <input
              type="text"
              v-model="form.username"
              required
              :class="{ 'input-error': form.username.length < 3 || form.username.length > 64 }"
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              v-model="form.password"
              required
              :class="{ 'input-error': form.password.length < 3 || form.password.length > 32 }"
            />
          </label>
          <button :disabled="!isFormValid" type="submit">Login</button>
        </form>
        <div v-if="submitted" class="loading">Loading...</div>
  
        <!-- Link to Sign Up page -->
        <p class="signup-link">
          You don't have an account yet? <router-link to="/signup">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
  </template>
  
  <script>
  import { ref, computed ,onMounted} from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';


  export default {
    name: 'LogIn',
    setup() {
      const router = useRouter();
      const title = 'Login';
      const submitted = ref(false);
      const notification = ref(null);
      const form = ref({
        username: '',
        password: '',
      });
      const userId = ref(null);
      onMounted(() => {
         // Ovde resetujemo samo kada se učita Login stranica
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  console.log('LocalStorage resetovan na Login stranici');


      if (localStorage.getItem('isLoggedIn') === 'true') {
        router.push('/'); // Preusmeravanje ako je korisnik već prijavljen
      }
    });

  
      const isFormValid = computed(() => {
        return (
          form.value.username &&
          form.value.password &&
          form.value.username.length >= 3 &&
          form.value.username.length <= 64 &&
          form.value.password.length >= 3 &&
          form.value.password.length <= 32
        );
      });

      const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Učitaj token iz localStorage
        if (!token) {
          console.error('JWT token nije pronađen');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/user-whoami', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const user = response.data;
        if (user) {
          userId.value = user.id;
          localStorage.setItem('userId', userId.value);
          console.log('User ID saved to localStorage:', userId.value);
          return user;
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    const onSubmit = async () => {
    notification.value = null;
    submitted.value = true;
    try {
        const response = await axios.post('http://localhost:8080/auth/login', form.value);
        console.log("Odgovor servera:", response.data); // Dodaj ovu liniju za ispis odgovora
        const token = response.data.accessToken; // Proveri da li je ključ tačan
        if (!token) {
        console.error("Token nije pronađen u odgovoru!");
          return;
        }
        // Sačuvaj token u localStorage
        localStorage.setItem('authToken', token);
        console.log("Token uspešno sačuvan:", token);
        localStorage.setItem('isLoggedIn', 'true'); 
        console.log(localStorage.getItem('isLoggedIn'));
        await fetchCurrentUser();
    
        router.push('/');
    } catch (error) {
        submitted.value = false;
        console.error("Greška pri prijavi:", error);

        if (error.response?.status === 429) {
      notification.value = {
        msgType: 'error',
        msgBody: 'Too many login attempts. Please try again later.',
      };
      return;
    }


        const errorMessage = error.response?.data || 'Login error';
        notification.value = {
            msgType: 'error',

            msgBody: errorMessage === 'Your account isn\'t activated yet. Check your mail.' 
                      ? errorMessage 
                      : 'Login failed. Please check your credentials.',
        };
    }     
       
      };
     
      return {
        title,
        submitted,
        notification,
        form,
        isFormValid,
        onSubmit,
      };
    },
  };
  </script>
  
  <style scoped>
  .global{
    height: 100vh;
    position: relative;
    background:#F0E7D0;
  }

  .content {
    position: absolute;
    top:100px;
    left: 600px;
    max-width: 400px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
.notification.error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
  .login-card h2 {
    margin-bottom: 20px;
    text-align: center;
  }
  
  label {
    display: block;
    margin-bottom: 15px;
  }
  
  label input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .bunny-image {
    position: absolute;
    top: 100px;
    left: 40px;
    width: 400px;
    height: 550px;
    z-index: 1;
  }

  
  button {
    padding: 10px 20px;
    margin-right: 10px;
    background-color: #ff9f43;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: #ff9f43 0.3s ease;
  }
  button:hover{
    background-color: #f19c4d;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .input-error {
    border-color: red;
  }
  
  .loading {
    text-align: center;
    font-size: 16px;
    color: #888;
  }
  
  .signup-link {
    margin-top: 20px;
    text-align: center;
  }
  
  .signup-link a {
    color: #007bff;
    text-decoration: none;
  }
  
  .signup-link a:hover {
    text-decoration: underline;
  }
  </style>
  
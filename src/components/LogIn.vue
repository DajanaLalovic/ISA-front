<template>
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
  </template>
  
  <script>
  import { ref, computed } from 'vue';
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
  
     /* const onSubmit = async () => {
        notification.value = null;
        submitted.value = true;
        try {
          await axios.post('http://localhost:8080/auth/login', form.value);
          router.push('/'); // Preusmeri na stranicu nakon uspešnog logovanja
        } catch (error) {
          submitted.value = false;
          notification.value = {
            msgType: 'error',
            msgBody: error.response?.data?.message || 'Login error',
          };
        }
      };*/
      const onSubmit = async () => {
  notification.value = null;
  submitted.value = true;
  try {
    await axios.post('http://localhost:8080/auth/login', form.value);
    
    router.push('/'); // Preusmeri na stranicu nakon uspešnog logovanja
  } catch (error) {
    submitted.value = false;
    // Ako je status greške 403, prikazuje poruku o aktivaciji naloga
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
  .content {
    max-width: 400px;
    margin: 0 auto;
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
  
  button {
    padding: 10px 20px;
    margin-right: 10px;
    cursor: pointer;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
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
  
<template>
    <div class="content">
      <div class="signup-card">
        <h2>{{ title }}</h2>
        <p v-if="notification" :class="notification.msgType">{{ notification.msgBody }}</p>
        <form @submit.prevent="onSubmit" v-if="!submitted">
          <label>
            Username:
            <input
              type="text"
              v-model="form.username"
              required
              :class="{ 'input-error': form.username.length < 3 || form.username.length > 64 }" placeholder="Enter username"
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              v-model="form.password"
              required
              :class="{ 'input-error': form.password.length < 3 || form.password.length > 32 }" placeholder="Enter password"
            />
          </label>
          <label>
            Confirm Password:
            <input
              type="password"
              v-model="form.confirmPassword"
              required
              :class="{ 'input-error': form.confirmPassword !== form.password }" placeholder="Enter password again"
            />
            <span v-if="form.confirmPassword && form.confirmPassword !== form.password" class="error-message">
              Passwords do not match
            </span>
          </label>
          <label>
            First Name:
            <input type="text" v-model="form.name" placeholder="Enter name"/>
          </label>
          <label>
            Last Name:
            <input type="text" v-model="form.surname" placeholder="Enter surname"/>
          </label>
          <label>
            Email:
            <input type="email" v-model="form.email" placeholder="Enter email"/>
          </label>




          <div class="address-fields">
          <label>
            Street:
            <input type="text" v-model="form.street" placeholder="Enter street" />
          </label>
          <label>
            Number:
            <input type="text" v-model="form.number" placeholder="Enter number" />
          </label>
        </div>
        <div class="address-fields">
          <label>
            City:
            <input type="text" v-model="form.city" placeholder="Enter city" />
          </label>
          <label>
            Postal Code:
            <input type="text" v-model="form.postalCode" placeholder="Enter postal code" />
          </label>
        </div>
        <label>
          Country:
          <input type="text" v-model="form.country" placeholder="Enter country" />
        </label>

          <button :disabled="!isFormValid" type="submit">Sign up</button>
          <button type="button" @click="goBack">Go Back</button>
        </form>
        <div v-if="submitted" class="loading">Loading...</div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed ,onMounted} from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  export default {
    name: 'SignUp',
    setup() {
      const router = useRouter();
      const title = 'Sign up';
      const submitted = ref(false);
      const notification = ref(null);
      const form = ref({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        surname: '',
        email: '',        
      });
      onMounted(() => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        router.push('/'); // Preusmeravanje ako je korisnik već prijavljen
      }
    });

  
      const isFormValid = computed(() => {
        return (
          form.value.username &&
          form.value.password &&
          form.value.confirmPassword === form.value.password &&
          form.value.username.length >= 3 &&
          form.value.username.length <= 64 &&
          form.value.password.length >= 3 &&
          form.value.password.length <= 32
        );
      });
  
      const onSubmit = async () => {
        notification.value = null;
        submitted.value = true;
        try {
            await axios.post('http://localhost:8080/auth/signup', form.value);
         //   await axios.post('http://localhost:8080/auth/login', form.value);
          router.push('/login');
        } catch (error) {
          submitted.value = false;
          notification.value = {
            msgType: 'error',
            msgBody: error.response?.data?.message || 'Sign up error',
          };
        }
      };
  
      const goBack = () => {
        router.push('/');
      };
  
      return {
        title,
        submitted,
        notification,
        form,
        isFormValid,
        onSubmit,
        goBack,
      };
    },
  };
  </script>

 <style src="@/style/SignUp.css"></style>
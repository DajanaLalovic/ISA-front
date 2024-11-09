<template>
    <div class="activation">
      <h2>Account Activation</h2>
      <p v-if="activationStatus">{{ activationStatus }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  import { ref,onMounted } from 'vue';
  
  export default {
    name: 'ActivateAccount',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const activationStatus = ref('');
  
      const activateAccount = async () => {
        const token = route.query.token; // Dobavljanje tokena iz URL-a
        console.log(token);


    // Logujte sve parametre da proverite šta se dobija
    console.log('Route params:', route.params);
    console.log('Route query:', route.query);  // Ovo će prikazati sve query parametre


        try {
         const response = await axios.get(`http://localhost:8080/auth/activate?token=${token}`);
        // const response = await axios.post('http://localhost:8080/auth/activate', { token });
      
          activationStatus.value = response.data || 'Your account has been activated successfully!';
          setTimeout(() => {
          router.push('/login');
        }, 1000); // 10000ms = 10 sekundi
        } catch (error) {
          activationStatus.value = error.response?.data || 'Invalid activation token';
        }
      };
  
      // Pozovite aktivaciju čim se komponenta učita
      onMounted(activateAccount);
      console.log('daja');
      return { activationStatus };
    },
  };
  </script>
  
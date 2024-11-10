<template>
    <div v-if="user" class="profile-container">
      <h1>Profil korisnika</h1>
      <div class="profile-info">
        <p><strong>Ime:</strong> {{ user.name }}</p> <!-- Promenjeno iz firstName -->
        <p><strong>Prezime:</strong> {{ user.surname }}</p> <!-- Promenjeno iz lastName -->
        <p><strong>Korisničko ime:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Uloga:</strong> {{ user.role }}</p> <!-- Pretpostavljam da koristiš UserRole kao Enum -->
        <p><strong>Aktivan:</strong> {{ user.active ? 'Da' : 'Ne' }}</p> <!-- Prikazivanje aktivnog statusa -->
      </div>
    </div>
    <div v-else>
      <p>Učitavanje podataka o korisniku...</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'ProfileView',
    setup() {
      const user = ref(null);
      const route = useRoute();
      const userId = route.params.userId; // Preuzimanje userId iz URL-a
  
      // Funkcija za učitavanje korisnika sa servera
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/profile/${userId}`, {
           /* headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}` // Dodaj token ako je potrebno za autentifikaciju
            }*/
          });
          user.value = response.data;
        } catch (error) {
          console.error('Greška prilikom učitavanja profila: ', error);
        }
      };
  
      // Poziva fetchUserProfile kada komponenta bude montirana
      onMounted(() => {
        fetchUserProfile();
      });
  
      return {
        user
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    margin: 20px;
    font-family: Arial, sans-serif;
  }
  
  .profile-info {
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .profile-info p {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .profile-info strong {
    font-weight: bold;
  }
  </style>
  
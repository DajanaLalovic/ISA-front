<template>
  <div class="content">
    <div class="post-card">
      <h2>{{ isUpdating ? 'Update Post' : 'Add New Post' }}</h2>
      <form @submit.prevent="onSubmitPost" v-if="!submitted">
        <label>
          Description:
          <textarea
            v-model="form.description"
            required
            placeholder="Write something about your post"
          ></textarea>
        </label>
        <label>
          <div v-if="isUpdating && form.imagePath">
            <p>Current image:</p>
            <img :src="form.imagePath" alt="Current image" class="current-image" />
          </div>
          Choose new photo:
          <input
            type="file"
            @change="onFileChange"
            accept="image/*"
            :required="!isUpdating"
          />
        </label>

        <label>
          Latitude:
          <input
            type="number"
            step="0.000001"
            v-model="form.latitude"
            required
            placeholder="Latitude"
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            step="0.000001"
            v-model="form.longitude"
            required
            placeholder="Longitude"
          />
        </label>
        <button :disabled="!isFormValid" type="submit">{{ isUpdating ? 'Update' : 'Add' }} Post</button>
      </form>
      <div v-if="submitted" class="loading">Loading...</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'AddPost',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    const submitted = ref(false);
    const isUpdating = ref(false);
    const form = ref({
      id: null, // Dodato samo za azuriranje
      description: '',
      latitude: '',
      longitude: '',
      imageBase64: '', 
      imagePath: '', // URL  isto za azuriranje

    });

    onMounted(() => {
      if (route.query.id) {
        isUpdating.value = true;
        form.value.id = route.query.id;
        form.value.description = route.query.description || '';
        form.value.latitude = route.query.latitude || '';
        form.value.longitude = route.query.longitude || '';
        form.value.imageBase64 = route.query.imageBase64 || ''; 
        form.value.createdAt = route.query.createdAt || ''; 
        form.value.imagePath = route.query.imagePath || ''; 

      }
    });

    const isFormValid = computed(() => {
      return (
        form.value.description &&
        (form.value.imageBase64 || isUpdating.value) && 
        form.value.latitude &&
        form.value.longitude
      );
    });

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          form.value.imageBase64 = reader.result.split(',')[1]; 
        };
        reader.readAsDataURL(file);
      }
    };

    const onSubmitPost = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Nedostaje token za autentifikaciju. Prijavi se ponovo.');
        return;
      }

      console.log('Token:', token); // Proverite token
      console.log('Form data:', form.value); // Pratite podatke koji se šalju

      const url = 'http://localhost:8080/api/posts'; // bez ID u putanji, jer se ceo objekat šalje u telu zahteva
      const method = isUpdating.value ? 'put' : 'post';

      try {
        await axios({
          method,
          url,
          data: form.value, 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });
        alert(isUpdating.value ? 'Post uspešno ažuriran!' : 'Post uspešno dodat!');
        //await fetchPosts();
        router.push('/allPosts');
      } catch (error) {
        console.error('Greška pri dodavanju/ažuriranju posta:', error.response?.status, error.response?.data);
        if (error.response && error.response.status === 401) {
          alert('Autentifikacija nije uspela. Prijavi se ponovo.');
          router.push('/login');
        } else {
          alert('Došlo je do greške.');
        }
      }
    };


    return {
      submitted,
      form,
      isFormValid,
      onFileChange,
      onSubmitPost,
      isUpdating
    };
  },
};
</script>
<style>
.current-image {
  width: 150px; 
  height: auto; 
  border-radius: 8px; 
  margin-bottom: 10px; 
}

</style>

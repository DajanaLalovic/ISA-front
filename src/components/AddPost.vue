<template>
  <div class="content">
    <div class="post-card">
      <h2>Add new post</h2>
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
          Choose photo:
          <input
            type="file"
            @change="onFileChange"
            accept="image/*"
            required
          />
        </label>
        <label>
        Latitude:
          <input
            type="number" step="0.000001"
            v-model="form.latitude"
            required
            placeholder="Latitude"
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            v-model="form.longitude" step="0.000001"
            required
            placeholder="Longitude"
          />
        </label>
        <button :disabled="!isFormValid" type="submit">Add post</button>
      </form>
      <div v-if="submitted" class="loading">Loading...</div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import {useRouter } from 'vue-router';

export default {
  name: 'AddPost',
  setup() {
    const submitted = ref(false);
    const router = useRouter();
    const form = ref({
      description: '',
      latitude: '',
      longitude: '',
      imageBase64: '', 
    });

    const isFormValid = computed(() => {
      return (
        form.value.description &&
        form.value.imageBase64 && 
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
      console.log('Token:', token);
      try {
        await axios.post('http://localhost:8080/api/posts', form.value, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        alert('Post uspešno dodat!');
        router.push('/allPosts');
        submitted.value = false;
      } catch (error) {
        console.error('Greška pri dodavanju posta:', error);
        console.log(error.response);
        alert('Došlo je do greške prilikom dodavanja posta.');
        submitted.value = false;
      }
    };

    return {
      submitted,
      form,
      isFormValid,
      onFileChange,
      onSubmitPost,
    };
  },
};
</script>

  
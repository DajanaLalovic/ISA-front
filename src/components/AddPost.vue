<template>
  <div class="content">
    <div class="post-card">
      <h2>Dodaj novi post</h2>
      <form @submit.prevent="onSubmitPost" v-if="!submitted">
        <label>
          Opis objave:
          <textarea
            v-model="form.description"
            required
            placeholder="Unesite opis"
          ></textarea>
        </label>
        <label>
          Izaberite sliku sa računara:
          <input
            type="file"
            @change="onFileChange"
            accept="image/*"
            required
          />
        </label>
        <label>
          Geografska širina:
          <input
            type="number" step="0.000001"
            v-model="form.latitude"
            required
            placeholder="Unesite geografsku širinu"
          />
        </label>
        <label>
          Geografska dužina:
          <input
            type="number"
            v-model="form.longitude" step="0.000001"
            required
            placeholder="Unesite geografsku dužinu"
          />
        </label>
        <button :disabled="!isFormValid" type="submit">Dodaj post</button>
      </form>
      <div v-if="submitted" class="loading">Dodavanje u toku...</div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'AddPost',
  setup() {
    const submitted = ref(false);
    const form = ref({
      description: '',
      latitude: '',
      longitude: '',
      imageBase64: '', // Skladištenje slike u Base64 formatu
    });

    const isFormValid = computed(() => {
      return (
        form.value.description &&
        form.value.imageBase64 && // Proveri da li postoji slika u Base64 formatu
        form.value.latitude &&
        form.value.longitude
      );
    });

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          form.value.imageBase64 = reader.result.split(',')[1]; // Ukloni prefiks i sačuvaj Base64 podatke
        };
        reader.readAsDataURL(file);
      }
    };

    const onSubmitPost = async () => {
      const token = localStorage.getItem('authToken'); // Učitaj token iz localStorage
      console.log('Token:', token);
      try {
        await axios.post('http://localhost:8080/api/posts', form.value, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        alert('Post uspešno dodat!');
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

  
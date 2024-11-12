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
        <div id="map" class="map"></div>
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
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { toLonLat,fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';

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
    let map = null;
    onMounted(() => {
      initializeMap();
      if (route.query.id) {
        isUpdating.value = true;
        form.value.id = route.query.id;
        form.value.description = route.query.description || '';
        form.value.latitude = route.query.latitude || '';
        form.value.longitude = route.query.longitude || '';
        form.value.imageBase64 = route.query.imageBase64 || ''; 
        form.value.createdAt = route.query.createdAt || ''; 
        form.value.imagePath = route.query.imagePath || ''; 
        if (form.value.latitude && form.value.longitude) {
        map.getView().setCenter(fromLonLat([form.value.longitude, form.value.latitude]));
        map.getView().setZoom(15); // Podesi nivo zumiranja po želji
    }
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

        submitted.value = false;
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
    function initializeMap() {
      map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([19.8335, 45.2671]), 
          zoom: 12
        }),
        controls: defaultControls({ 
        
        attribution: false 
    })
      });

      map.on('click', (event) => {
        const coordinate = toLonLat(event.coordinate);
        form.value.latitude = coordinate[1].toFixed(6);
        form.value.longitude = coordinate[0].toFixed(6);
        console.log(`Latitude: ${form.value.latitude}, Longitude: ${form.value.longitude}`);
      });
    }

    return {
      submitted,
      form,
      isFormValid,
      onFileChange,
      onSubmitPost,
      isUpdating, 
      initializeMap
    };
  },
};
</script>
<style scoped>
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
}

.post-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

form label {
  display: block;
  margin-bottom: 15px;
  font-weight: bold;
  color: #555;
}

form textarea,
form input[type="file"],
form input[type="number"] {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
}

form textarea {
  resize: vertical;
  min-height: 100px;
}

form button {
  background-color: #007bff;
  color: #fff;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 16px;
  width: 100%;
}

form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

form button:hover:not(:disabled) {
  background-color: #0056b3;
}

.loading {
  font-size: 18px;
  text-align: center;
  color: #333;
  margin-top: 20px;
}

.map {
  width: 100%;
  height: 400px;
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.current-image {
  display: block;
  margin: 10px auto;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>


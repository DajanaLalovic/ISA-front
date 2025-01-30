<template>
  <div class="form-container">
    <!-- Leva strana sa slikom -->
    <div class="image-section">
      <img src="@/assets/mrkvice.jpg" alt="Post Image" class="post-image" />
    </div>

    <!-- Desna strana sa formom -->
    <div class="form-section">
      <h1>{{ isUpdating ? 'Update Post' : 'Add New Bunny Post' }}</h1>
      <form @submit.prevent="onSubmitPost" v-if="!submitted">
        <label>
          Description:
          <textarea v-model="form.description" required placeholder="Write something about your post"></textarea>
        </label>

        <label class="upload-label">
          Upload a photo:
          <div class="upload-container">
            <input type="file" id="file-input" @change="onFileChange" accept="image/*" hidden />
            <label for="file-input" class="upload-icon">📷 Choose File</label>
          </div>
        </label>

        <!-- Mapa za odabir lokacije -->
        <div id="map" class="map"></div>

        <label>
          Latitude:
          <input type="number" step="0.000001" v-model="form.location.latitude" required placeholder="Latitude" />
        </label>
        <label>
          Longitude:
          <input type="number" step="0.000001" v-model="form.location.longitude" required placeholder="Longitude" />
        </label>

        <div class="button-group">
          <button type="button" class="back-button" @click="goBack">Back</button>
          <button :disabled="!isFormValid" type="submit" class="next-button">{{ isUpdating ? 'Update' : 'Add' }} Post</button>
        </div>
      </form>
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
      location: { latitude: '', longitude: '' },
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
        form.value.location = {
        latitude: route.query.location?.latitude || '',
        longitude: route.query.location?.longitude || ''
        };
        form.value.imageBase64 = route.query.imageBase64 || ''; 
        form.value.createdAt = route.query.createdAt || ''; 
        form.value.imagePath = route.query.imagePath || ''; 
        if (form.value.location.latitude && form.value.location.longitude) {
        map.getView().setCenter(fromLonLat([form.value.location.longitude, form.value.location.latitude]));
        map.getView().setZoom(15); // Podesi nivo zumiranja po želji
    }

   
      }
    });

   

    const isFormValid = computed(() => {
      return (
        form.value.description &&
        (form.value.imageBase64 || isUpdating.value) && 
        form.value.location.latitude &&
        form.value.location.longitude
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
        form.value.location.latitude = coordinate[1].toFixed(6);
        form.value.location.longitude = coordinate[0].toFixed(6);
        console.log(`Latitude: ${form.value.location.latitude}, Longitude: ${form.value.location.longitude}`);
      });
    }
    const goBack = () => {
  router.push('/'); // Promeni rutu ako treba
};

    return {
      submitted,
      form,
      isFormValid,
      onFileChange,
      onSubmitPost,
      isUpdating, 
      initializeMap,
      goBack
    };
  },
};
</script>
<style scoped>


.form-container {
  display: flex;
  width: 70vw; /* Smanjena širina */
  height: auto;
  margin: 40px auto; 
  border-radius: 10px;
  overflow: hidden;
  background: #ffcc80;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  align-items: center;
  justify-content: center;
  border: 3px solid #ff9800;
  /* padding: 20px; */
}

.image-section {
  background: #ff9800;
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.form-section {
  flex: 2;
  padding: 43px;
  background: #ffe0b2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow-y: auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

form {
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

form label {
  display: block;
  width: 100%;
  margin: 5px 0;
  font-weight: bold;
  color: #555;
}

textarea,
input {
  width: 100%;
  padding: 8px;
  margin-top: 3px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
}

.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #ff7043;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  background: #fff;
  color: #ff7043;
  font-weight: bold;
  width: 100%;
}

.upload-container:hover {
  background: #ffcc80;
}

.upload-icon {
  cursor: pointer;
}

.button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
}

.back-button,
.next-button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  width: 45%;
  text-align: center;
}

.back-button {
  background-color: #ccc;
  color: #333;
}

.next-button {
  background-color: #ff5722;
  color: white;
}

.next-button:disabled {
  background-color: #ccc;
}

.map {
  width: 100%;
  height: 250px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
}
</style>

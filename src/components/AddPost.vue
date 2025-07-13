<template>
  <div class="form-container">
    <!-- Leva strana sa slikom -->
    <div class="image-section">
      <img src="@/assets/mrkvice.jpg" alt="Post Image" class="post-image" />
    </div>

    <!-- Desna strana sa formom -->
    <div class="form-section">
      <h1>{{ isUpdating ? 'Update Post' : 'Add New Bunny Post' }}</h1>

      <!-- Feedback poruka -->
      <div v-if="showSuccessMessage" class="success-message">
        {{ isUpdating ? 'Post successfully updated!' : 'Post successfully added!' }}
      </div>

      <form @submit.prevent="onSubmitPost" v-if="!submitted">

        <label>
          Description:
          <textarea v-model="form.description" required placeholder="Write something about your post"></textarea>
        </label>

        <label class="upload-label">
          Upload a photo:
          <div class="upload-container">
            <input type="file" id="file-input" @change="onFileChange" accept="image/*" hidden />
            <label for="file-input" class="upload-icon" v-if="!selectedFileName">📷 Choose File</label>
            <span v-else class="file-name">{{ selectedFileName }}</span>
          </div>
        </label>

        <!-- Mapa za odabir lokacije -->
        <div id="map" class="map"></div>

        <div class="input-group">
          <label>
            Latitude:
            <input type="number" step="0.000001" v-model="form.location.latitude" required placeholder="Latitude" />
          </label>
          <label>
            Longitude:
            <input type="number" step="0.000001" v-model="form.location.longitude" required placeholder="Longitude" />
          </label>
        </div>

        <div class="button-group">
          <button type="button" class="back-button" @click="goBack">Back</button>
          <button :disabled="!isFormValid" type="submit" class="next-button">
            {{ isUpdating ? 'Update' : 'Add' }} Post
          </button>
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
import { toLonLat, fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';

export default {
  name: 'AddPost',

  setup() {
    const router = useRouter();
    const route = useRoute();
    const submitted = ref(false);
    const isUpdating = ref(false);
    const selectedFileName = ref('');
    const showSuccessMessage = ref(false);

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
        selectedFileName.value = file.name;
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

        // alert(isUpdating.value ? 'Post uspešno ažuriran!' : 'Post uspešno dodat!');
        //await fetchPosts();

        showSuccessMessage.value = true;
        setTimeout(() => (showSuccessMessage.value = false), 3000);
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
      goBack,
      selectedFileName,
      showSuccessMessage
    };
  },
};
</script>
<style scoped>
/* Glavni kontejner */
.form-container {
  display: flex;
  width: 80vw;
  max-width: 1000px;
  margin: 40px auto;
  border-radius: 15px;
  overflow: hidden;
  background: #fae1c2;
  /* Krem boja sa slike */
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
  align-items: stretch;
  border: 2px solid #e76f51;
  /* Tamnija narandžasta sa slike */
}

/* Sekcija sa slikom */
.image-section {
  background: linear-gradient(135deg, #f4a261, #e76f51);
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Sekcija sa formom */
.form-section {
  flex: 2;
  padding: 40px;
  background: #f4a261;
  /* Glavna pastelna narandžasta */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Naslov */
h1 {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  font-size: 24px;
}

/* Stilovi za formu */
form {
  width: 100%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

label {
  display: block;
  font-weight: bold;
  color: white;
  font-size: 14px;
}

/* Stil za textarea i input */
textarea,
input {
  width: 100%;
  padding: 10px;
  border: 1px solid white;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  transition: 0.3s ease-in-out;
}

textarea {
  min-height: 100px;
  resize: none;
}

textarea:focus,
input:focus {
  border-color: #ffffff;
  outline: none;
  box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.5);
}

/* Upload sekcija */
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed white;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  font-weight: bold;
  width: 100%;
  height: 40px;
  position: relative;
}

.upload-container:hover {
  background: rgba(255, 255, 255, 0.2);
}

.upload-icon {
  cursor: pointer;
  color: white;
}

.file-name {
  color: #fff;
  font-weight: bold;
}

/* Stil za mapu */
.map {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  border: 1px solid white;
}

/* Inputi latitude i longitude sa većim razmakom */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Povećan razmak */
}

/* Dugmad */
.button-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 15px;
}

.back-button,
.next-button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  width: 48%;
  transition: all 0.3s ease;
}

.back-button {
  background-color: #ccc;
  color: #333;
}

.back-button:hover {
  background-color: #b0b0b0;
}

.next-button {
  background-color: white;
  color: #e76f51;
  /* Tamnija narandžasta za akcente */
  font-weight: bold;
}

.next-button:hover {
  background-color: #fae1c2;
  /* Svetlija pastelna nijansa */
}

.next-button:disabled {
  background-color: #ccc;
}

/* Feedback poruka */
.success-message {
  background-color: #2a9d8f;
  /* Zelena nijansa iz slike */
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 15px;
  animation: fadeIn 0.5s ease-in-out;
}

/* Animacija za uspešnu poruku */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

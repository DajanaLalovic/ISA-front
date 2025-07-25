<template>
    <div class="map-container">
    
      <div class="container1">
        <h1 class="title">Your Nearby Posts</h1>
    
    <p class="description">
        The map is centered on your address, showing nearby posts from other users.
        Discover posts from users near your location. Explore new opportunities and connect with your local community!
   
      </p>
      </div>

      <div class="content1">
      <img src="@/style/bunny.png" alt="Bunny Image" class="bunny-image" />
      <div id="map" class="map"></div>
    </div>
     
    </div>
  </template>
  <script>
  import { Map, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import OSM from "ol/source/OSM";
  import Overlay from "ol/Overlay";
  import { fromLonLat } from "ol/proj";
  import { defaults as defaultControls } from "ol/control";
  import axios from "axios";
  import { useRoute } from 'vue-router';
  
  export default {
    name: "UserMap",
    data() {
      return {
        map: null,
        userAddress: "",
        posts: [],
        userCoordinates: { latitude: 0, longitude: 0 },
        addressCache: {}, 
      };
    },
    methods: {
      async fetchLocations() {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get('http://localhost:8080/api/locationMessage/all', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
  
          const locations = response.data;
  
          for (const location of locations) {
          //  const address = `${location.street} ${location.number}, ${location.city}, ${location.postalCode}, ${location.country}`;
          //  const coordinates = await this.getCoordinatesFromAddress(address);
            this.addHospitalMarker(location.latitude, location.longitude, location.name);
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        }
      },
  
      addHospitalMarker(lat, lon, name) {
        const markerElement = document.createElement("div");
        markerElement.className = "hospital-marker";
        markerElement.innerHTML = `
          <span class="hospital-icon">🏥</span>
          <div class="hospital-name">🐾${name}🐇</div>
        `;
        markerElement.style.cursor = "pointer";
  
        const marker = new Overlay({
          position: fromLonLat([lon, lat]),
          positioning: "center-center",
          element: markerElement,
          stopEvent: false,
        });
  
        this.map.addOverlay(marker);
      },
  
      async fetchUserProfile(userId) {
        try {
          const response = await axios.get(`http://localhost:8080/api/profile/${userId}`);
          const address = response.data.address;
          this.userAddress = `${address.street} ${address.number}, ${address.city}, ${address.postalCode}, ${address.country}`;
          await this.setUserCoordinates();
        } catch (error) {
          console.error("Error loading user profile: ", error);
        }
      },
  
      async getCoordinatesFromAddress(address) {
        if (this.addressCache[address]) {
          return this.addressCache[address];
        }
  
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        try {
          const response = await axios.get(url);
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const coords = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
            this.addressCache[address] = coords; 
            return coords;
          }
        } catch (error) {
          console.error("Error fetching coordinates: ", error);
        }
        return { latitude: 45.2671, longitude: 19.8335 }; // Default 
      },
  
      async setUserCoordinates() {
        const { latitude, longitude } = await this.getCoordinatesFromAddress(this.userAddress);
        this.userCoordinates = { latitude, longitude };
        await this.initializeMap();
      },
  
      async fetchPosts(userId) {
        try {
          console.log("fetchPosts pozvan");
          const response = await axios.get('http://localhost:8080/api/posts/all');
          console.log("Dohvaćeni postovi:", response.data);
          const userIdNumber = Number(userId);
         // console.log(userIdNumber);
          const processedPosts = await Promise.all(
            response.data
              .filter(post => !post.isRemoved && post.userId !== userIdNumber)
              .map(async post => ({
                ...post,
                imagePath: `http://localhost:8080/images/${post.imagePath}`,
              }))
          );
          this.posts = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.addPostMarkers();
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      },
  
      async initializeMap() {
        if (!this.userCoordinates.latitude || !this.userCoordinates.longitude) {
          console.error("User coordinates are invalid. Map not initialized.");
          return;
        }
  
        this.map = new Map({
          target: "map",
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          view: new View({
            center: fromLonLat([
              this.userCoordinates.longitude,
              this.userCoordinates.latitude,
            ]),
            zoom: 12,
          }),
          controls: defaultControls({
            attribution: false,
          }),
        });
  
        this.addUserMarker();
      },
  
      addUserMarker() {
        const markerElement = document.createElement("div");
        markerElement.className = "user-marker";
        markerElement.title = "Your Location";
        markerElement.innerHTML = `
          📍🏡
          <img src="https://plus.unsplash.com/premium_vector-1721890983105-625c0d32045f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3" alt="Your Location">
        `;
        markerElement.style.cursor = "pointer";
  
        const marker = new Overlay({
          position: fromLonLat([
            this.userCoordinates.longitude,
            this.userCoordinates.latitude,
          ]),
          positioning: "center-center",
          element: markerElement,
          stopEvent: false,
        });
  
        this.map.addOverlay(marker);
      },
  
      addPostMarkers() {
        this.posts.forEach((post) => {
          const markerElement = document.createElement("div");
          markerElement.className = "marker";
          markerElement.title = post.description;
          markerElement.innerHTML = `📍<img src="${post.imagePath}">`;
          markerElement.style.cursor = "pointer";
  
       
          const lat = post.location.latitude 
          const long =post.location.longitude
          console.log(lat);
          console.log(long);
          console.log("Dodajem marker za post:", post.id, "Lokacija:", post.location.latitude, post.location.longitude);
          const marker = new Overlay({
            position: fromLonLat([long, lat]),
            positioning: "center-center",
            element: markerElement,
            stopEvent: false,
          });
  
          this.map.addOverlay(marker);
        });
      },
    },
  
    async mounted() {
      const route = useRoute();
      const userId = route.params.userId;
      console.log(userId);
      await this.fetchUserProfile(userId);
      await this.fetchPosts(userId);
      await this.fetchLocations();
    },
  };
  </script>
  

  
  <style >
  .map-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .hospital-marker {
  position: relative; 
}

.hospital-icon {
  font-size: 16px; 
}

.hospital-name {
  position: absolute;
  top: -20px; 
  left: 50%; 
  transform: translateX(-50%); 
  font-size: 15px; 
  color: red;
  background-color: white; 
  padding: 2px 5px; 
  border-radius: 3px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
  white-space: nowrap; 
  display: none; 
}

.hospital-marker:hover .hospital-name {
  display: block; 
}


.container1 {
    display: flex;
    text-align: left;
    align-items: center; 
}

.title {
    font-size: 32px; 
    font-weight: 700; 
    color:  #f39c12; 
    margin-bottom: 15px;
    text-align: left;
    font-family: 'Montserrat', sans-serif; 
    flex-shrink: 0;
    margin-left: -25%;
    margin-right: 10%;
}

.description {
    font-size: 18px; 
    color: #555; 
    margin-bottom: 25px;
    text-align: left; 
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    font-style: italic;
    background-color: #fff5e6;
    width: 700px;
    word-wrap: break-word; 
   
}


.content1 {
  margin-left: -20%;
  display: flex; 
  justify-content: flex-start; 
  align-items: flex-end;
  gap:100px;
}

.bunny-image {
  width: 300px; 
  height: auto;
}

  
  .map {
   width: 900px;
    max-width: 900px;
    height: 500px;
    border: 2px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
 
.user-marker {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .user-marker img {
    display: none;
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: auto; 
    z-index: 10;
    border: 2px solid #fff; 
    border-radius: 5px; 
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  }

  .user-marker:hover img {
    display: block;
  }

.marker {
  font-size: 24px !important; 
  color: red !important;     
  cursor: pointer !important;
  position: relative;
    display: inline-block;
    cursor: pointer;
    z-index: 0;
}
.marker img {
    display: none;
    position: absolute;
    top: -60px; 
    left: 50%;
    transform: translateX(-50%);
    width: 100px; 
    height: auto; 
   z-index: 10;
    border: 2px solid #fff; 
    border-radius: 5px; 
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .marker:hover img {
    display: block;
  }
 

  </style>
  
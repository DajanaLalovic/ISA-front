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
      <!-- <div id="map" class="map"></div> -->
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
        userAddress: "", // User address
        posts: [], // Dynamic posts array
        userCoordinates: { latitude: 0, longitude: 0 }, // User coordinates
       
      };
    },
    methods: {
      async fetchLocations() {
    try {
      const token = localStorage.getItem('authToken'); // Preuzmi token iz localStorage ili gde god ga čuvaš
    const response = await axios.get('http://localhost:8080/api/locationMessage/all', {
      headers: {
        'Content-Type': 'application/json', // Specifikacija tipa sadržaja
        'Authorization': `Bearer ${token}`, // Token za autentifikaciju
      },
    });
      const locations = response.data;

      for (const location of locations) {
        const address = `${location.street} ${location.number}, ${location.city}, ${location.postalCode}, ${location.country}`;
        const coordinates = await this.getCoordinatesFromAddress(address);
        this.addHospitalMarker(coordinates.latitude, coordinates.longitude, location.name);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  },

  // Dodaj stiker bolnice na mapu
  // addHospitalMarker(lat, lon, name) {
  //   const markerElement = document.createElement("div");
  //   markerElement.className = "hospital-marker";
  //   markerElement.title = name;
  //   markerElement.innerHTML = `
  //     🏥 <p>${name}</p>
  //   `;
  //   markerElement.style.cursor = "pointer";

  //   const marker = new Overlay({
  //     position: fromLonLat([lon, lat]),
  //     positioning: "center-center",
  //     element: markerElement,
  //     stopEvent: false,
  //   });

  //   this.map.addOverlay(marker);
  // },

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

      // Fetch user profile with coordinates
      async fetchUserProfile(userId) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/profile/${userId}`
          );
          const address = response.data.address;
          this.userAddress = `${address.street} ${address.number}, ${address.city}, ${address.postalCode}, ${address.country}`;
          console.log("Formatted Address: ", this.userAddress);
          
          // Fetch the user coordinates based on the address
          await this.setUserCoordinates();
        } catch (error) {
          console.error("Error loading user profile: ", error);
        }
      },
  
      // Fetch coordinates from the address using Nominatim API
      async getCoordinatesFromAddress(address) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`;
        try {
          const response = await axios.get(url);
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
          }
        } catch (error) {
          console.error("Error fetching coordinates: ", error);
        }
        return { latitude: 45.2671, longitude: 19.8335 }; // Default coordinates (Novi Sad)
      },
  
      // Set user coordinates and initialize the map
      async setUserCoordinates() {
        const { latitude, longitude } = await this.getCoordinatesFromAddress(
          this.userAddress
        );
        this.userCoordinates = { latitude, longitude };
        console.log("User coordinates set:", this.userCoordinates); // Debugging
        await this.initializeMap();
      },
  
      // Fetch posts and process them
    //   async fetchPosts() {
    //     try {
    //       const response = await axios.get('http://localhost:8080/api/posts/all');
    //       const processedPosts = await Promise.all(
    //         response.data
    //           .filter(post => !post.isRemoved)
    //           .map(async post => ({
    //             ...post,
    //             imagePath: `http://localhost:8080/images/${post.imagePath}`,
    //             //likesCount: await this.fetchLikesCount(post.id)
    //           }))
    //       );
          
    //       // Store the processed posts
    //       this.posts = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
    //       // Add post markers after fetching posts
    //       this.addPostMarkers();
  
    //     } catch (error) {
    //       console.error('Error fetching posts:', error);
    //     }
    //   },
  
    async fetchPosts(userId) {
    try {
        const response = await axios.get('http://localhost:8080/api/posts/all');
      
        console.log(userId);
        // Pretpostavljamo da je trenutni userId sačuvan u this.currentUserId
     // Trebalo bi da postaviš ovaj userId negde u kodu
     const userIdNumber = Number(userId);
        const processedPosts = await Promise.all(
            response.data
                .filter(post => !post.isRemoved && post.userId !== userIdNumber)  // Filtriraj postove koji ne pripadaju trenutnom korisniku
                .map(async post => ({
                    ...post,
                    imagePath: `http://localhost:8080/images/${post.imagePath}`,
                    // likesCount: await this.fetchLikesCount(post.id)  // Ovdje možeš ostaviti kod za likes ako treba
                }))
        );

        // Store the processed posts
        this.posts = processedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Add post markers after fetching posts
        this.addPostMarkers();

    } catch (error) {
        console.error('Error fetching posts:', error);
    }
},

      // Fetch likes count for a post
    //   async fetchLikesCount(postId) {
    //     try {
    //       const response = await axios.get(`http://localhost:8080/api/posts/${postId}/likes`);
    //       return response.data.likesCount;
    //     } catch (error) {
    //       console.error(`Error fetching likes for post ${postId}:`, error);
    //       return 0; // Default to 0 likes if error occurs
    //     }
    //   },
  
      // Initialize the map
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
  
        // Add user marker
        this.addUserMarker();
       
      },
  
      // Add a marker for the user's location
      addUserMarker() {
        const markerElement = document.createElement("div");
        markerElement.className = "user-marker";
        markerElement.title = "Your Location";
        markerElement.innerHTML = //"📍🏡";
        `
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
  
      // Add markers for posts
      addPostMarkers() {
        this.posts.forEach((post) => {
          const markerElement = document.createElement("div");
          markerElement.className = "marker";
          markerElement.title = post.description;
          markerElement.innerHTML = //"📍";
          `📍
           <img src="${post.imagePath}">`;
          markerElement.style.cursor = "pointer";
          const marker = new Overlay({
            position: fromLonLat([post.longitude, post.latitude]),
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
      await this.fetchUserProfile(userId);
      await this.fetchPosts(userId); // Fetch posts after the user profile is loaded
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
  position: relative; /* Postavlja marker kao referentni kontejner */
}

.hospital-icon {
  font-size: 16px; /* Veličina ikonice bolnice */
}

.hospital-name {
  position: absolute; /* Apsolutno pozicioniranje unutar markera */
  top: -20px; /* Postavi ime iznad ikonice */
  left: 50%; /* Centriraj ime horizontalno */
  transform: translateX(-50%); /* Poravnaj centar teksta sa centrom ikonice */
  font-size: 15px; /* Veličina fonta */
  color: red; /* Crvena boja teksta */
  background-color: white; /* Pozadina bele boje za bolju vidljivost */
  padding: 2px 5px; /* Dodaj padding oko teksta */
  border-radius: 3px; /* Zaobljeni uglovi */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Blaga senka ispod teksta */
  white-space: nowrap; /* Sprečava prelamanje teksta */
  display: none; /* Sakrij tekst dok nije hover */
}

.hospital-marker:hover .hospital-name {
  display: block; /* Prikazuje ime bolnice na hover */
}


  
  /* .title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }
  
  .description {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  } */
  /* .title {
    font-size: 32px; 
    font-weight: 700; 
    color:  #f39c12; 
    margin-bottom: 15px;
    text-align: center; 
    font-family: 'Montserrat', sans-serif; 
}

.description {
    font-size: 18px; 
    color: #555; 
    margin-bottom: 25px;
    text-align: center; 
    font-family: 'Roboto', sans-serif; 
    line-height: 1.6; 
    font-style: italic;
    background-color: #fff5e6;
} */
.container1 {
    display: flex;
    text-align: left;
    align-items: center; /* Vertikalno centriranje elemenata */
    /*justify-content: space-between; /* Razmak između title i description */
     /* Razmak između elemenata */
}

.title {
    font-size: 32px; /* Veći font za isticanje */
    font-weight: 700; /* Bold za upečatljivost */
    color:  #f39c12; /* Tamnosiva boja */
    margin-bottom: 15px;
    text-align: left; /* Text alignt left */
    font-family: 'Montserrat', sans-serif; /* Moderni sans-serif font */
    flex-shrink: 0; /* Ne dozvoljava smanjenje širine title */
    margin-left: -25%;
    margin-right: 10%;
}

.description {
    font-size: 18px; /* Malo veći font za čitljivost */
    color: #555; /* Svetlija siva */
    margin-bottom: 25px;
    text-align: left; /* Text alignment left */
    font-family: 'Roboto', sans-serif; /* Lagan sans-serif font */
    line-height: 1.6; /* Razmak između linija za čitljivost */
    font-style: italic;
    background-color: #fff5e6;
    width: 700px; /* Ograničenje širine na 300px */
    word-wrap: break-word; /* Prelazak u novi red kad tekst ne stane */
   
}


.content1 {
  margin-left: -20%;
  /*margin-left: -300px;*/
  display: flex; /* Aktivira Flexbox */
  justify-content: flex-start; /* Rasporedi elemente sa razmakom između njih */
  align-items: flex-end;
  gap:100px;
}

.bunny-image {
  width: 300px; /* Širina slike */
  height: auto;
}

  
  .map {
   /* width: 100%;*/
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
    top: -100px; /* Postavi poziciju slike iznad markera */
    left: 50%;
    transform: translateX(-50%);
    width: 100px; /* Širina slike */
    height: auto; /* Automatsko skaliranje visine */
    z-index: 10;
    border: 2px solid #fff; /* Opciono: okvir za sliku */
    border-radius: 5px; /* Zaobljeni uglovi */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Opciono: senka */
  }

  .user-marker:hover img {
    display: block;
  }




/* Marker za postove */
.marker {
  font-size: 24px !important; /* Manja veličina fonta */
  color: red !important;      /* Crvena boja */
  cursor: pointer !important;/* Pointer kursor */
        /* Manji z-index za post marker */
  position: relative;
    display: inline-block;
    cursor: pointer;
    z-index: 0;
}
.marker img {
    display: none;
    position: absolute;
    top: -60px; /* Postavi poziciju slike iznad markera */
    left: 50%;
    transform: translateX(-50%);
    width: 100px; /* Širina slike */
    height: auto; /* Automatsko skaliranje visine */
   z-index: 10;
    border: 2px solid #fff; /* Opciono: okvir za sliku */
    border-radius: 5px; /* Zaobljeni uglovi */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Opciono: senka */
  }
  
  .marker:hover img {
    display: block;
  }
 

  </style>
  
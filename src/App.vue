<template>
  <div id="app">
   
   <HelloWorld/>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  
   mounted() {
    if (!sessionStorage.getItem('appInitialized')) {
      // Tvoj kod koji treba da se izvrši samo prvi put
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      console.log('LocalStorage resetovan na Login stranici');
      console.log('Komponenta je učitana prvi put.');

      // Obeleži da je već inicijalizovano
      sessionStorage.setItem('appInitialized', 'true');
    }
  }

}

/*window.addEventListener('beforeunload', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
});*/
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
button {
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
}
body {
  background:#fff8e1; /* Postavljena pozadinska boja */
}
</style>

<template>
  <div id="app">
   
   <HelloWorld/>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
button {
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>

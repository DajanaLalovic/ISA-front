<template>
    <div class="content">
      <v-card elevation="5" class="signup-card">
        <v-card-title>
          <h2>{{ title }}</h2>
        </v-card-title>
  
        <v-card-text>
          <p v-if="notification" :class="notification.msgType">{{ notification.msgBody }}</p>
          <form @submit.prevent="onSubmit" v-if="!submitted">
            <v-text-field
              label="Username"
              v-model="form.username"
              required
              :rules="[rules.required, rules.min(3), rules.max(64)]"
            ></v-text-field>
            <v-text-field
              label="Password"
              v-model="form.password"
              type="password"
              required
              :rules="[rules.required, rules.min(3), rules.max(32)]"
            ></v-text-field>
            <v-text-field label="First Name" v-model="form.firstname"></v-text-field>
            <v-text-field label="Last Name" v-model="form.lastname"></v-text-field>
            <v-text-field label="Email" v-model="form.email" type="email"></v-text-field>
  
            <v-btn :disabled="!isFormValid" color="primary" type="submit">Sign up</v-btn>
            <v-btn color="primary" @click="goBack">Go Back</v-btn>
          </form>
          <v-progress-circular v-if="submitted" indeterminate></v-progress-circular>
        </v-card-text>
      </v-card>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  export default {
    name: 'SignUp',
    setup() {
      const router = useRouter();
      const title = 'Sign up';
      const submitted = ref(false);
      const notification = ref(null);
      const form = ref({
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        email: '',
      });
  
      const rules = {
        required: v => !!v || 'Field is required',
        min: min => v => (v && v.length >= min) || `Min ${min} characters`,
        max: max => v => (v && v.length <= max) || `Max ${max} characters`
      };
  
      const isFormValid = computed(() => {
        return (
          form.value.username &&
          form.value.password &&
          form.value.username.length >= 3 &&
          form.value.username.length <= 64 &&
          form.value.password.length >= 3 &&
          form.value.password.length <= 32
        );
      });
  
      const onSubmit = async () => {
        notification.value = null;
        submitted.value = true;
        try {
          await axios.post('/auth/signup', form.value);
          await axios.post('/auth/login', form.value);
          router.push('/');
        } catch (error) {
          submitted.value = false;
          notification.value = {
            msgType: 'error',
            msgBody: error.response.data.message || 'Sign up error',
          };
        }
      };
  
      const goBack = () => {
        router.push('/');
      };
  
      return {
        title,
        submitted,
        notification,
        form,
        rules,
        isFormValid,
        onSubmit,
        goBack,
      };
    },
  };
  </script>
  
  <style src="@/style/SignUp.css"></style>

  
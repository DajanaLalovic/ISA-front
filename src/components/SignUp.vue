<template>
  <div class="content">
    <div class="signup-card">
      <h2>{{ title }}</h2>
      <p v-if="notification" :class="notification.msgType">{{ notification.msgBody }}</p>
      <form @submit.prevent="onSubmit" v-if="!submitted">
       
        <label>
          Username:
          <input
            type="text"
            v-model="form.username"
            required
            :class="{ 'input-error': touchedFields.username && !isUsernameValid }"
            @blur="touchedFields.username = true; checkUsername();"
            placeholder="Enter username"
          />
        </label>
        <span v-if="form.username && usernameExists" class="error-message">
            Username already exists.
          </span>
        <span v-if="form.username && !isUsernameValid" class="error-message">
         Username must be between 3 and 64 characters.
        </span>
        <span v-if="touchedFields.username && !isUsernameValid" class="error-message">
      
        </span>
        <label>
          Password:
          <input
            type="password"
            v-model="form.password"
            required
            :class="{ 'input-error': touchedFields.password && !isPasswordValid }"
            @blur="touchedFields.password = true"
            placeholder="Enter password"
          />
        </label>
        <span v-if="form.password && !isPasswordValid" class="error-message">
    Password must be between 3 and 32 characters.
        </span>
        <span v-if="touchedFields.password && !isPasswordValid" class="error-message">
 
        </span>
        <label>
          Confirm Password:
          <input
            type="password"
            v-model="form.confirmPassword"
            required
            :class="{ 'input-error': touchedFields.confirmPassword && form.confirmPassword !== form.password }"
            @blur="touchedFields.confirmPassword = true"
            placeholder="Enter password again"
          />
          <span v-if="form.confirmPassword && form.confirmPassword !== form.password" class="error-message">
              Passwords do not match
            </span>
        </label>
        <label>
          First Name:
          <input
            type="text"
            v-model="form.name"
            required
            :class="{ 'input-error': touchedFields.name && !form.name }"
            @blur="touchedFields.name = true"
            placeholder="Enter name"
          />
        </label>
        <span v-if="form.name && !isNameValid" class="error-message">
    First name must contain only letters.
        </span>
        <span v-if="touchedFields.name && !isNameValid" class="error-message">
  
        </span>
        <label>
          Last Name:
          <input
            type="text"
            v-model="form.surname"
            required
            :class="{ 'input-error': touchedFields.surname && !form.surname }"
            @blur="touchedFields.surname = true"
            placeholder="Enter surname"
          />
        </label>
        <span v-if="form.surname && !isSurnameValid" class="error-message">
    Last name must contain only letters.
        </span>
        <span v-if="touchedFields.surname && !isSurnameValid" class="error-message">

        </span>
        <label>
          Email:
          <input
            type="email"
            v-model="form.email"
            required
            :class="{ 'input-error': touchedFields.email && !isEmailValid }"
            @blur="touchedFields.email = true"
            placeholder="Enter email"
          />
        </label>
        <p v-if="touchedFields.email && !isEmailValid" class="error-message">
    Please enter a valid email address.
  </p>
        <div class="address-fields">
          <label>
            Street:
            <input
              type="text"
              v-model="form.street"
              required
              :class="{ 'input-error': touchedFields.street && !form.street }"
              @blur="touchedFields.street = true"
              placeholder="Enter street"
            />
             
          <p v-if="touchedFields.street && !form.street" class="validation-message">
      
        </p>
          </label>
         
          <label>
            Number:
            <input
              type="text"
              v-model="form.number"
              required
              :class="{ 'input-error': touchedFields.number && !isNumberValid }"
              @blur="touchedFields.number = true"
              placeholder="Enter number"
            />
            <span v-if="form.number && !isNumberValid" class="error-message">
              It must be a number
            </span>
            <span v-if="touchedFields.number && !isNumberValid && form.number" class="error-message">
            
            </span>
          </label>
        </div>
        <div class="address-fields">
          <label>
            City:
            <input
              type="text"
              v-model="form.city"
              required
              :class="{ 'input-error': touchedFields.city && !form.city }"
              @blur="touchedFields.city = true"
              placeholder="Enter city"
            />
            <span v-if="form.city && !isCityValid" class="error-message">
    City must contain only letters.
  </span>
  <span v-if="touchedFields.city && !isCityValid" class="error-message">
    
  </span>
          </label>
          
          
          <label>
            Postal Code:
            <input
              type="text"
              v-model="form.postalCode"
              required
              :class="{ 'input-error': touchedFields.postalCode && !isPostalCodeValid }"
              @blur="touchedFields.postalCode = true"
              placeholder="Enter postal code"
            />
            <span v-if="form.postalCode && !isPostalCodeValid " class="error-message">
              It must be a number
            </span>
            <span v-if="touchedFields.postalCode && !isPostalCodeValid " class="error-message">
              
            </span>
          </label>
        </div>
        <label>
          Country:
          <input
            type="text"
            v-model="form.country"
            required
            :class="{ 'input-error': touchedFields.country && !form.country }"
            @blur="touchedFields.country = true"
            placeholder="Enter country"
          />
        </label>
        <p v-if="form.country && !isCountryValid" class="error-message">
      Country must contain only letters.
    </p>
        <p v-if="touchedFields.country && !isCountryValid" class="error-message">
     
    </p>

        <button :disabled="!isFormValid" type="submit">Sign up</button>
        <button type="button" @click="goBack">Go Back</button>
      </form>
      <div v-if="submitted" class="loading">Loading...</div>
      <div v-if="errorMessages.length" class="error-summary">
        <ul>
          <li v-for="(msg, index) in errorMessages" :key="index">{{ msg }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
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
      confirmPassword: '',
      name: '',
      surname: '',
      email: '',
      street: '',
      number: '',
      city: '',
      postalCode: '',
      country: '',
    });
    const errorMessages = ref([]);
    
    const touchedFields = ref({
      username: false,
      password: false,
      confirmPassword: false,
      name: false,
      surname: false,
      email: false,
      street: false,
      number: false,
      city: false,
      postalCode: false,
      country: false,
    });
    
    onMounted(() => {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        router.push('/');
      }

      
    });
    const isUsernameValid = computed(() => form.value.username.length >= 3 && form.value.username.length <= 64);
    const isPasswordValid = computed(() => form.value.password.length >= 3 && form.value.password.length <= 32);
    const isEmailValid = computed(() => /\S+@\S+\.\S+/.test(form.value.email));
    const isNumberValid = computed(() => /^\d+$/.test(form.value.number));
    const isPostalCodeValid = computed(() => /^\d+$/.test(form.value.postalCode));
    const isNameValid = computed(() => /^[a-zA-Z]+$/.test(form.value.name));
    const isSurnameValid = computed(() => /^[a-zA-Z]+$/.test(form.value.surname));
    const isCityValid = computed(() => /^[a-zA-Z\s]+$/.test(form.value.city));
    const isCountryValid = computed(() => /^[a-zA-Z\s]+$/.test(form.value.country));
    const usernameExists = ref(false);

    const checkUsername = async () => {
  if (form.value.username && isUsernameValid.value) {
    try {
      const response = await axios.get(`http://localhost:8080/api/check-by-username/${form.value.username}`);
      if (response.status === 200) {
        // Korisnik postoji
        usernameExists.value = true;
        //userData.value = response.data; // Opcionalno, ako želite da koristite podatke o korisniku
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Korisnik ne postoji
        usernameExists.value = false;
      } else {
        console.error("Error checking username:", error);
      }
    }
  }
};
watch(() => form.value.username, checkUsername);

    const isFormValid = computed(() => {
      return (
        isUsernameValid.value &&
        isPasswordValid.value &&
        form.value.confirmPassword === form.value.password &&
        form.value.name &&
        form.value.surname &&
        isEmailValid.value &&
        form.value.street &&
        isNumberValid.value &&
        form.value.city &&
        isPostalCodeValid.value &&
        form.value.country &&
        isNameValid.value && 
        isSurnameValid.value && 
        isCityValid.value &&
        isCountryValid.value &&
        !usernameExists.value
      );
    });

    const onSubmit = async () => {
      errorMessages.value = []; // Reset error messages
      // if (!isFormValid.value) {
      //   // Add error messages for invalid fields
      //   if (!isUsernameValid.value) errorMessages.value.push('Username must be 3-64 characters.');
      //   if (!isPasswordValid.value) errorMessages.value.push('Password must be 3-32 characters.');
      //   if (form.value.confirmPassword !== form.value.password) errorMessages.value.push('Passwords do not match.');
      //   if (!isEmailValid.value) errorMessages.value.push('Invalid email format.');
      //   if (!isNumberValid.value) errorMessages.value.push('Number must be numeric.');
      //   if (!isPostalCodeValid.value) errorMessages.value.push('Postal Code must be numeric.');
      //   return;
      // }
    

      notification.value = null;
      submitted.value = true;
      try {
        await axios.post('http://localhost:8080/auth/signup', form.value);
        router.push('/login');
      } catch (error) {
        submitted.value = false;

        if (error.response && error.response.data && error.response.data.message === "Username already exists") {
      notification.value = { msgType: 'error', msgBody: 'Username already exists. Please choose a different one.' };
    } else {
      notification.value = { msgType: 'error', msgBody: 'An error occurred during registration. Please try again.' };
    }
      /*  notification.value = {
          msgType: 'error',
          msgBody: error.response?.data?.message || 'Sign up error',
        };*/
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
      isFormValid,
      onSubmit,
      goBack,
      isUsernameValid,
      isPasswordValid,
      isEmailValid,
      isNumberValid,
      isPostalCodeValid,
      errorMessages,
      touchedFields,
      isNameValid,
      isSurnameValid,
      isCityValid ,
      isCountryValid ,
      checkUsername,
      usernameExists
    };
  },
 
};
</script>

<style src="@/style/SignUp.css"></style>
<style scoped>
.content {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.signup-card h2 {
  margin-bottom: 20px;
  text-align: center;
}
label {
  display: block;
  margin-bottom: 15px;
}
label input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.address-fields {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
button {
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.input-error {
  border-color: red;
}
.loading {
  text-align: center;
  font-size: 16px;
  color: #888;
}
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}
.error-summary {
  color: red;
  font-size: 14px;
  margin-top: 20px;
}
</style>

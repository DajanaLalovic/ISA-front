<template>
  <div class="background-container">
    <div class="all-users-container">
      <button @click="goToHome" class="return-button">Return</button>
      <h1>All Registered Users</h1>

      <div class="filters">
        <input
          v-model="searchCriteria.name"
          placeholder="Search by name"
          class="filter-input"
        />
        <input
          v-model="searchCriteria.surname"
          placeholder="Search by surname"
          class="filter-input"
        />
        <input
          v-model="searchCriteria.email"
          placeholder="Search by email"
          class="filter-input"
        />
        <input
          v-model.number="searchCriteria.minPostCount"
          type="number"
          placeholder="Min post count"
          class="filter-input"
        />
        <input
          v-model.number="searchCriteria.maxPostCount"
          type="number"
          placeholder="Max post count"
          class="filter-input"
        />
        <select v-model="searchCriteria.sortBy" class="filter-select">
          <option value="">Sort by</option>
          <option value="followingCount">Following Count</option>
          <option value="email">Email</option>
        </select>
        <select v-model="searchCriteria.sortOrder" class="filter-select">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button @click="applyFilters" class="cta-button">Apply Filters</button>
        <button @click="resetFilters" class="cta-button reset-button">
          Reset Filters
        </button>
      </div>

      <div v-if="users.length === 0" class="no-users-message">
        There are no registered users.
      </div>

      <table v-else class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Post Count</th>
            <th>Following Count</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            :style="isCurrentUser(user.id) ? { fontWeight: 'bold' } : {}"
          >
            <td>{{ user.name }}</td>
            <td>{{ user.surname }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.postCount }}</td>
            <td>{{ user.followingCount }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination-controls">
        <button @click="previousPage" :disabled="currentPage === 1">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AllUsers",
  data() {
    return {
      users: [],
      currentPage: 1,
      usersPerPage: 5,
      totalPages: 0,
      loggedInUserId: localStorage.getItem("userId"),
      searchCriteria: {
        name: "",
        surname: "",
        email: "",
        minPostCount: null,
        maxPostCount: null,
        sortBy: "",
        sortOrder: "asc",
      },
    };
  },
  methods: {
    isCurrentUser(userId) {
      return userId == this.loggedInUserId;
    },
    goToHome() {
      this.$router.push("/");
    },
    async applyFilters() {
      try {
        const token = localStorage.getItem("authToken");
        console.log("Token:", token); // Proveri token

        if (!token) {
          console.error("No auth token found, unable to fetch users");
          return;
        }

        const params = {
          name: this.searchCriteria.name || undefined,
          surname: this.searchCriteria.surname || undefined,
          email: this.searchCriteria.email || undefined,
          minPostCount: this.searchCriteria.minPostCount || undefined,
          maxPostCount: this.searchCriteria.maxPostCount || undefined,
          sortBy: this.searchCriteria.sortBy || undefined,
          sortOrder: this.searchCriteria.sortOrder || undefined,
          page: this.currentPage - 1,
          size: this.usersPerPage,
        };
        console.log("Params:", params);

        const response = await axios.get(
          "http://localhost:8080/api/user/search",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params,
          }
        );

        console.log("Response headers:", response.headers);
        console.log("Response data:", response.data);
        this.users = response.data;
        const totalUsers = parseInt(response.headers["x-total-count"], 10);
        if (!isNaN(totalUsers)) {
          this.totalPages = Math.ceil(totalUsers / this.usersPerPage);
        } else {
          this.totalPages = 0;
        }
        this.totalPages = Math.ceil(totalUsers / this.usersPerPage);
        console.log(
          "Total users:",
          totalUsers,
          "Total pages:",
          this.totalPages
        );
      } catch (error) {
        console.error("Error fetching filtered users:", error);
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.applyFilters();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.applyFilters();
      }
    },
    async resetFilters() {
      this.searchCriteria = {
        name: "",
        surname: "",
        email: "",
        minPostCount: null,
        maxPostCount: null,
        sortBy: "",
        sortOrder: "asc",
      };
      this.currentPage = 1;
      await this.applyFilters();
    },
  },
  async mounted() {
    await this.applyFilters();
  },
};
</script>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination-controls button {
  padding: 8px 16px;
  background-color: #d9a566;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.background-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-image: url("https://i.pinimg.com/originals/63/b7/77/63b777bb69ae070f7d112719f63b0f4d.gif"); */
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  background-color: rgba(184, 150, 78, 0.856);
  z-index: -1;
}

.all-users-container {
  width: 80%;
  margin: 0 auto;
  margin-top: 150px;
  padding: 20px;
  background-color: #faf3e0;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

@keyframes bg-scroll {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 100% 100%;
  }
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-input,
.filter-select,
.cta-button {
  padding: 8px;
  border: 1px solid #e0d8b8;
  border-radius: 5px;
  font-size: 16px;
  background-color: #f5deb3;
}

.cta-button {
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #e6c79c;
}

.reset-button {
  background-color: #d9a566;
}
.return-button {
  background-color: #d9a566;
  margin-right: 5000px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  overflow: hidden;
}

.user-table th,
.user-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.user-table th {
  background-color: #f5deb3;
  color: #333;
  font-weight: bold;
}

.user-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.user-table tr:hover {
  background-color: #f1f1f1;
}

.user-table td {
  color: #555;
}

.no-users-message {
  text-align: center;
  font-size: 18px;
  color: #555;
  padding: 20px;
}
</style>

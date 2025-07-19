<template>
  <div class="analytics-container">
    <button class="return-button" @click="goBackToHome">Return to Home</button>
    <div class="analytics-content">
      <div class="stats-box">
        <h2>Posts</h2>
        <ul>
          <li>
            <span class="stats-label">Weekly:</span>
            <span class="stats-value">{{ analytics.weeklyPosts }}</span>
          </li>
          <li>
            <span class="stats-label">Monthly:</span>
            <span class="stats-value">{{ analytics.monthlyPosts }}</span>
          </li>
          <li>
            <span class="stats-label">Yearly:</span>
            <span class="stats-value">{{ analytics.yearlyPosts }}</span>
          </li>
        </ul>

        <h2>Comments</h2>
        <ul>
          <li>
            <span class="stats-label">Weekly:</span>
            <span class="stats-value">{{ analytics.weeklyComments }}</span>
          </li>
          <li>
            <span class="stats-label">Monthly:</span>
            <span class="stats-value">{{ analytics.monthlyComments }}</span>
          </li>
          <li>
            <span class="stats-label">Yearly:</span>
            <span class="stats-value">{{ analytics.yearlyComments }}</span>
          </li>
        </ul>
      </div>

      <div class="chart-box">
        <h2>User Participation</h2>
        <canvas id="radialChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";

export default {
  name: "UserAnalytics",
  setup() {
    const analytics = ref({});
    const loading = ref(true);
    const error = ref(null);
    const chart = ref(null);
    const chartReady = ref(false);
    const router = useRouter();

    const fetchAnalytics = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        error.value = "You need to be logged in to view analytics!";
        loading.value = false;
        return;
      }

      try {
        // opsta analitika-komentari,postovi
        const analyticsResponse = await axios.get(
          "http://localhost:8080/api/analytics/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        analytics.value = analyticsResponse.data;
        //statistika aktivnosit korisnika
        const statisticsResponse = await axios.get(
          "http://localhost:8080/api/analytics/statistics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        chartReady.value = true; // spreman canvas
        await nextTick(); // renderovanje canvasa
        console.log("Statistics response:", statisticsResponse.data);

        setTimeout(() => {
          createRadialChart(statisticsResponse.data);
        }, 100);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.response && err.response.status === 403) {
          error.value = "You do not have permission to view analytics.";
        } else {
          error.value = "Failed to fetch analytics. Please try again.";
        }
      } finally {
        loading.value = false;
      }
    };

    const createRadialChart = (data) => {
      // const ctx = document.getElementById("radialChart")?.getContext("2d");

      const ctx = document.getElementById("radialChart");
      console.log("Canvas element:", ctx);
      if (!ctx) {
        console.error("Canvas element not found or not ready.");
        return;
      }

      if (chart.value) {
        chart.value.destroy();
      }

      chart.value = new Chart(ctx, {
        type: "radar",
        data: {
          labels: ["Posted", "Commented", "No Activity"],
          datasets: [
            {
              label: "User Participation (%)",
              data: [
                data.usersWithPosts || 0,
                data.usersWithOnlyComments || 0,
                data.usersWithoutActivity || 0,
              ],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top", // Pozicija legende
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                },
              },
            },
          },
          scales: {
            r: {
              angleLines: {
                display: true,
              },
              suggestedMin: 0,
              suggestedMax: 100, // Maksimalna vrednost 100%
              ticks: {
                callback: (value) => `${value}%`, // Dodaj % na oznake
              },
              grid: {
                circular: true, // Prikaz mreže u kružnom obliku
              },
            },
          },
        },
      });
    };
    const goBackToHome = () => {
      router.push("/");
    };
    onMounted(fetchAnalytics);

    return {
      analytics,
      loading,
      error,
      chartReady,
      goBackToHome,
    };
  },
};
</script>

<style scoped>
.analytics-container {
  padding: 100px;
  background-color: #fff8e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -50px;
}

.return-button {
  display: inline-block;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: #f5deb3;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.return-button:hover {
  background-color: #e6c79c;
}

.analytics-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  /* gap: 20px; */
  width: 100%;
  max-width: 1200px;
}

.stats-box {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ffb347;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
  height: 100%;
}

.stats-box h2 {
  font-size: 20px;
  color: #ffb347;
  margin-bottom: 30px;
  margin-top: 30px;
  text-align: center;
}

.stats-box ul {
  list-style-type: none;
  padding: 0;
}

.stats-box li {
  font-size: 16px;
  color: #444;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.stats-label {
  font-weight: bold;
  color: #ffb347;
}

.stats-value {
  color: #a09a9a;
  font-size: 16px;
  font-weight: bold;
}

.chart-box {
  flex: 2;
  min-width: 350px;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ffb347;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 700px;
  margin-left: 20px;
}

.chart-box h2 {
  font-size: 20px;
  color: #ffb347;
  margin-bottom: 10px;
}

canvas {
  max-width: 80%;
  height: auto;
  margin-top: 10px;
}
.background-wrapper {
  background-color: #f5f5dc;
  padding: 40px 0;
  display: flex;
  justify-content: center;
}
</style>

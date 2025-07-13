<template>
  <div>
    <h2>Chat</h2>
    <div class="chat-container">
      <div class="sidebar">
        <h3>Users</h3>
        <ul v-if="users.length > 0">
          <li
            v-for="user in users"
            :key="user.id"
            @click="toggleUserSelection(user)"
          >
            <input type="checkbox" v-model="selectedUsers" :value="user.id" />
            {{ user.username }}
          </li>
        </ul>
        <p v-else>Loading users...</p>

        <h3>Groups</h3>
        <li v-for="group in groups" :key="group.id" @click="selectGroup(group)">
          {{ group.groupName }}
        </li>
        <button v-if="selectedChat" @click="addUsersToExistingGroup">
          Add users to this group
        </button>

        <button @click="startChat">Send Message</button>
      </div>
      <div class="chat-area" v-if="selectedChat">
        <h3>{{ chatTitle }}</h3>
        <div class="chat-box">
          <div v-for="message in messages" :key="message.id" class="message">
            <strong>{{ message.senderId }}:</strong> {{ message.content }}
          </div>
        </div>
        <input v-model="newMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default {
  setup() {
    const users = ref([]);
    const messages = ref([]);
    const newMessage = ref("");
    const selectedChat = ref(null);
    const chatTitle = ref("");
    const selectedUsers = ref([]);
    let stompClient = ref(null);
    const groups = ref([]);

    onMounted(async () => {
      await fetchUsers();
      await fetchGroups();
      initializeWebSocketConnection();
    });

    const fetchGroups = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "http://localhost:8080/api/groups/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Groups for this user", groups);
        groups.value = response.data;
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    const fetchUsers = async () => {
      const token = localStorage.getItem("authToken");
      try {
        // const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:8080/api/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          users.value = response.data;
        } else {
          console.warn("Expected user list, got:", response.data);
        }

        // users.value = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const selectGroup = async (group) => {
      selectedChat.value = group;
      chatTitle.value = `Group: ${group.groupName}`;

      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `http://localhost:8080/api/groups/chat/${group.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        messages.value = response.data;
      } catch (error) {
        console.error(
          "Error while trying tho select and fetch messages:",
          error
        );
      }
    };

    const initializeWebSocketConnection = () => {
      const token = localStorage.getItem("authToken");
      const serverUrl = `http://localhost:8080/socket?token=${token}`; //povezivanje na backend
      const socket = new SockJS(serverUrl);
      stompClient.value = new Client({
        webSocketFactory: () => socket,
        // connectHeaders: {
        //   Authorization: "Bearer " + token,
        // },
        debug: (str) => console.log(str),
        onConnect: () => {
          console.log("Connected to WebSocket");
          subscribeToGlobalMessages();
          subscribeToPrivateMessages();
        },
      });
      stompClient.value.activate();
    };

    const subscribeToGlobalMessages = () => {
      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.subscribe("/socket-publisher", (message) => {
          console.log("New global message:" + JSON.parse(message.body));
          messages.value.push(JSON.parse(message.body));
        });
      }
    };
    const subscribeToPrivateMessages = () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.subscribe(
          `/socket-publisher/${userId}`,
          (message) => {
            console.log("Private message:", JSON.parse(message.body));
            messages.value.push(JSON.parse(message.body));
          }
        );
      }
    };

    const startChat = async () => {
      console.log("Token:", localStorage.getItem("authToken")); // Provera da li token postoji
      const token = localStorage.getItem("authToken");

      if (selectedUsers.value.length === 1) {
        selectedChat.value = selectedUsers.value[0];
        chatTitle.value = `Chat with: ${
          users.value.find((u) => u.id === selectedUsers.value[0]).username
        }`;
      } else if (selectedUsers.value.length > 1) {
        const groupName = prompt("Enter group name:");
        if (!groupName) return;

        try {
          const groupDTO = {
            groupName: groupName,
            memberUsernames: selectedUsers.value
              .map((userId) => {
                const user = users.value.find((u) => u.id === userId);
                return user ? user.username : null;
              })
              .filter((username) => username !== null),
          };

          const response = await axios.post(
            "http://localhost:8080/api/groups/create",
            groupDTO,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Created group:", response.data);
          selectedChat.value = response.data;
          chatTitle.value = `Group: ${groupName}`;

          //dodato
          await fetchGroups();
          await fetchUsers();
        } catch (error) {
          console.error("Error creating group:", error);
          if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
          }
        }
      }
    };

    const addUsersToExistingGroup = async () => {
      const token = localStorage.getItem("authToken");
      if (!selectedChat.value || selectedUsers.value.length === 0) {
        alert("Please select a group and at least one user.");
        return;
      }

      try {
        for (const userId of selectedUsers.value) {
          const user = users.value.find((u) => u.id === userId);
          if (!user) continue;

          await axios.put(
            `http://localhost:8080/api/groups/addUser/${selectedChat.value.id}`,
            { userId: userId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
        alert("Users added to group.");
        await fetchGroups();
        await selectGroup(selectedChat.value);
      } catch (error) {
        alert("Failed to add users");
      }
    };
    // const sendMessage = async () => {
    //   if (!newMessage.value.trim()) return;
    //   const loggedInUser=parseInt(localStorage.getItem('userId'));
    //   const message = {
    //     content: newMessage.value,
    //     senderId: loggedInUser,
    //     groupId: selectedChat.value.id,
    //   };
    //   try {
    //     const token = localStorage.getItem("authToken");
    //     await axios.post('http://localhost:8080/api/groups/send', message, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     newMessage.value = '';
    //     console.log("Poruka je poslata:",message);
    //   } catch (error) {
    //     console.error('Error sending message:', error);
    //   }
    // };
    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      const loggedInUser = parseInt(localStorage.getItem("userId"));
      const token = localStorage.getItem("authToken");
      const message = {
        content: newMessage.value,
        senderId: loggedInUser,
        groupId: selectedChat.value.id,
      };

      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.publish({
          destination: "/socket-subscriber/send/message",
          body: JSON.stringify(message),
        });

        console.log("Message sent successfully ", message);
      } else {
        console.error("WebSocket is not connected");
      }

      try {
        await axios.post("http://localhost:8080/api/groups/send", message, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Message saved to database", message);
      } catch (error) {
        console.error("Failed to save message to database", error);
      }

      newMessage.value = ""; // Resetuj polje unosa poruke
    };

    const toggleUserSelection = (user) => {
      const index = selectedUsers.value.indexOf(user.id);
      if (index === -1) {
        selectedUsers.value.push(user.id);
      } else {
        selectedUsers.value.splice(index, 1);
      }
    };

    return {
      users,
      messages,
      newMessage,
      selectedChat,
      chatTitle,
      selectedUsers,
      startChat,
      sendMessage,
      toggleUserSelection,
      selectGroup,
      groups,
      addUsersToExistingGroup,
    };
  },
};
</script>

<style>
.chat-container {
  display: flex;
}
.sidebar {
  width: 200px;
  border-right: 1px solid #ccc;
  padding: 10px;
}
.chat-area {
  flex: 1;
  padding: 10px;
}
.chat-box {
  border: 1px solid #ccc;
  height: 300px;
  overflow-y: scroll;
  padding: 10px;
}
.message {
  margin-bottom: 5px;
}
</style>

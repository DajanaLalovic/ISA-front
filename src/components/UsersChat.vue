<template>
  <div class="chat-wrapper">
    <aside class="sidebar">
      <img src="@/style/SIGNUP.png" alt="Bunny Image" class="bunny-image-top" />
      <button class="new-chat-btn" @click="creatingNewChat = true">
        ➕ Start New Chat
      </button>

      <section v-if="creatingNewChat" class="user-select">
        <h3>Select Users 🐰</h3>
        <div class="scrollable-list">
          <ul>
            <li v-if="filteredUsers.length === 0" class="empty-state">
              No users to add
            </li>
            <li v-for="user in filteredUsers" :key="user.id">
              <label>
                <input
                  type="checkbox"
                  v-model="selectedUsers"
                  :value="user.id"
                />
                {{ user.username }}
              </label>
            </li>
          </ul>
        </div>
        <button class="confirm-btn" @click="startChat">Start Chat</button>
      </section>

      <section>
        <h3>Groups</h3>
        <ul class="scrollable-list">
          <li v-if="groups.length === 0" class="empty-state">No groups yet</li>
          <li
            v-for="group in groups"
            :key="group.id"
            @click="selectGroup(group)"
          >
            🧁 {{ group.groupName }}
          </li>
        </ul>
      </section>

      <section>
        <h3>Direct Messages</h3>
        <ul class="scrollable-list">
          <li v-if="directChats.length === 0" class="empty-state">
            No conversations yet
          </li>
          <li v-for="dm in directChats" :key="dm.id" @click="selectGroup(dm)">
            <strong>{{ getOtherUsername(dm) }}</strong
            ><br />
            <small>{{ getLastMessage(dm.id) }}</small>
          </li>
        </ul>
      </section>

      <div class="sidebar-bottom">
        <button class="return-btn" @click="$router.back()">⬅ Return</button>
      </div>
    </aside>

    <main class="chat-main" v-if="selectedChat">
      <header class="chat-header">
        <img
          src="@/style/bunny.png"
          alt="Chat Bunny"
          class="chat-bunny-large"
        />
        <h3>{{ chatTitle }}</h3>
        <div
          v-if="selectedChat.groupName && isGroupOwner"
          class="group-actions"
        >
          <button @click="toggleAddUsers">➕</button>
          <button @click="toggleRemoveUsers">➖</button>
        </div>
      </header>

      <section v-if="showAddUsers" class="user-list modern-box">
        <h4>Add Members</h4>
        <ul>
          <li v-if="usersNotInGroup.length === 0" class="empty-state">
            No users to add
          </li>
          <li v-for="user in usersNotInGroup" :key="user.id">
            <label>
              <input type="checkbox" v-model="selectedUsers" :value="user.id" />
              {{ user.username }}
            </label>
          </li>
        </ul>
        <button class="confirm-btn glowing" @click="addUsersToGroup">
          Add
        </button>
      </section>

      <section v-if="showRemoveUsers" class="user-list modern-box">
        <h4>Remove Members</h4>
        <ul>
          <li v-if="removableUsers.length === 0" class="empty-state">
            No users to remove
          </li>
          <li v-for="user in removableUsers" :key="user.id">
            {{ user.username }}
            <button class="remove-btn" @click="removeUserFromGroup(user.id)">
              Remove
            </button>
          </li>
        </ul>
      </section>

      <section class="chat-box">
        <div
          v-for="message in sortedMessages"
          :key="message.id"
          :class="[
            'message',
            message.senderId === loggedInUserId ? 'self' : 'other',
          ]"
        >
          <strong>{{ getUsername(message.senderId) }}</strong
          ><br />
          {{ message.content }}
        </div>
      </section>

      <div class="input-area-row">
        <input v-model="newMessage" placeholder="Type your message..." />
        <button class="send-btn" @click="sendMessage">Send 📨</button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Swal from "sweetalert2";

export default {
  setup() {
    const users = ref([]);
    const messages = ref([]);
    const newMessage = ref("");
    const selectedChat = ref(null);
    const chatTitle = ref("");
    const selectedUsers = ref([]);
    const stompClient = ref(null);
    const groups = ref([]);
    const directChats = ref([]);
    const creatingNewChat = ref(false);
    const loggedInUserId = parseInt(localStorage.getItem("userId"));
    const usersToAdd = ref([]);
    const showAddUsers = ref(false);
    const showRemoveUsers = ref(false);

    onMounted(async () => {
      await fetchUsers();
      await fetchGroups();
      await fetchDirectChats();
      for (const chat of directChats.value) {
        const token = localStorage.getItem("authToken");
        try {
          const res = await axios.get(
            `http://localhost:8080/api/groups/chat/${chat.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          messages.value.push(...res.data);
        } catch (error) {
          console.error(`Error fetching messages for chat ${chat.id}`, error);
        }
      }
      initializeWebSocketConnection();
    });

    const filteredUsers = computed(() =>
      users.value.filter((u) => u.id !== loggedInUserId && u.isActive)
    );
    const fetchDirectChats = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "http://localhost:8080/api/groups/direct",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        directChats.value = response.data;
      } catch (error) {
        console.error("Error fetching direct chats:", error);
      }
    };

    const sortedMessages = computed(() =>
      [...messages.value].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
    );
    const getLastMessage = (groupId) => {
      const relevant = messages.value
        .filter((m) => m.groupId === groupId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return relevant[0]?.content || "";
    };

    const getUsername = (id) => {
      const user = users.value.find((u) => u.id === id);
      return user ? user.username : `User ${id}`;
    };

    // const getOtherUsername = (chat) => {
    //   const other = chat.participants?.find((u) => u !== loggedInUserId);
    //   const user = users.value.find((u) => u.id === other);
    //   return user ? user.username : "Unknown";
    // };
    const getOtherUsername = (chat) => {
      const usernames = chat.memberUsernames || [];
      const otherUsername = usernames.find((u) => {
        const user = users.value.find((usr) => usr.username === u);
        return user && user.id !== loggedInUserId;
      });
      return otherUsername || "Unknown";
    };

    const fetchUsers = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:8080/api/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        users.value = response.data.filter((user) => user.role !== "ADMIN");

        // users.value = response.data;
        console.log("Svi korisnici:", response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchGroups = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "http://localhost:8080/api/groups/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        groups.value = response.data.filter((g) => g.groupName); // samo grupe sa imenom
        directChats.value = response.data.filter((g) => !g.groupName); // direktni čatovi
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    const selectGroup = async (group) => {
      selectedChat.value = group;
      console.log("SELECTED CHAT:", JSON.stringify(group, null, 2)); // 🔍 Dodaj OVO

      chatTitle.value = group.groupName
        ? `Group: ${group.groupName}`
        : `Chat with: ${getOtherUsername(group)}`;

      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `http://localhost:8080/api/groups/chat/${group.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        messages.value = response.data;
        creatingNewChat.value = false;
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const initializeWebSocketConnection = () => {
      const token = localStorage.getItem("authToken");
      const socket = new SockJS(`http://localhost:8080/socket?token=${token}`);
      stompClient.value = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log(str),
        onConnect: () => {
          subscribeToGlobalMessages();
          subscribeToPrivateMessages();
        },
      });
      stompClient.value.activate();
    };

    const subscribeToGlobalMessages = () => {
      stompClient.value.subscribe("/socket-publisher", (message) => {
        messages.value.push(JSON.parse(message.body));
      });
    };

    const subscribeToPrivateMessages = () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      stompClient.value.subscribe(`/socket-publisher/${userId}`, (message) => {
        messages.value.push(JSON.parse(message.body));
      });
    };

    // const startChat = async () => {
    //   const token = localStorage.getItem("authToken");

    //   if (selectedUsers.value.length === 1) {
    //     selectedChat.value = selectedUsers.value[0];
    //     chatTitle.value = `Chat with: ${
    //       users.value.find((u) => u.id === selectedUsers.value[0]).username
    //     }`;
    //   } else if (selectedUsers.value.length > 1) {
    //     const groupName = prompt("Enter group name:");
    //     if (!groupName) return;

    //     try {
    //       const groupDTO = {
    //         groupName: groupName,
    //         memberUsernames: selectedUsers.value
    //           .map((userId) => {
    //             const user = users.value.find((u) => u.id === userId);
    //             return user ? user.username : null;
    //           })
    //           .filter((username) => username !== null),
    //       };

    //       const response = await axios.post(
    //         "http://localhost:8080/api/groups/create",
    //         groupDTO,
    //         {
    //           headers: { Authorization: `Bearer ${token}` },
    //         }
    //       );

    //       console.log("Created group:", response.data);
    //       selectedChat.value = response.data;
    //       chatTitle.value = `Group: ${groupName}`;

    //       //dodato
    //       await fetchGroups();
    //       await fetchUsers();
    //     } catch (error) {
    //       console.error("Error creating group:", error);
    //       if (error.response) {
    //         console.error("Response status:", error.response.status);
    //         console.error("Response data:", error.response.data);
    //       }
    //     }
    //   }
    // };
    const startChat = async () => {
      const token = localStorage.getItem("authToken");
      console.log(" Sending token:", token);

      if (selectedUsers.value.length === 1) {
        const otherUserId = selectedUsers.value[0];

        try {
          const response = await axios.post(
            "http://localhost:8080/api/groups/directChat",
            {
              userId1: loggedInUserId,
              userId2: otherUserId,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          selectedChat.value = response.data;
          chatTitle.value = `Chat with: ${
            users.value.find((u) => u.id === otherUserId).username
          }`;

          await fetchGroups();
          await selectGroup(response.data);
          creatingNewChat.value = false;
        } catch (err) {
          console.error("Error starting direct chat", err);
        }
      } else if (selectedUsers.value.length > 1) {
        // const groupName = prompt("Enter group name:");
        const { value: groupName } = await Swal.fire({
          title: "🐰 Create Your Group!",
          input: "text",
          inputLabel: "Choose a fun group name",
          inputPlaceholder: "e.g. Bunny Squad",
          confirmButtonText: "Create Group",
          background: "#fffaf2",
          confirmButtonColor: "#ffb56b",
          showCancelButton: true,
          cancelButtonColor: "#ccc",
          inputAttributes: {
            maxlength: 30,
            autocapitalize: "off",
            autocorrect: "off",
          },
        });

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

          selectedChat.value = response.data;
          chatTitle.value = `Group: ${groupName}`;

          await fetchGroups();
          await fetchUsers();
          creatingNewChat.value = false;
        } catch (error) {
          console.error("Error creating group:", error);
        }
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      const message = {
        content: newMessage.value,
        senderId: loggedInUserId,
        groupId: selectedChat.value.id,
      };

      const token = localStorage.getItem("authToken");

      if (stompClient.value && stompClient.value.connected) {
        stompClient.value.publish({
          destination: "/socket-subscriber/send/message",
          body: JSON.stringify(message),
        });
      }

      try {
        await axios.post("http://localhost:8080/api/groups/send", message, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Failed to save message to DB:", error);
      }

      newMessage.value = "";
    };
    const groupMembers = computed(() =>
      users.value.filter((u) =>
        selectedChat.value?.memberUsernames?.includes(u.username)
      )
    );
    const isGroupOwner = computed(() => {
      return selectedChat.value?.adminId === loggedInUserId;
    });

    const removeUserFromGroup = async (userIdToRemove) => {
      const token = localStorage.getItem("authToken");
      try {
        await axios.put(
          `http://localhost:8080/api/groups/removeUser/${selectedChat.value.id}`,
          { userId: userIdToRemove },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchGroups();
        // await selectGroup(selectedChat.value);
        const updated = groups.value.find(
          (g) => g.id === selectedChat.value.id
        );
        if (updated) {
          await selectGroup(updated);
        }
        showRemoveUsers.value = false;
        selectedUsers.value = [];

        Swal.fire({
          icon: "success",
          title: "User Removed",
          text: "User has been successfully removed from the group.",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to remove user.",
        });
      }
    };

    const usersNotInGroup = computed(() => {
      if (!selectedChat.value || !selectedChat.value.memberUsernames) return [];
      return users.value.filter(
        (u) =>
          !selectedChat.value.memberUsernames.includes(u.username) &&
          u.id !== loggedInUserId
      );
    });

    // const addUsersToGroup = async () => {
    //   const token = localStorage.getItem("authToken");
    //   try {
    //     for (const userId of usersToAdd.value) {
    //       await axios.put(
    //         `http://localhost:8080/api/groups/addUser/${selectedChat.value.id}`,
    //         { userId },
    //         {
    //           headers: { Authorization: `Bearer ${token}` },
    //         }
    //       );
    //     }
    //     await fetchGroups();
    //     await selectGroup(selectedChat.value);
    //     showAddUsers.value = false;
    //     usersToAdd.value = [];

    //     Swal.fire({
    //       icon: "success",
    //       title: "Users Added",
    //       text: "Selected users have been successfully added.",
    //     });
    //   } catch (err) {
    //     Swal.fire({
    //       icon: "error",
    //       title: "Oops...",
    //       text: "Failed to add users.",
    //     });
    //   }
    // };
    const addUsersToGroup = async () => {
      const token = localStorage.getItem("authToken");
      if (!selectedChat.value || selectedUsers.value.length === 0) {
        Swal.fire("Please select a group and at least one user.");
        return;
      }

      try {
        for (const userId of selectedUsers.value) {
          const user = users.value.find((u) => u.id === userId);
          if (!user) continue;

          await axios.put(
            `http://localhost:8080/api/groups/addUser/${selectedChat.value.id}`,
            { userId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }

        await fetchGroups();
        // await selectGroup(selectedChat.value);
        await fetchGroups();
        const updated = groups.value.find(
          (g) => g.id === selectedChat.value.id
        );
        if (updated) {
          await selectGroup(updated);
        }

        selectedUsers.value = [];
        showAddUsers.value = false;

        Swal.fire("Users added to group.");
      } catch (error) {
        Swal.fire("Failed to add users");
      }
    };
    const removableUsers = computed(() => {
      return groupMembers.value.filter((u) => u.id !== loggedInUserId);
    });

    const toggleAddUsers = () => {
      showAddUsers.value = !showAddUsers.value;
      showRemoveUsers.value = false;
      // usersToAdd.value = [];
      usersToAdd.value = users.value.filter(
        (user) =>
          user.role?.toUpperCase() !== "ADMIN" &&
          !groupMembers.value.some((member) => member.id === user.id)
      );
    };

    //nes

    const toggleRemoveUsers = () => {
      showRemoveUsers.value = !showRemoveUsers.value;
      showAddUsers.value = false;
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
      selectGroup,
      filteredUsers,
      sortedMessages,
      getUsername,
      getOtherUsername,
      groups,
      directChats,
      creatingNewChat,
      loggedInUserId,
      removeUserFromGroup,
      groupMembers,
      addUsersToGroup,
      usersNotInGroup,
      showAddUsers,
      showRemoveUsers,
      toggleAddUsers,
      toggleRemoveUsers,
      usersToAdd,
      removableUsers,
      isGroupOwner,
      getLastMessage,
    };
  },
};
</script>

<style scoped>
.chat-wrapper {
  display: flex;
  height: 100vh;
  background-color: #fffaf2;
  font-family: "Roboto", sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 22%;
  background-color: #fff5e6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #f1d3b3;
  position: relative;
}

.sidebar-bottom {
  position: absolute;
  bottom: 10px;
  left: 16px;
  right: 16px;
}

.scrollable-list {
  max-height: 150px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ff9f43 #fff5e6;
}

.scrollable-list::-webkit-scrollbar {
  width: 6px;
}
.scrollable-list::-webkit-scrollbar-thumb {
  background-color: #ff9f43;
  border-radius: 10px;
}
.scrollable-list::-webkit-scrollbar-track {
  background: #fff5e6;
}

.sidebar h3 {
  color: #e67e22;
  margin-top: 20px;
  border-bottom: 1px solid #e0d8b8;
  padding-bottom: 4px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  background-color: #ffe5b4;
  padding: 8px 10px;
  margin: 6px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sidebar li:hover {
  background-color: #ffd699;
}

.return-btn,
.confirm-btn,
.new-chat-btn,
.input-area button {
  background-color: #fbbd75;
  color: white;
  padding: 10px 14px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  width: 100%;
  box-shadow: 0 0 8px rgba(255, 159, 67, 0.3);
}

.return-btn:hover,
.confirm-btn:hover,
.new-chat-btn:hover,
.input-area button:hover {
  background-color: #ffa94d;
  box-shadow: 0 0 12px rgba(255, 144, 30, 0.6);
}

.glowing {
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 6px rgba(255, 180, 60, 0.4);
  }
  to {
    box-shadow: 0 0 14px rgba(255, 180, 60, 0.8);
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #fff;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chat-header h3 {
  margin: 0;
  color: #d35400;
}

.chat-bunny-large {
  height: 80px;
  width: 80px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 12px;
}

.group-actions button {
  background: #ffe0b2;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 8px;
}

.group-actions button:hover {
  background-color: #ffcc80;
}

.user-list.modern-box {
  background-color: #fff5e6;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e0d8b8;
  margin-bottom: 20px;
}

.user-list ul {
  padding: 0;
  list-style: none;
}

.user-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.remove-btn:hover {
  background-color: #c0392b;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background-color: #fffaf0;
  border: 1px solid #f1d3b3;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.send-btn {
  width: 100px;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 12px;
  align-self: center;
  background-color: #fbbd75;
  color: white;
  border: none;
  cursor: pointer;
  /* transition: background-color 0.3s; */
}

.message {
  max-width: 75%;
  padding: 14px;
  margin: 10px 0;
  border-radius: 16px;
  font-size: 15px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
.message.self {
  align-self: flex-end;
  background-color: #ffe0b2;
  text-align: right;
  width: 309px;
}

.message.other {
  align-self: flex-start;
  background-color: #ffcc80;
  text-align: left;
  width: 309px;
}

/* .input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
}

.input-area input {
  width: 100%;
  max-width: 600px;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
} */

.bunny-image-top {
  width: 90px;
  height: 90px;
  margin: 0 auto 10px auto;
  border-radius: 50%;
  object-fit: cover;
}
.input-area-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.input-area-row input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 16px;
  max-width: 80%;
}

.empty-state {
  font-style: italic;
  color: #aaa;
  text-align: center;
  padding: 10px;
}
</style>

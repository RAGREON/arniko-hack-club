const socket = io();

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Send message to server
sendBtn.addEventListener("click", () => {
  const msg = messageInput.value;
  if (msg.trim() !== "") {
    socket.emit("chat message", msg);
    messageInput.value = "";
  }
});

// Display messages from server
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; // auto-scroll
});

import io from "/socket.io/socket.io.js";

const socket = io();

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startBtn = document.getElementById("startBtn");

let pc;
let localStream;
let room = "testRoom";

startBtn.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  pc = new RTCPeerConnection();

  // Add local tracks to peer connection
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // Remote stream handler
  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { candidate: event.candidate, target: otherId });
    }
  };

  socket.emit("join", room);
};

// Socket events
let otherId;

socket.on("room-joined", ({ id }) => {
  otherId = id === socket.id ? null : id;

  if (otherId) {
    createOffer();
  }
});

async function createOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("offer", { sdp: offer, target: otherId });
}

socket.on("offer", async ({ sdp, from }) => {
  otherId = from;
  await pc.setRemoteDescription(sdp);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { sdp: answer, target: otherId });
});

socket.on("answer", async ({ sdp }) => {
  await pc.setRemoteDescription(sdp);
});

socket.on("ice-candidate", async ({ candidate }) => {
  if (candidate) {
    await pc.addIceCandidate(candidate);
  }
});

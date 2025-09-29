// client.js
import { io } from "socket.io-client";

class Peer {
  constructor(id, role, socket) {
    this.id = id;
    this.role = role;
    this.socket = socket;
    this.pc = new RTCPeerConnection();

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.socket.emit("ice-candidate", {
          targetId: this.targetId,
          candidate: e.candidate,
        });
      }
    };

    this.pc.ontrack = (e) => {
      // Viewer receives stream
      const video = document.getElementById("remoteVideo");
      video.srcObject = e.streams[0];
    };
  }

  async makeOffer(stream, targetId) {
    this.targetId = targetId;
    stream.getTracks().forEach((t) => this.pc.addTrack(t, stream));

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.socket.emit("webrtc-offer", { targetId, offer });
  }

  async handleOffer(from, offer) {
    this.targetId = from;
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.socket.emit("webrtc-answer", { targetId: from, answer });
  }

  async handleAnswer(answer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    if (candidate) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }
}

class ScreenShareClient {
  constructor(serverUrl, roomId, role) {
    this.socket = io(serverUrl);
    this.roomId = roomId;
    this.role = role;
    this.peerConnections = new Map(); // viewerId -> Peer

    this.socket.on("connect", () => {
      console.log("Connected:", this.socket.id);
      this.socket.emit("join-room", { roomId: this.roomId, role: this.role });
    });

    this.setupSocketEvents();
  }

  setupSocketEvents() {
    // Host notified when a new viewer joins
    this.socket.on("new-viewer", async ({ viewerId }) => {
      if (this.role !== "host") return;

      const peer = new Peer(this.socket.id, "host", this.socket);
      this.peerConnections.set(viewerId, peer);

      // Capture screen
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      await peer.makeOffer(stream, viewerId);
    });

    // When receiving an offer (viewer side)
    this.socket.on("webrtc-offer", async ({ from, offer }) => {
      if (this.role !== "viewer") return;

      const peer = new Peer(this.socket.id, "viewer", this.socket);
      this.peerConnections.set(from, peer);
      await peer.handleOffer(from, offer);
    });

    // When receiving an answer (host side)
    this.socket.on("webrtc-answer", async ({ from, answer }) => {
      const peer = this.peerConnections.get(from);
      if (peer) await peer.handleAnswer(answer);
    });

    // ICE candidates
    this.socket.on("ice-candidate", async ({ from, candidate }) => {
      const peer = this.peerConnections.get(from);
      if (peer) await peer.addIceCandidate(candidate);
    });
  }
}

// ----- Usage Example -----
/*
Host side:
  new ScreenShareClient("http://localhost:8080", "room1", "host");

Viewer side:
  new ScreenShareClient("http://localhost:8080", "room1", "viewer");
*/

import express from "express";
import http from 'http'
import { Server as SocketServer } from "socket.io";

class Client {
	constructor(socket, role = "viewer") {
		this.socket = socket;
		this.id = socket.id;
		this.role = role;
	}

	send(event, data) {
		this.socket.emit(event, data);
	}
}

class Room {
	constructor(id) {
		this.id = id;
		this.host = null;
		this.viewers = new Map();
	}

	addClient(client) {
		if (client.role == "host") {
			this.host = client;
		}
	}
}

class ScreenShareServer {
	constructor(port) {
		this.app = express();
		this.port = port;
		this.httpServer = http.createServer(this.app);
		this.io = new SocketServer(this.httpServer, { cors: { origin: "*" } });
		this.rooms = new Map();

		this.setupSocket();
	}

	setupSocket() {
		this.io.on("connection", ({ roomId, role }) => {
			currentRoomId = roomId;
			currentClient = new Client(socket, role);

			let room = this.rooms.get(roomId);
			if (!room) {
				room = new Room(roomId);
				this.rooms.set(roomId, room);
			}

			room.addClient(currentClient);
			console.log(`${role} joined room ${roomId}`);

			if (role === "viewer" && room.host) {
				room.host.send("new-viewer", { viewerId: socket.id });
			}

			socket.on("webrtc-offer", ({ targetId, offer }) => {
				// Forward offer to target client
				const room = this.rooms.get(currentRoomId);
				if (room) {
					const target =
						room.viewers.get(targetId) ||
						(room.host?.id === targetId ? room.host : null);
					target?.send("webrtc-offer", { from: socket.id, offer });
				}
			});

			socket.on("webrtc-answer", ({ targetId, answer }) => {
				const room = this.rooms.get(currentRoomId);
				if (room) {
					const target =
						room.viewers.get(targetId) ||
						(room.host?.id === targetId ? room.host : null);
					target?.send("webrtc-answer", { from: socket.id, answer });
				}
			});

			socket.on("ice-candidate", ({ targetId, candidate }) => {
				const room = this.rooms.get(currentRoomId);
				if (room) {
					const target =
						room.viewers.get(targetId) ||
						(room.host?.id === targetId ? room.host : null);
					target?.send("ice-candidate", { from: socket.id, candidate });
				}
			});

			socket.on("disconnect", () => {
				console.log("Client disconnected:", socket.id);
				const room = this.rooms.get(currentRoomId);
				room?.removeClient(socket.id);

				// Optional: remove empty rooms
				if (room && !room.host && room.viewers.size === 0) {
					this.rooms.delete(currentRoomId);
				}
			});
		});
	}
 
	start() {
		this.httpServer.listen(this.port, () => {
			console.log(`Server running on port ${this.port}`);
		});
	}
}

const server = new ScreenShareServer(8080)
server.start()
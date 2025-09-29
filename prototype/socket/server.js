import express from "express";
import { app, PORT, streamHosts } from "../server/app.js";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

app.use(express.static("public"));

io.on("connection", (socket) => {
	console.log("user connected:", socket.id);

	socket.on("send_rtc_desc", ({ to, description }) => {
		console.log(`RTC desc from ${socket.id} to ${to}`);
		io.to(to).emit("rtc_desc", { from: socket.id, description });
	});

	socket.on("disconnect", () => {
		console.log("user disconnected:", socket.id);
	});
});

httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));

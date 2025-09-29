import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const streamHosts = {};

app.post("/new", (req, res) => {
	const __HOST_UUID__ = crypto.randomUUID();
	const { offer, socketId } = req.body;

	console.log("body socket id:", socketId);

	streamHosts[__HOST_UUID__] = {
		uuid: __HOST_UUID__,
		createdAt: Date.now(),
		ip: req.ip,
		offer: offer,
    socketId: socketId
	};

	res.json({
		uuid: __HOST_UUID__,
		offer: offer,
    socketId: socketId
	});
});

app.post("/remote-offer", (req, res) => {
	const { uuid } = req.body;

	if (!streamHosts[uuid]) {
		res.status(400).json({
			status: "error",
			description: `could not find host with uuid: ${uuid}`,
		});
	}

	const remoteOffer = streamHosts[uuid].offer;

	res.status(200).json({
		status: "success",
		description: "answered host's offer",
		remoteOffer: remoteOffer,
	});
});

app.post("/send-description", (req, res) => {
	const { uuid, description } = req.body;

	if (!description) {
		return res.status(400).json({
			status: "error",
			description: "empty description",
		});
	}

	if (!streamHosts[uuid]) {
		res.status(400).json({
			status: "error",
			description: `could not find host with uuid: ${uuid}`,
		});
	}

  const socketId = streamHosts[uuid].socketId

	res.status(200).json({
		socketId: socketId,
		description: description,
	});
});

export { app, PORT, streamHosts };

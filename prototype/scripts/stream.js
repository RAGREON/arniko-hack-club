import "../rtc/index.js";
import { makeOffer } from "../rtc/index.js";
import { waitForSocket } from "../socket/client.js";

const PORT = 8080;

let activeDimension = null;
let __HOST_UUID__ = null;

let url = `http://localhost:${PORT}`;

const streamButton = document.getElementById("stream");
const videoPlayback = document.querySelector(".playback");

const registerStream = async () => {
	const offer = await makeOffer();
	console.log("offer:", offer);

	const socketId = await waitForSocket();
  console.log("socket id:", socketId)

	const requestBody = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			offer: offer,
			socketId: socketId, 
		}),
	};

	const response = await fetch(`${url}/new`, requestBody);

	if (!response.ok) throw new Error("HTTP error:", response.statusText);

	const data = await response.json();

	__HOST_UUID__ = data.uuid;

	console.log("host uuid:", __HOST_UUID__);
	console.log("host socket id:", data.socketId);
};

streamButton.addEventListener("click", async () => {
	alert("starting stream");

	try {
		if (!activeDimension) {
			alert("Please select a dimension!!");
			return;
		}

		const streamWidth = parseInt(activeDimension.getAttribute("width"));
		const streamHeight = parseInt(activeDimension.getAttribute("height"));

		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				width: streamWidth,
				height: streamHeight,
			},
		});

		videoPlayback.srcObject = stream;

		videoPlayback.width = streamWidth;
		videoPlayback.height = streamHeight;

		await registerStream();
	} catch (err) {
		console.error("error setting display media: ", err);
	}
});

const videoDimensions = document.querySelectorAll(".video-dimensions li");

for (const dimension of videoDimensions) {
	dimension.addEventListener("click", () => {
		activeDimension?.classList.remove("active");

		activeDimension = dimension;
		activeDimension.classList.add("active");
	});
}

import { pc } from "../rtc/index.js";

export const socket = io("http://localhost:8080");

pc.ontrack = (event) => {
  const remoteVideo = document.getElementById("remoteVideo");
  if (remoteVideo) remoteVideo.srcObject = event.streams[0];
};

socket.on("connect", () => {
	console.log("connected to server");
	console.log("socket id:", socket.id);
});

socket.on("message", (msg) => {
	console.log("message from server:", msg);
});

socket.on("rtc_desc", async ({ from, description }) => {
  if (description.type === "offer") {
    await pc.setRemoteDescription(description);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendRtcDescription(from, answer);
  } else if (description.candidate) {
    await pc.addIceCandidate(description.candidate);
  }
});

// socket.on("rtc_desc", async ({ from, description }) => {
// 	if (description.type === "answer") {
// 		await pc.setRemoteDescription(description);
//     console.log("established connection:", from)
// 	}
//   else if (description.candidate) {
//     await pc.addIceCandidate(description.candidate)
//   }
// });

export const sendRtcDescription = (to, description) => {
	socket.emit("send_rtc_desc", { to, description });
};

export const waitForSocket = () => {
	return new Promise((resolve, reject) => {
		if (socket.connected) {
			return resolve(socket.id);
		}

		socket.once("connect", () => resolve(socket.id));
		socket.once("connect_error", (err) => reject(err));
	});
};

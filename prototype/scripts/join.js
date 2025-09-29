import { makeAnswer } from "../rtc/index.js";
import { socket } from "../socket/client.js";

const PORT = 8080;

const joinButton = document.getElementById("join");

let url = `http://localhost:${PORT}`;

const sendDescription = async (uuid, desc) => {
	const requestBody = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
      uuid: uuid,
			description: desc,
		}),
	};

	const response = await fetch(`${url}/send-description`, requestBody);

  const data = await response.json()

  console.log("remote host socket id:", data.socketId)
  console.log("description:", data.description)

  socket.emit("send_rtc_desc", { to: data.socketId, description: data.description })
};

joinButton.addEventListener("click", async () => {
	const __HOST_UUID__ = document.querySelector("#uuid-input").value;

	const requestBody = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			uuid: __HOST_UUID__,
		}),
	};

	const response = await fetch(`${url}/remote-offer`, requestBody);

	const data = await response.json();

	if (!response.ok) {
		console.error("error:", data.description);
		return;
	}

	console.log("success:", data.description);
	console.log("remote offer:", data.remoteOffer);

	const answer = await makeAnswer(data.remoteOffer);

	await sendDescription(__HOST_UUID__, answer);

	console.log(__HOST_UUID__);
});

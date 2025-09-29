export let peers = {}; // key = clientId, value = { pc, channel }

export const createPeer = (clientId) => {
  let pc = new RTCPeerConnection();

  let channel = pc.createDataChannel("test");
  channel.onmessage = (ev) => console.log(clientId, "says:", ev.data);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      // send ICE to signaling server
      sendIceCandidate(clientId, e.candidate);
    }
  };

  peers[clientId] = { pc, channel };
  return pc;
};

export const makeOffer = async (clientId) => {
  const { pc } = peers[clientId];
  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
};

export const makeAnswer = async (clientId, remoteOffer) => {
  const { pc } = peers[clientId];
  await pc.setRemoteDescription(remoteOffer);
  let answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
};

export const setRemote = async (clientId, desc) => {
  const { pc } = peers[clientId];
  await pc.setRemoteDescription(desc);
};

export const send = (clientId, msg) => {
  peers[clientId].channel.send(msg);
  console.log("you to", clientId, ":", msg);
};

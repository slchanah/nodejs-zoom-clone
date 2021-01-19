const socket = io();

let videoGrid = document.getElementById('video-grid');

let myVideoStream;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
});

const myVideoElement = document.createElement('video');
myVideoElement.muted = true;

const addVideoStream = (videoElement, stream) => {
  videoElement.srcObject = stream;
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
  });
  videoGrid.append(videoElement);
};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((myStream) => {
    addVideoStream(myVideoElement, myStream);
    myVideoStream = myStream;

    peer.on('call', (call) => {
      call.answer(myStream);
      const peerVideoElement = document.createElement('video');
      call.on('stream', (peerStream) => {
        addVideoStream(peerVideoElement, peerStream);
      });
    });
  })
  .catch((err) => {
    console.error(err);
  });

socket.on('user-connected', (userId) => {
  connectToNewUser(userId, myVideoStream);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const peerVideoElement = document.createElement('video');
  call.on('stream', (peerVideoStream) => {
    addVideoStream(peerVideoElement, peerVideoStream);
  });
};

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

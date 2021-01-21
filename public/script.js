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

    // input value
    let text = $('input');
    // when press enter send message
    $('html').keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
      }
    });
    socket.on('createMessage', (message) => {
      $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
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

const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

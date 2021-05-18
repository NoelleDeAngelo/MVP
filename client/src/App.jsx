import React from 'react'
import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3000');
import Peer from 'peerjs'
const myPeer = new Peer(undefined, {host: '/', port: '3001'})


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount(){
    const peers = {};
    var myVideo = document.createElement('video');
    myVideo.muted= true;
    myVideo.id = 'myvid'

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    .then(stream =>{
      this.addCallerVideo(myVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        var video = document.createElement('video');
        call.on('stream', callerVideoStream =>{
          this.addCallerVideo(video, callerVideoStream)
        })
      })


    socket.on('user-connected', userId => {
      this.connectToNewUser(userId, stream)
    })
  })

  socket.on('user-disconnect', userId=>{
    console.log('disconected user'+ userId)
  })

    myPeer.on('open', userId=>{
        socket.emit('join-room', roomId, userId)
    })


  }

  addCallerVideo(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=> {video.play()})
    document.getElementById('callGrid').append(video)
  }

  connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    var video = document.createElement('video');
    call.on('stream', newUserVideoStream =>{
      this.addCallerVideo(video, newUserVideoStream)
    })
    call.on('close', ()=> {
      video.remove();
    })
  }

  render() {
    return (
    <div>
      <h1>Watch With Me</h1>
      <div id='callGrid'>
      </div>
    </div>
    )
  }
}

export default App;
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
    myPeer.on('open', userId=>{
      socket.emit('join-room', roomId, userId)
    })

    socket.on('user-connected', userId => {
      this.connectToNewUser(userId, stream)
    })

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    .then(stream =>{
      this.addCallerVideo(stream, undefined)
    })

  }

  addCallerVideo(stream, userId) {
    let callerVideo = document.createElement('video');
    callerVideo.id= userId;
    callerVideo.muted = true;
    callerVideo.srcObject = stream;
    callerVideo.addEventListener('loadedmetadata',()=> {callerVideo.play()})
    document.getElementById('callGrid').append(callerVideo)
  }

  connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    call.on('stream', newUserVideoStream =>{
      this.addCallerVideo(newUserVideoStream, userId)
    })
    call.on('close', ()=> {
      let video= document.getElementById(userId)
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
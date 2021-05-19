import React from 'react'
import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3000');
import Peer from 'peerjs'
const myPeer = new Peer(undefined, {host: '/', port: '3001'})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.startVideo= this.startVideo.bind(this)
    this.addYT = this.addYT.bind(this)
    this.state = {
    }
  }

  componentDidMount(){
    var myVideo = document.createElement('video');
    myVideo.muted= true;
    myVideo.id = 'myvid'
    myVideo.classList.add('callerVideo')

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    .then(stream =>{
      this.addCallerVideo(myVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        var video = document.createElement('video');
        video.classList.add('callerVideo')
        call.on('stream', callerVideoStream =>{
          this.addCallerVideo(video, callerVideoStream)
        })
      })


    socket.on('user-connected', userId => {
      this.connectToNewUser(userId, stream)
    })
  })

  socket.on('user-disconnect', userId =>{
    if (this.state[userId]){
      this.state[userId].close();
    }
  })

    myPeer.on('open', userId=>{
        socket.emit('join-room', roomId, userId)
    })

    window.YT.ready(()=>{
      this.addYT()
    })

  }

  addYT() {
   this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: 'M7lc1UVf-VE',
      playerVars: {
        'playsinline': 1,
        'orgin': location.origin
      },
      events: {
        'onReady': this.startVideo,
      }
    });
  }

  startVideo(){
    this.player.playVideo()
  }



  addCallerVideo(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=> {video.play()})
    document.getElementById('callGrid').append(video)
  }

  connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    var video = document.createElement('video');
    video.classList.add('callerVideo')
    call.on('stream', newUserVideoStream =>{
      this.addCallerVideo(video, newUserVideoStream)
    })
    call.on('close', ()=> {
      video.remove();
      var obj = {};
      obj[userId]= undefined;
      this.setState(obj);
    })
    var obj = {}
    obj[userId]= call
    this.setState(obj);
  }

  render() {
    return (
    <div>
      <h1>Watch With Me</h1>
    <div id = 'player'>
    </div>

      <div id='callGrid'>
      </div>
    </div>
    )
  }
}

export default App;
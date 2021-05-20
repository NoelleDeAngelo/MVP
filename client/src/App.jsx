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
    this.onReady = this.onReady.bind(this)
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this)
    this.addToQueue= this.addToQueue.bind(this)
    this.videos=['UiA4X60Qe1E']
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

    // socket.on('ready', () =>{
    //   console.log('ready')
    // })

    socket.on('play-video', () =>{
      this.startVideo()
    })

    socket.on('pause-video', () =>{
      this.pauseVideo()
    })


    socket.on('queue-video', (id) =>{
      this.videos.push(id)
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
      videoId: this.videos[0],
      playerVars: {
        'orgin': location.origin
      },
      events: {
        'onReady': this.onReady,
        'onStateChange': this.onPlayerStateChange
      }
    });
  }

  onReady(){
    socket.emit('player-ready')
  }

  onPlayerStateChange(event){
    console.log(event.data)
    if (event.data === 1){
      socket.emit('play-video')
    }else if(event.data === 2){
      socket.emit('pause-video')
    }else if(event.data === 0){
      this.videos.shift()
      this.player.loadVideoById(this.videos[0])
    }
  }

  startVideo(){
    this.player.playVideo()
  }

  pauseVideo(){
    this.player.pauseVideo()
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

  addToQueue(url){
    let id = url.slice(17)
    this.videos.push(id)
    socket.emit('queue-video', id)
  }

  render() {
    return (
    <div id= 'inner'>
      <h1>Watch With Me</h1>
    <div id = 'player'>
    </div>
      <div id='callGrid'></div>
      <div>
      <input id= 'queueInput'type= 'text'></input>
      <button onClick= {()=> {this.addToQueue(document.getElementById('queueInput').value); document.getElementById('queueInput').value = ''}}>Add to Queue</button>
      </div>

    </div>
    )
  }
}

export default App;
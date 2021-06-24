import React from 'react'
import openSocket from 'socket.io-client';
const  socket = openSocket('http://localhost:3000');
import Peer from 'peerjs'
import logo from './logo.png'
const myPeer = new Peer(undefined, {host: '/', port: '3001'})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.startVideo= this.startVideo.bind(this)
    this.addYT = this.addYT.bind(this)
    this.onPlayerReady = this.onPlayerReady.bind(this)
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this)
    this.addToQueue= this.addToQueue.bind(this)
    this.videos=[]
    this.playerState= 0
    this.state = {}
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

  socket.on('currentQueue', currentQueue => {
    this.videos = currentQueue;
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
      this.startVideo();
    })

    socket.on('pause-video', () =>{
      this.pauseVideo();
    })


    socket.on('queue-video', (id) =>{
      console.log('added by que', id)
      this.videos.push(id)
      if (this.playerState === 0){
        this.player.loadVideoById(id)
      }
    })


    socket.on('change-time', (time) =>{
      if (time > 1)
      this.player.seekTo(time, true)
    })

    myPeer.on('open', userId=>{
        socket.emit('join-room', roomId, userId, socket.id)
    })

    window.YT.ready(()=>{
      this.addYT()
    })

  }

  addYT() {
   this.player = new YT.Player('player', {
      height: '585',
      width: '960',
      videoId: this.videos[0],
      playerVars: {
        'orgin': location.origin
      },
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange
      }
    });
  }

  onPlayerReady(){
    this.player.loadVideoById(this.videos[0])
  }

  onPlayerStateChange(event){
    console.log(event.data)
    this.playerState = event.data
    if (event.data === 1){
      socket.emit('play-video')
      console.log('emit play')
    }else if(event.data === 2){
      socket.emit('pause-video')
    }else if(event.data === 0){
      socket.emit('video-ended', this.videos[0])
      this.videos.shift()
      this.player.loadVideoById(this.videos[0])
    }else if(event.data === 3){
      var time = this.player.getCurrentTime()
      socket.emit('change-time', time + 0.3)
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
    // emait a add playing video to user ID that has current video and time
  }

  addToQueue(url){
    let id = url.slice(17);
    this.videos.push(id)
    socket.emit('queue-video', id)
    if (this.playerState === 0){
        this.player.loadVideoById(this.videos[0])
    }
  }

  render() {
    return (
    <div id= 'inner'>
      <h1 id='headder'><img id= 'logo' src= {logo}></img></h1>
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
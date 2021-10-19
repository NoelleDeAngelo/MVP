import React from 'react'
import Queue from './Queue.jsx'
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
    this.state = {
      videos: [],
    }
  }

  componentDidMount(){
    var myVideo = document.createElement('video');
    myVideo.muted= false;
    myVideo.id = 'myvid'
    myVideo.classList.add('callerVideo')

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
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
      this.connectToNewUser(userId, stream);
    })
  })

  socket.on('currentQueue', currentQueue => {
    this.setState({videos:currentQueue});
  })

    socket.on('user-disconnect', userId =>{
      if (this.state[userId]){
        this.state[userId].close();
      }
    })

    socket.on('play-video', () =>{
      this.startVideo();
    })

    socket.on('pause-video', () =>{
      this.pauseVideo();
    })


    socket.on('queue-video', (id) =>{
      //console.log('added by que', id)
      let videos = [...this.state.videos]
      videos.push(id)
      if (this.playerState === 0){
        this.player.loadVideoById(id)
      }
    })

    socket.on('change-time', time =>{
      if (time > 1)
      this.player.seekTo(time, true)
    })

    socket.on('request-time', () =>{
      socket.emit('video-time', this.player.getCurrentTime())
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
      videoId: this.state.videos[0],
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
    this.player.loadVideoById(this.state.videos[0])
    if (this.late){
      socket.emit('get-time')
    }
  }

  onPlayerStateChange(event){
    //console.log(event.data)
    this.playerState = event.data
    if (event.data === 1){
      socket.emit('play-video')
    }else if(event.data === 2){
      socket.emit('pause-video')
    }else if(event.data === 0){
      socket.emit('video-ended', this.videos[0])
      let videos= [...this.state.videos]
      videos.shift()
      this.player.loadVideoById(videos[0])
      this.setState({videos: videos})
    }else if(event.data === 3){
      this.changeVideoToTime(this.player.getCurrentTime())
    }

  }

  startVideo(){
    this.player.playVideo()
  }

  pauseVideo(){
    this.player.pauseVideo()
  }

  changeVideoToTime(time){
    socket.emit('change-time', time + 0.3)
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
    let id = url.slice(17);
    let videos = [...this.state.videos];
    videos.push(id);
    this.setState({videos: videos});
    socket.emit('queue-video', id);
    if (this.playerState === 0){
        this.player.loadVideoById(videos[0])
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
      <Queue queue= {this.state.videos}/>
    </div>
    )
  }
}

export default App;
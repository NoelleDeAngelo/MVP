const express = require ('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');

app.use(express.static(__dirname + '/../client/dist'))
app.set('view engine', 'ejs');
app.set('views', __dirname+ '/../client/dist')

app.get('/', (req, res)=>{
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res)=>{
  res.render('index.ejs', {roomId: req.params.room}) //roomQueue: queues[req.params.room]
})

var roomQueues = {};

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, socketId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    if(roomQueues[roomId]) {
      io.to(socketId).emit('currentQueue', roomQueues[roomId])
    }
    socket.on('disconnect', ()=> {
      socket.to(roomId).emit('user-disconnect', userId)
    })
    socket.on('play-video', ()=> {
      socket.to(roomId).emit('play-video')
    })
    socket.on('pause-video', ()=> {
      socket.to(roomId).emit('pause-video')
    })
    socket.on('queue-video', (videoId)=> {
      socket.to(roomId).emit('queue-video', videoId)
      roomQueues[roomId] ? roomQueues[roomId].push(videoId) : roomQueues[roomId] = [videoId]
    })
    socket.on('video-ended', (videoId)=> {
      if (roomQueues[roomId][0] === videoId) {
        roomQueues[roomId].shift()
      }
     })
    socket.on('change-time', (time)=>{
      socket.to(roomId).emit('change-time', time)
    })
    socket.on('get-time', ()=>{
      socket.to(roomId).emit('request-time')
    })
    socket.on('video-time', (time)=>{
      io.to(socketId).emit('change-time', time)
    })

  })
})




server.listen(3000)
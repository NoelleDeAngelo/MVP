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
    // socket.on('player-ready', ()=>{
    //  socket.emit('ready')
    // })
    socket.on('play-video', ()=>{
      socket.to(roomId).emit('play-video')
    })
    socket.on('pause-video', ()=>{
      socket.to(roomId).emit('pause-video')
    })
    socket.on('queue-video', (id)=>{
      socket.to(roomId).emit('queue-video', id)
      roomQueues[roomId] ? roomQueues[roomId].push(id) : roomQueues[roomId] = [id]
    })
    socket.on('change-time', (time)=>{
      socket.to(roomId).emit('change-time', time)
    })

  })
})




server.listen(3000)
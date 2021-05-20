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
  res.render('index.ejs', {roomId: req.params.room})
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
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

  })
})




server.listen(3000)
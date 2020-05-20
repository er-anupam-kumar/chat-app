const express   = require('express')
const path      = require('path')
const http      = require('http')
const socketio  = require('socket.io')
const Filter    = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

//Set http instead express
const app     = express()
const server  = http.createServer(app)
const io      = socketio(server)

//Set Port
const port    = process.env.PORT || 3000

//Public Path
const pathToPublic = path.join(__dirname,'../public')

//Setup static directory to serve
app.use(express.static(pathToPublic))

io.on('connection',(socket)=>{
    console.log('New connection on web socket!')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('sendMessage', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('sendMessage', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('message',(message, callback)=>{

        const user  = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Bad words not allowed')
        }

        io.to(user.room).emit('sendMessage',generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const user  = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location Shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('sendMessage', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

})

//Serve as http server express running behind it
server.listen(port,()=>{
    console.log(`Server is up and running on port:${port}`)
})
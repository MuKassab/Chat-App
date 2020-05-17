const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const port = process.env.PORT || 3000
const publicFolderPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

let count = 0

app.use(express.static(publicFolderPath))

io.on('connection', socket => {
    console.log('New Web Socket Connection')

    socket.on('join', ({username, room}, callback) => {
        const {user, error} = addUser({
            id: socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('System','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        message = filter.clean(message)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Server Confirmation!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left!`))
        }

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendLocation', (locObj, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, locObj))
        callback()
    })
})


server.listen(port, () => {
    console.log(`Server is listeneing on port ${port}`)
})
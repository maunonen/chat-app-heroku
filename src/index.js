const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
// using express with socket io 
const server =  http.createServer(app)
// socketio as function and pass in a server  
// socket io run with raw http server 
const io = socketio(server)

const port = process.env.PORT || 3000

// __dirname - current directory for fthis file 
const publicPath =  path.join(__dirname, '../public')

app.use(express.static(publicPath))
//let count = 0



io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // send event to client from server 'countUpdated'
    //socket.emit('countUpdated', count)
    // Send message to the client 
    

    // broadcast - send to everybady except cuurent user
    

    socket.on('join', (options, callback) => { 
        
        const {error, user} = addUser({ id : socket.id , ...options })
        console.log(user)

        if (error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome') )
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${ user.username } has joined `))
        
        io.to(user.room).emit('roomData', {
            room : user.room, 
            users : getUsersInRoom(user.room)
        })
        callback()
        
        //console.log('Has joined', room)
        // send messages to specific rooms io.to.emit()
        
    })
    
    // get event from client 'increment' and increment value and send it back to the client 
/*     socket.on('increment', () => {
        count ++
        // in this case we just emit to particular connection 
        // socket.emit('countUpdated', count)

        // in this case we emit to all connection 
        io.emit('countUpdated', count)
    }) */

    socket.on('messageCLient', (message, callback) => {

        // Get user to send messages to proper room 
        const user = getUser(socket.id)
        if (!user){
            return console.log('User is undifined', socket.id)
        }
        //console.log(user)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            // return the error on the client 
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage( user.username, message))
        // sent acknowledgemnet to the client by call a callback function 
        callback('Delivered')
    })

    socket.on('sendLocation', (location, callback) => {
        // Get user to send messages to proper room 
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps/?q=${location.latitude},${location.longitude}`)) 
        callback()
    })

    socket.on('disconnect', ()=> {


        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room : user.room, 
                users : getUsersInRoom(user.room)
            })
        }
    })

})

// change app to server 
server.listen(port, () => {
    console.log(`Listen on port ${port}`)
})

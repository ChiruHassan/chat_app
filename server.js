const path = require('path');
const http = require('http');
const  express = require('express');
const socketio = require('socket.io');
const formatMessagge = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const PORT = 3000 || process.env.PORT;

const app = express();
const server = http.createServer(app)
const io = socketio(server);

//Settig static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = 'ChatBot App';
//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom',({username,room})=>{
        console.log('new web socket connection');

        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        
        //Welcome current user
        socket.emit('message',formatMessagge(botName,'Welcome to ChatBot'));

        //broadcast when user connects
        socket.broadcast.to(user.room).emit('message',formatMessagge(botName,`${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listen for chatMessage
    socket.on('chatMessage',msg=>{
        // console.log(msg);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessagge(user.username,msg));
    });
    
    //when client disconnects
    socket.on('disconnect',()=>{
        const user =userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessagge(botName,`${user.username} has left the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`port is running on localhost ${PORT}`);
}); 
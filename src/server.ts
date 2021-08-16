import {Application} from "express";
import user from './user';
import message,{MsgInfo} from './message';
import { Socket } from "socket.io";
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app: Application = express();

const server = http.createServer(app);
server.listen(3000);

//use socket
const io = socketio(server,{ 
    cors: {
        origins: ['http://localhost:3000']
    }
});

const userPool: string[] = [];
const messagePool: Array<MsgInfo[]> = [];
const userSockets: {[key: string]:Socket} = {};

io.on('connection', (socket: Socket) => {
    socket.on("setUsername", (name: string) => {
        const users = new user();
        const ret = users.setUser(name,userPool);

        if (ret) {
            userSockets[name] = socket;
            socket.emit('setSuccess', true);
            // when login, load user list
            socket.emit('getUserList', userPool);
            // notify new user for existed user
            socket.broadcast.emit('updateUser', name);
        } else {
            socket.emit('setFail', false);
        }
    })

    socket.on("postMessage", (msg: MsgInfo[]) => {
        const messages = new message();
        // 1. check msg exist
        const check = messages.checkMessage(msg);
        if (check) {
            //2. set to DB
            messages.setMessage(msg,messagePool);
            //3. parse for reply
            if (msg[0].to == 'other' && (msg[0].action)) {
                if (msg[0].action in userSockets){
                    userSockets[msg[0].action].emit('privateTo', msg);
                    userSockets[msg[0].user].emit('privateTo', msg);
                }
            } else {
                io.emit('all',msg);
            }
        }
    })

    socket.on('disconnect',() => {
        const exitUser = Object.keys(userSockets).find(key => userSockets[key] === socket);
        if (exitUser){
            // delete user info in userPool, userSockets
            userPool.splice(userPool.indexOf(exitUser),1);
            delete userSockets[exitUser];
            // notify client
            io.emit('someoneLeave',exitUser);
            io.emit('all',[{user: exitUser,msg: '我已經離線'}]);
        }
    })
});
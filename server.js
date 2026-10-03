import http, { Server } from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    fs.readFile("./public/index.html",  (err, data) => {
        res.writeHead(200, { "Content-Type": "text/html"})
        res.end(data)
    })
})

const wss = new WebSocketServer({ server })

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username",)
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({"type": "system", "text": `${username} joined`}))
        }
    })

    socket.on("message", (message) => {
        const data = JSON.parse(message.toString())
        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({"type": "chat", "username": data.username, "text": data.text}))
            }
        })
    })
    
    socket.on("close", () => {
        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({"type": "system", "text": `${username} left`}))
            }
        })
    })
})

server.listen(PORT, () => {
    console.log("Server is listening on port 3001")
})

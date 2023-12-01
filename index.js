const { log } = require("console")
var ws = require("ws")

var wss = new ws.WebSocketServer({
    port: 8080
})


var rooms = {

}

wss.on("connection", socket => {
    var room = ""
    var id = Math.random() * 1000

    socket.onmessage = (msg) => {
        var data = JSON.parse(msg.data.toString("utf-8"))
        if (data?.function == "draw") {
            Object.keys(rooms[room]).forEach(key => {
                rooms[room][key]?.send(msg.data.toString("utf-8"))
            })
        }
        else if (data?.function == "join") {
            room = data?.room ?? "/"
            if (rooms[room])
                rooms[room][id] = socket
            else rooms[room] = { [id]: socket }
        }
    }

    socket.on("close", close)
    socket.on("error", close)

    function close() {
        try {
            socket.close()
        } catch (error) { }
        delete rooms[room][id]
    }
})

process.on("uncaughtException", e => {
    log(e)
})
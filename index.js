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
    var start = true;

    socket.onmessage = (msg) => {
        var data = msg.data.toString("utf-8")

        if (start) {
            room = data;
            if (rooms[room])
                rooms[room][id] = socket;
            else rooms[room] = {
                [id]: socket
            };
            start = false;
        }
        else {
            if (typeof rooms[room] != "object") return;
            Object.keys(rooms[room]).forEach(key => {
                if (rooms[room][key] != socket)
                    rooms[room][key]?.send(data);
            })
        }
    }

    socket.on("close", close);
    socket.on("error", close);

    function close() {
        try {
            delete rooms[room][id]
            socket.close()
        } catch (error) { }
    }

})

process.on("uncaughtException", e => {
    log(e)
})
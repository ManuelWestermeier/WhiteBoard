var log = console.log
var canvas = document.querySelector("canvas")
var ctx = canvas.getContext("2d")
var ColorInput = document.getElementById("ColorInput")
var WidthInput = document.getElementById("WidthInput")
var ws = new WebSocket("ws://localhost:8080")
var max = 1000
var lastX = -10
var lastY = -10
canvas.width = max
canvas.height = max

var actuaColor = "rgb(0,204,255)"
var lineWidth = 1

ColorInput.addEventListener("change", e => {
    actuaColor = ColorInput.value
})

WidthInput.addEventListener("change", e => {
    lineWidth = parseInt(WidthInput.value) / 2
})

window.addEventListener("mousemove", e => {
    if (lastX == -10) lastX = e.pageX;
    if (lastY == -10) lastY = e.pageY;
    if (e.buttons == 1) {
        drawLine(actuaColor, lineWidth, lastX, lastY, e.pageX, e.pageY);
    }
    lastX = e.pageX;
    lastY = e.pageY;
})

ws.onmessage = msg => {
    try {
        var data = JSON.parse(msg.data)
        drawLine(data.color, data.lineWidth, data.startX, data.startY, data.x, data.y)
    } catch (error) {
        log(error)
    }
}

ws.onopen = () => {
    try {
        ws.send(JSON.stringify({
            function: "join",
            room: document.location.pathname
        }))
    } catch (error) {
        log(error)
    }
}

function drawLine(color, lineWidth, startX, startY, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (ws.readyState == 1)
        ws.send(JSON.stringify({
            function: "draw",
            color,
            lineWidth,
            startX,
            startY,
            x,
            y
        }))
}
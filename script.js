var log = console.log
var canvas = document.querySelector("canvas")
var ctx = canvas.getContext("2d")
var ColorInput = document.getElementById("ColorInput")
var WidthInput = document.getElementById("WidthInput")
var OpacacityInput = document.querySelector("#OpacacityInput")
var ws = new WebSocket("wss://zl6rrt5t-8080.euw.devtunnels.ms/")
var imgInput = document.querySelector("#imgInput")
var max = 8000
var lastX = -2
var lastY = -2
var isDeleting = false
var toggle = b => b ? false : true
var canDraw = true
canvas.width = max
canvas.height = max

var opacity = 1
var actuaColor = "rgb(0,204,255)"
var lineWidth = 1

function getColor(color) {
    if (color === '')
        return;
    if (color.toLowerCase() === 'transparent')
        return [0, 0, 0, 0];
    if (color[0] === '#') {
        if (color.length < 7) {
            // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
        }
        return [parseInt(color.substr(1, 2), 16),
        parseInt(color.substr(3, 2), 16),
        parseInt(color.substr(5, 2), 16),
        color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1];
    }
    if (color.indexOf('rgb') === -1) {
        // convert named colors
        var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
        var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
        temp_elem.style.color = flag;
        if (temp_elem.style.color !== flag)
            return; // color set failed - some monstrous css rule is probably taking over the color of our object
        temp_elem.style.color = color;
        if (temp_elem.style.color === flag || temp_elem.style.color === '')
            return; // color parse failed
        color = getComputedStyle(temp_elem).color;
        document.body.removeChild(temp_elem);
    }
    if (color.indexOf('rgb') === 0) {
        if (color.indexOf('rgba') === -1)
            color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
        return color.match(/[\.\d]+/g).map(function (a) {
            return +a
        });
    }
}

function newColor(color, opacity) {
    var rgba = getColor(color)
    return `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${opacity})`
}

ColorInput.addEventListener("change", e => {
    actuaColor = newColor(ColorInput.value, opacity)
})

OpacacityInput.addEventListener("change", e => {
    opacity = parseInt(OpacacityInput.value) / 100
    actuaColor = newColor(ColorInput.value, opacity)
})

imgInput.addEventListener("change", e => {
    var img = new Image;
    img.onload = () => {
        setTimeout(() => {
            if (img.height == 8000)
                ctx.drawImage(img, 0, 0);
            else ctx.drawImage(img, 0, 50);
            canDraw = true;
        }, 300)
    }
    img.src = URL.createObjectURL(e.target.files[0]);
})

WidthInput.addEventListener("change", e => {
    lineWidth = parseInt(WidthInput.value) / 2
})

canvas.addEventListener("pointermove", e => {
    e.preventDefault()
    if (lastX == -10) lastX = e.pageX;
    if (lastY == -10) lastY = e.pageY;
    if (e.buttons == 1) {
        var color = isDeleting ? "black" : actuaColor
        drawLine(color, lineWidth, lastX, lastY, e.pageX, e.pageY);
        if (ws.readyState == 1) {
            var lineData = [color, lineWidth, lastX, lastY, e.pageX, e.pageY].join("|");
            ws.send(lineData);
        }
    }
    lastX = e.pageX;
    lastY = e.pageY;
})

ws.onmessage = msg => {
    try {
        var data = msg.data.split("|")
        drawLine(data[0], data[1], data[2], data[3], data[4], data[5])
    } catch (error) {
        log(error)
    }
}

ws.onopen = () => {
    try {
        ws.send(document.location.pathname)
    } catch (error) {
        log(error)
    }
}

function drawLine(color, lineWidth, startX, startY, x, y) {
    if (!canDraw) return
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function _scroll(x, y) {
    scrollBy({
        behavior: "smooth",
        left: x,
        top: y
    })
}


function downloadImg() {
    var link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = "sharedBbild1.png"
    link.click()
}
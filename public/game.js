class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Object {
    constructor(positionX, positionY, width, height) {
        this.position = new Point(positionX, positionY);
        this.width = width;
        this.height = height
    }
}

class Lighting {
    constructor(x1, y1, x2, y2) {
        this.point1 = new Point(x1, y1)
        this.point2 = new Point(x2, y2)
    }
}

class Obstacles extends Object { }

class Player extends Object {
    constructor(positionX, positionY, width, height, idleImage, runImage) {
        super(positionX, positionY, width, height)
        this.idleImage = idleImage
        this.runImage = runImage
        this.initialPosition = new Point(positionX,positionY)
        this.jump = false
        this.fall = false
    }

    setJumpheight(jumpheight){
        this.jumpheight = jumpheight
        return this
    }

    setInitialPosition(){
        this.x = this.initialPosition.x
        this.y = this.initialPosition.y
        this.jump = false
        this.fall = false
    }

    performJump() {
        if (this.jump ) {
            if (this.position.y.toPrecision(12) != this.initialPosition.y.toPrecision(12) - this.jumpheight.toPrecision(12)) this.position.y -= this.jumpheight.toPrecision(12)/40
            else { this.fall = true; this.jump = false }
        }
        else if (this.fall) {
            if (this.position.y.toPrecision(12) != this.initialPosition.y.toPrecision(12)) this.position.y += this.jumpheight.toPrecision(12)/40
            else this.fall = false
        }
    }

    isInJumping(){
        return this.jump || this.fall
    }
}

class Background extends Object {
    constructor(positionX, positionY, width, height, image) {
        super(positionX, positionY, width, height)
        this.image = image
    }
}

var gameOverAudios = [new Audio("game/relax_time.ogg"), new Audio("game/you're_so_fast.ogg"), new Audio("game/razminka.mp3")]
var gameOverImage = new Image()
gameOverImage.src = "game/game_over.png"
var obstacles = []
const floor = 300

var speed = (document.documentElement.clientWidth/document.documentElement.clientHeight) * 2.5
var spawnTime = (document.documentElement.clientWidth/document.documentElement.clientHeight) * 300;
var game = false;
var isGameStarted = false
var score = 0
var mainThemeAudios = [new Audio("game/mainTheme1.mp3"), new Audio("game/mainTheme2.mp3")]
var timer, sound, time, currentMainTheme;
var canvas = document.getElementById("canvas")
var canvasContext = canvas.getContext("2d")
var gameOverObject
var gameOverSoundIsEnded = true
let player = preparePlayer()
document.addEventListener('DOMContentLoaded', function () {
    var [background1, background2] = createBackgrounds()
    var dino = new Image()
    dino.src = "game/roza.png"
    time = performance.now()
    canvas.height = document.body.clientHeight
    canvas.width = document.body.clientWidth
    var center = new Point(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2)
    gameOverObject = new Object(center.x - (canvas.width / 4)/2, center.y - (canvas.height / 2.5)/2, canvas.width / 4, canvas.height / 2.5)


    function draw() {
        if (!isGameStarted) {
            drawMainEntities(canvasContext, background1, background2)
        }
        if (game) {
            // canvas.width = canvas.width
            if (performance.now() - time > spawnTime) {
                obstacles.push(new Obstacles(canvas.width - 70, document.documentElement.clientHeight/1.53, document.documentElement.clientWidth/13 , document.documentElement.clientHeight/5.1))
                time = performance.now()
            }
            moveBackground(background1, background2)
            drawMainEntities(canvasContext, background1, background2)
            player.performJump()
            // drawLight()
            obstacles.forEach((item, index) => {
                canvasContext.drawImage(dino, item.position.x, item.position.y, item.width, item.height)
                checkCollision(item)
                item.position.x -= speed
                if (item.position.x < -item.width / 2) {
                    obstacles.splice(index, 1)
                    score++
                }

            }
            )
            canvasContext.fillStyle = "#000";
            canvasContext.font = '18px serif';
            canvasContext.fillText("Score: " + score, 10, 20);
        }
        requestAnimationFrame(draw)
    }
    draw()
}, false);

document.body.onkeydown = function (e) {
    if (e.keyCode == 32 && !player.isInJumping()) {
        player.jump = true
    }
    if (!game && e.keyCode == 32 && gameOverSoundIsEnded) {
        startGame()
    }
}

document.body.onmousedown = function (e) {
    if (e.button == 0 && !player.isInJumping()) {
        player.jump = true
    }
    if (!game && e.button == 0 && gameOverSoundIsEnded) {
        startGame()
    }
}

function checkCollision(obstacle) {
    if (obstacle.position.y >= player.position.y && obstacle.position.y <= player.position.y + player.height - 50
        && obstacle.position.x >= player.position.x && obstacle.position.x <= player.position.x + player.width-50 ) {
        gameOver()
    }
}

function gameOver() {
    obstacles.splice(0)
    let gameOverSound = gameOverAudios[Math.floor(Math.random() * gameOverAudios.length)]
    gameOverSound.play()
    gameOverSoundIsEnded = false
    game = false
    canvasContext.drawImage(gameOverImage, gameOverObject.position.x, gameOverObject.position.y, gameOverObject.width, gameOverObject.height)
    gameOverSound.addEventListener("ended", function () {
        gameOverSoundIsEnded = true
        currentMainTheme.pause()
    });
}
function startGame() {
    score = 0
    player = preparePlayer()
    currentMainTheme = mainThemeAudios[Math.floor(Math.random() * mainThemeAudios.length)]
    currentMainTheme.volume = 0.4
    currentMainTheme.play()
    game = true
    isGameStarted = true
}

function createBackgrounds() {
    let backgroudImage = new Image()
    backgroudImage.src = "game/back.jpg"
    let background1 = new Background(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, backgroudImage)
    let background2 = new Background(document.documentElement.clientWidth, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, backgroudImage)
    return [background1, background2]
}

function moveBackground(background1, background2) {
    background1.position.x -= document.documentElement.clientWidth/400
    background2.position.x -= document.documentElement.clientWidth/400
    if (background1.position.x <= -document.documentElement.clientWidth)
        background1.position.x = document.documentElement.clientWidth + background1.position.x + document.documentElement.clientWidth
    if (background2.position.x <= -document.documentElement.clientWidth)
        background2.position.x = document.documentElement.clientWidth + background2.position.x + document.documentElement.clientWidth
}

function drawMainEntities(canvasContext, background1, background2) {
    canvasContext.drawImage(background1.image, background1.position.x, background1.position.y, document.documentElement.clientWidth, document.documentElement.clientHeight)
    canvasContext.drawImage(background2.image, background2.position.x, background2.position.y, document.documentElement.clientWidth, document.documentElement.clientHeight)
    canvasContext.drawImage(player.isInJumping() ? player.runImage : player.idleImage, player.position.x, player.position.y, player.width, player.height)
}



function drawLight(canvasContext) {
    canvasContext.beginPath()
    canvasContext.moveTo(canvas.width * Math.random())
    canvas.lineTo(75, 75)
}

function preparePlayer() {
    let idleImage = new Image()
    let rushImage = new Image()
    idleImage.src = "game/main_character.png"
    rushImage.src = "game/rush.png"
    return new Player(80, (document.documentElement.clientHeight - document.documentElement.clientHeight/2.8), document.documentElement.clientWidth/11, document.documentElement.clientHeight/5, idleImage, rushImage).setJumpheight(document.documentElement.clientHeight/4)
}

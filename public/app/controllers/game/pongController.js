angular.module('app').controller('pongController', function ($scope, $timeout, appNotifier) {

    var canvas = document.getElementById('pong-canvas');
    var context = canvas.getContext('2d');

    canvas.height = document.getElementById('pong').offsetHeight - 84;
    canvas.width = document.getElementById('pong').offsetWidth - 40;

    var keys = [];
    var paddles, ball, playerPaddle, aiPaddle;
    $scope.playerScore = 0;
    $scope.aiScore = 0;
    $scope.gameOver = true;
    $scope.controlOptions = true
    $scope.keyControls = false;
    var PLAYER_SPEED = 15;
    var PADDLE_HEIGHT = 150;
    var PADDLE_WIDTH = 5;
    var VELOCITY = 6;
    var DELTA = 8;
    var RADIUS = 12;
    var playCount = 0;
    var aiSpeed = 8;
    var GAME_OVER_SCORE = 5;
    var DOWN_KEY = 40;
    var UP_KEY = 38;

    $scope.resetState = function () {
        $scope.gameOver = false;
        paddles = [];
        playerPaddle = new Paddle((canvas.width - 12));
        aiPaddle = new Paddle(6);
        paddles.push(playerPaddle);
        paddles.push(aiPaddle);
        VELOCITY = 6;
        playCount = 0;
    }

    function Paddle(possition) {
        this.height = PADDLE_HEIGHT;
        this.width = PADDLE_WIDTH;
        this.x = possition;
        this.y = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
    }

    function Ball(velocity) {
        this.x = (canvas.width / 2) - (RADIUS / 2);
        this.y = (canvas.height / 2) - (RADIUS / 2);
        this.velocity = velocity;
        this.direction = getRandomDirection();
        this.verticalDirection = getRandomDirection();
        this.radius = RADIUS;
    }

    function setCanvasSize(height, width) {
        canvas.width = width;
        canvas.height = height;
    }

    // mouse controls
    function updatePlayer(event) {
        var y = event.pageY;
        playerPaddle.y = y - playerPaddle.height - 50;
    }

    // keyboard controls
    function updatePlayerMovement() {
        if (keys[UP_KEY]) {
            playerPaddle.y -= PLAYER_SPEED;
        }

        if (keys[DOWN_KEY]) {
            playerPaddle.y += PLAYER_SPEED
        }
    }

    function updateState() {
        checkCollisions();
        updatePlayerMovement();
        updateAI();
        updateBall();
    }


    function checkCollisions() {
        //check vertical walls
        if ((ball.y + ball.radius) >= canvas.height)
          ball.verticalDirection = -1;
        if ((ball.y - ball.radius) <= 0)
          ball.verticalDirection = 1;

        // check paddles
        if ((ball.x + (ball.radius / 2)) >= playerPaddle.x && checkPaddleYCollision(playerPaddle)) {
          ball.direction = -1;
          playCount++;
        }

        else if ((ball.x - (ball.radius / 2)) <= (aiPaddle.x + PADDLE_WIDTH) && checkPaddleYCollision(aiPaddle)) {
          ball.direction = 1;
          playCount++
        }

        //check horrizontal walls
        // aiScore
        else if ((ball.x + ball.radius) >= canvas.width) {
            $scope.$apply(function () {
                $scope.aiScore++;
            });
            checkGameOver();
        }
        // playerScore
        else if ((ball.x - ball.radius) <= 0) {
            $scope.$apply(function () {
                $scope.playerScore++;
            });
            checkGameOver();
        }

        if ((playCount + 1) % 6 == 0){
          VELOCITY+=2;
          DELTA++;
          playCount++;
        }
    }

    function checkGameOver() {
        if ($scope.aiScore >= GAME_OVER_SCORE || $scope.playerScore >= GAME_OVER_SCORE) {
            resetGame();
            $scope.$apply(function () {
                $scope.gameOver = true;
            });
            $scope.notifyWinner();
        } else newBall();
    }

    $scope.notifyWinner = function () {
        var isPlayerWin = $scope.playerScore >= GAME_OVER_SCORE;
        appNotifier.notify((isPlayerWin ? 'Player 1 ' : 'AI ') + 'wins!', isPlayerWin);
    }

    function checkPaddleYCollision(paddle) {
        return (ball.y >= paddle.y && ball.y <= paddle.y + PADDLE_HEIGHT);
    }

    function updateBall() {
        ball.x += (VELOCITY * ball.direction);
        ball.y += (DELTA * ball.verticalDirection);
    }

    function updateAI() {
        if (ball.direction === 1) return;
        var yDif = ball.y - (aiPaddle.y + (PADDLE_HEIGHT / 2));
        aiPaddle.y += (yDif > 0) ? aiSpeed : -aiSpeed;
    }

    function draw() {
        canvas.height = document.getElementById('pong').offsetHeight - 84;
        canvas.width = document.getElementById('pong').offsetWidth - 40;
        context.clearRect(0, 0, canvas.width, canvas.height);

        drawBall();
        for (var i = 0; i < paddles.length; i++) {
            paddle = paddles[i];
            context.fillStyle = "white";
            //reset bounds if off canvas;
            if (paddle.y < 0)
              paddle.y = 0;
            if ((paddle.y + paddle.height) > canvas.height)
              paddle.y = (canvas.height - paddle.height);

            context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }
    }

    function drawBall() {
        context.beginPath();
        context.fillStyle = "white";
        context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
    }

    function animate() {
        if ($scope.gameOver) return;
        requestAnimFrame(animate);
        updateState();
        draw();
    }

    function newBall() {
        if ($scope.gameOver) return;
        VELOCITY--;
        ball = new Ball(VELOCITY);
    }
    $scope.newGame = function () {
        $scope.playerScore = 0;
        $scope.aiScore = 0;
        $scope.resetState();
        newBall();
        animate();
    }

    function getRandomDirection() {
        return (Math.floor((Math.random() * 10) + 1) % 2) === 0 ? -1 : 1;
    }

    function resetGame() {
        $scope.resetState();
        draw();
    }

    $scope.showControlls = function () {
        $scope.controlOptions = true;
    }

    $scope.mouseControl = function () {
        canvas.addEventListener("mousemove", updatePlayer, true);
        disableKeyBinds();
        $scope.newGame();
    }

    $scope.keyControl = function () {
        canvas.removeEventListener("mousemove", updatePlayer, true);
        enableKeyBinds();
        $scope.newGame();
    }

    function enableKeyBinds() {
        $scope.keyControls = true;
    }

    function disableKeyBinds() {
        $scope.keyControls = false;
    }

    window.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    });
    window.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    });

})

// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
})();

angular.module('app').controller('tetrisController', function ($scope, $timeout) {

    var canvas = document.getElementById('tetris-canvas');
    var context = canvas.getContext('2d');

    // canvas.height = document.getElementById('tetris').offsetHeight - 84;
    // canvas.width = document.getElementById('tetris').offsetWidth ;

    $scope.playerScore;
    var gameBoard, gameLevel, blockInterval, speed, currentBlock, nextBlock;
    var shapeSize = 20;
    var activeBlocks = [];
    var LEFT_KEY = 37;
    var UP_KEY = 38;
    var RIGHT_KEY = 39;
    var DOWN_KEY = 40;

    Array.prototype.multisplice = function () {
        var args = Array.apply(null, arguments);
        args.sort(function (a, b) {
            return a - b;
        });
        for (var i = 0; i < args.length; i++) {
            var index = args[i] - i;
            this.splice(index, 1);
        }
    }

    function Shape() {
        this.coords = [];
        this.colour = "";
        this.position = null;
    }

    Shape.prototype.rotate = function () {
        for (var i = 0; i < this.coords.length; i++) {
            var coord = this.coords[i];
            if (!!coord) this.coords[i] = [coord[1], -coord[0]];
        }

        adjustForOverLaps(this);
    };

    Shape.prototype.getLowerY = function () {
        var yCoords = this.coords.map(function (coord) {
            if (!!coord) return coord[1];
        }).filter(function (el) { return !!el });;

        var max = Math.max.apply(Math, yCoords);

        return (max + 1) * shapeSize;
    }

    Shape.prototype.getTrueY = function () {
        return this.position.y + this.getLowerY() - this.getHeight();
    }

    Shape.prototype.getHeight = function () {
        var yCoords = this.coords.map(function (coord) {
            if (!!coord) return coord[1];
        }).filter(function (el) { return !!el });

        var min = Math.min.apply(Math, yCoords);
        var max = Math.max.apply(Math, yCoords);

        return (max - min + 1) * shapeSize
    }

    Shape.prototype.getLowerX = function () {
        var xCoords = this.coords.map(function (coord) {
            if (!!coord) return coord[0];
        }).filter(function (el) { return !!el });

        var x = Math.min.apply(Math, xCoords) * -1;

        return x * shapeSize;
    }

    Shape.prototype.getTrueX = function () {
        return this.position.x - this.getLowerX();
    }

    Shape.prototype.getWidth = function () {
        var xCoords = this.coords.map(function (coord) {
            if (!!coord) return coord[0];
        }).filter(function (el) { return !!el });

        var min = Math.min.apply(Math, xCoords);
        var max = Math.max.apply(Math, xCoords);

        return (max - min + 1) * shapeSize
    }

    function Square() {
        this.coords = [
            [-0.5, -0.5],
            [-0.5, 0.5],
            [0.5, -0.5],
            [0.5, 0.5]
        ];
        this.colour = '#79BED2';
    }
    Square.prototype = new Shape();


    function Line() {
        this.coords = [
            [-0.5, -1.5],
            [-0.5, -0.5],
            [-0.5, 0.5],
            [-0.5, 1.5]
        ];
        this.colour = '#47C268';
    }
    Line.prototype = new Shape();

    function LShape() {
        this.coords = [
            [0.5, -1.5],
            [0.5, -0.5],
            [0.5, 0.5],
            [1.5, 0.5]
        ];
        this.colour = '#C25647';
    }
    LShape.prototype = new Shape();

    function ReverseL() {
        this.coords = [
            [0.5, -0.5],
            [0.5, -1.5],
            [0.5, 0.5],
            [-0.5, 0.5]
        ];
        this.colour = '#6D39AC';
    }
    ReverseL.prototype = new Shape();

    function SShape() {
        this.coords = [
            [-0.5, -1.5],
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.5]
        ];
        this.colour = '#C6C95E';
    }
    SShape.prototype = new Shape();

    function ReverseS() {
        this.coords = [
            [-0.5, 1.5],
            [-0.5, 0.5],
            [0.5, 0.5],
            [0.5, -0.5]
        ];
        this.colour = '#333295';
    }
    ReverseS.prototype = new Shape();

    function Point() {
        this.coords = [
            [-0.5, 0.5],
            [0.5, 0.5],
            [0.5, -0.5],
            [1.5, 0.5]
        ];
        this.colour = '#287728';
    }
    Point.prototype = new Shape();

    var possibleShapes = [new Square(), new Line(), new LShape(), new ReverseL(), new SShape(), new ReverseS(), new Point()];
    //var possibleShapes = [new SShape(), new ReverseS()];

    function adjustForOverLaps(shape) {
        var trueX = shape.getTrueX();
        var width = shape.getWidth();
        var farX = trueX + width;
        var overLap = farX - canvas.width;

        if (trueX < 0) {
            shape.position.x -= trueX;
        }

        if (overLap > 0) shape.position.x -= overLap;
    }

    function drawShape(shape) {
        context.fillStyle = shape.colour;

        for (var i = 0; i < shape.coords.length; i++) {
            if (!!shape.coords[i]) {
                var x = shape.position.x + (shape.coords[i][0] * shapeSize);
                var y = shape.position.y + (shape.coords[i][1] * shapeSize);

                context.fillRect(x, y, shapeSize, shapeSize);

                //context.strokeStyle = shadeColor(shape.colour, 20);
                context.strokeStyle = shadeColor('#ccc', 20);
                context.lineWidth = 2;
                context.strokeRect(x, y, shapeSize, shapeSize);
            }
        }
    }

    function animate() {
        requestAnimFrame(animate);
        updateState();
        draw();
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < activeBlocks.length; i++) {
            drawShape(activeBlocks[i]);
        }
        drawShape(currentBlock);
    }

    function updateState() {
        updateCurrentBlock();
    }


    function checkForCompleteLine() {
        var maxLines = canvas.height / shapeSize;
        var lines = Array.apply(null, new Array(maxLines)).map(Number.prototype.valueOf, 0);

        for (var i = 0; i < activeBlocks.length; i++) {
            var normalizedCoords = getNormalizedCoords(activeBlocks[i]);

            for (var j = 0; j < normalizedCoords.length; j++) {
                var coord = normalizedCoords[j];
                var line = (canvas.height - coord[1] - shapeSize) / shapeSize;

                lines[line]++;
            }
        }

        for (var i = 0; i < lines.length; i++) {
            if (lines[i] >= canvas.width / shapeSize) {
                clearLine(i)
            }
        }
    }

    function clearLine(index) {
        var emptyIndicies = [];

        for (var i = 0; i < activeBlocks.length; i++) {
            var normalizedCoords = getNormalizedCoords(activeBlocks[i]);

            for (var j = 0; j < normalizedCoords.length; j++) {
                var coord = normalizedCoords[j];
                var line = (canvas.height - coord[1] - shapeSize) / shapeSize;

                if (line === index) {
                    activeBlocks[i].coords[j] = null;
                }
            }
            if (isEmpty(activeBlocks[i])) {
                emptyIndicies.push(i);
            }
        }
        // remove empty blocks
        activeBlocks.multisplice(emptyIndicies);
        // shift remaining blocks down
        for (var i = 0; i < activeBlocks.length; i++) {
            activeBlocks[i].position.y += shapeSize;
        }
    }

    function isEmpty(shape) {
        for (var i = 0; i < shape.coords.length; i++) {
            if (!!shape.coords[i]) return false;
        }
        return true;
    }

    function updateCurrentBlock() {
        var attemptedMove = angular.copy(currentBlock);
        attemptedMove.position.y += speed;

        // can happen if the user speeds up game and the new speed doesn't stop flushly against static blocks
        if (isInvalidPossition(attemptedMove))
            speed = 2;
        else
            currentBlock.position.y += speed;

        checkCollissions();
    }

    function checkCollissions() {
        // base hit, new block
        if (currentBlock.position.y + currentBlock.getLowerY() >= canvas.height - 1) {
            addNewBlock();
            checkForCompleteLine();
        }
        else {
            for (var i = 0; i < activeBlocks.length; i++) {
                var staticBlock = activeBlocks[i];

                // possible collission check for overlaps
                if (currentBlock.position.y + currentBlock.getLowerY() >= staticBlock.getTrueY()) {
                    var normalizedCurrentBlock = getNormalizedCoords(currentBlock);
                    var normalizedStatic = getNormalizedCoords(staticBlock);

                    for (var j = 0; j < normalizedCurrentBlock.length; j++) {
                        var coord = normalizedCurrentBlock[j];

                        for (var k = 0; k < normalizedStatic.length; k++) {
                            var staticCoord = normalizedStatic[k];

                            if (coord[0] == staticCoord[0] && ((coord[1] + shapeSize) == staticCoord[1] || (coord[1] + shapeSize > staticCoord[1] && coord[1] + shapeSize < staticCoord[1] + shapeSize))) {
                                //check for game over
                                checkForCompleteLine();
                                if (currentBlock.getTrueY() < 0) {
                                    newGame();
                                    return;
                                }
                                addNewBlock();
                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    function isOverLappingActiveBlocks(shape) {
        for (var i = 0; i < activeBlocks.length; i++) {
            var staticBlock = activeBlocks[i];

            // possible collission check for overlaps
            // only overlap if lower than upper Y of static block
            if (shape.position.y + shape.getLowerY() > staticBlock.getTrueY()) {
                //normalize coords
                var normalizedCurrentBlock = getNormalizedCoords(shape);
                var normalizedStatic = getNormalizedCoords(staticBlock);

                for (var j = 0; j < normalizedCurrentBlock.length; j++) {
                    var coord = normalizedCurrentBlock[j];
                    // check each static coord against each corrd of given shape
                    for (var k = 0; k < normalizedStatic.length; k++) {
                        var staticCoord = normalizedStatic[k];
                        // coord[0] is x, they must match, y must overlap completely, or y must fall within the static coord boundaries
                        if (coord[0] == staticCoord[0] && (coord[1] == staticCoord[1] || (coord[1] + shapeSize > staticCoord[1] && coord[1] < staticCoord[1] + shapeSize))) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    function isBreakingLeftBoundary(shape) {
        return shape.getTrueX() < 0;
    }

    function isBreakingRightBoundary(shape) {
        return shape.getTrueX() + shape.getWidth() > canvas.width;
    }

    function isBreakingLowerBoundary(shape) {
        return shape.position.y + shape.getLowerY() > canvas.height
    }

    function tryRotate(shape) {
        var attemptedRotation = angular.copy(shape);

        attemptedRotation.rotate();
        // if the attempted rotation will cause any overlaps, do not allow.
        if (isInvalidPossition(attemptedRotation))
            return;

        shape.rotate();
    }

    function isInvalidPossition(shape) {
        return (isBreakingLeftBoundary(shape) || isBreakingRightBoundary(shape)
                            || isBreakingLowerBoundary(shape) || isOverLappingActiveBlocks(shape))
    }

    function getNormalizedCoords(shape) {
        var normalizedCoords = [];

        for (var i = 0; i < shape.coords.length; i++) {
            var coord = shape.coords[i];
            if (!!coord) normalizedCoords.push([shape.position.x + (coord[0] * shapeSize), shape.position.y + (coord[1] * shapeSize)]);
        }
        return normalizedCoords;
    }

    function addNewBlock() {
        activeBlocks.push(currentBlock);
        currentBlock = nextBlock;
        nextBlock = getRandomShape();
        speed = 2;
    }

    function initGame() {
        gameLevel = 1;
        blockInterval = 20;
        speed = 2;
        activeBlocks = [];
        currentBlock = getRandomShape();
        nextBlock = getRandomShape();
    }

    function getRandomShape() {
        var index = (Math.floor(Math.random() * 10) + 1) % possibleShapes.length;

        var newShape = angular.copy(possibleShapes[index]);
        newShape.position = {
            'x': (canvas.width / 2) - (shapeSize / 2),
            'y': -shapeSize
        };
        return newShape;
    }

    function newGame() {
        initGame();
    }

    window.addEventListener("keydown", function (e) {
        if (e.keyCode == UP_KEY)
            tryRotate(currentBlock);

        if (e.keyCode == LEFT_KEY)
            moveLeft();

        if (e.keyCode == RIGHT_KEY)
            moveRight();

        if (e.keyCode == DOWN_KEY)
            speedUp();
    });

    window.addEventListener("keyup", function (e) {
        if (e.keyCode == DOWN_KEY)
            speedDown();
    });

    function moveLeft() {
        var attemptedPossition = angular.copy(currentBlock);
        attemptedPossition.position.x -= shapeSize;

        if (isInvalidPossition(attemptedPossition))
            return

        currentBlock.position.x -= shapeSize;
    }

    function moveRight() {
        var attemptedPossition = angular.copy(currentBlock);
        attemptedPossition.position.x += shapeSize;

        if (isInvalidPossition(attemptedPossition))
            return

        currentBlock.position.x += shapeSize;
    }

    function speedUp() {
        speed = 6;
    }

    function speedDown() {
        speed = 2;
    }

    newGame();
    animate();

    function shadeColor(color, percent) {
        var f = parseInt(color.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = f >> 8 & 0x00FF,
            B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    }
});

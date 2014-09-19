angular.module('app').controller('tictactoeController', function ($scope, $timeout, appNotifier) {

    $scope.isGreeted = false;
    $scope.isPlaying = false;
    $scope.gameStarted = false
    $scope.gameOver = false;
    $scope.welcome = '';
    $scope.welcomeText = 'Would you like to play a game?'
    $scope.activeTurn;
    $scope.move = 0;

    Array.maxObject = function (array, prop) {
        var values = array.filter(function (el) {
            return !!el[prop] || el[prop] === 0;
        }).map(function (el) {
            return el[prop];
        });

        var maxIndex = values.indexOf(Math.max.apply(Math, values));
        return array[maxIndex]
    };


    Array.minObject = function (array, prop) {
        var values = array.filter(function (el) {
            return !!el[prop] || el[prop] === 0;
        }).map(function (el) {
            return el[prop];
        });

        var minIndex = values.indexOf(Math.min.apply(Math, values));
        return array[minIndex]
    };

    $scope.getEmptyBoard = function () {
        return [
        new Array(3),
        new Array(3),
        new Array(3)];
    }

    $scope.gameObject = $scope.getEmptyBoard();

    $scope.greetUser = function () {
        $.each($scope.welcomeText.split(''), function (i, letter) {
            $timeout(function () {
                $scope.welcome += letter;
                if ($scope.welcome === $scope.welcomeText) $scope.isGreeted = true;
            }, 100 * i);
        });
    };

    $scope.play = function () {
        $scope.isPlaying = true;
        $scope.activeTurn = 1;
        $timeout(function () {
            $scope.gameStarted = true;
        }, 1000)
    }

    $scope.stop = function () {
        $scope.isPlaying = false;
    }

    $scope.gameClick = function (row, index) {
        if ($scope.activeTurn === 2) return;
        $scope.activeTurn = 2;

        if ($scope.gameOver) {
            appNotifier.notify('Game over, please start new game', false);
            $scope.activeTurn = 1;
            return;
        }

        if ( !! row[index]) {
            appNotifier.notify('Space already taken!', false);
            $scope.activeTurn = 1;
            return;
        }
        row[index] = 1;
        $scope.move++;

        $scope.checkForWin($scope.gameObject);

        $scope.aiClick();

        $scope.activeTurn = 1;
    }

    $scope.aiClick = function () {
        if ($scope.gameOver) return;

        var move = $scope.getMinMax($scope.gameObject, 0).move;
        $scope.applyMove($scope.gameObject, move, 2)
        $scope.move++;
        $scope.checkForWin($scope.gameObject);
    }

    $scope.playAgain = function () {
        $scope.gameObject = $scope.getEmptyBoard();
        $scope.move = 0;
        $scope.gameOver = false;
    }

    $scope.getMinMax = function (gameState, depth) {
        var isMaxTurn = depth % 2 == 0;
        var possibleMoves = $scope.getPossibleMoves(gameState);

        return isMaxTurn ? $scope.getMax(gameState, possibleMoves, depth) : $scope.getMin(gameState, possibleMoves, depth);
    }

    $scope.getMax = function (gameState, possibleMoves, depth) {
        return Array.maxObject(possibleMoves.map(function (move) {
            return {
                'move': move,
                'score': $scope.getGameStateScore($scope.applyMove(angular.copy(gameState), move, 2), depth)
            };
        }), 'score');
    }

    $scope.getMin = function (gameState, possibleMoves, depth) {
        return Array.minObject(possibleMoves.map(function (move) {
            return {
                'move': move,
                'score': $scope.getGameStateScore($scope.applyMove(angular.copy(gameState), move, 1), depth)
            };
        }), 'score');
    }

    $scope.getGameStateScore = function (gameState, depth) {
        var score = $scope.getGameScore(gameState, depth);

        if ( !! score || score === 0)
          return score;

        return $scope.getMinMax(gameState, depth + 1).score;
    }

    $scope.applyMove = function (gameState, move, player) {
        gameState[move[0]][move[1]] = player;
        return gameState;
    }

    $scope.getGameScore = function (gameBoard, depth) {
        var winner = $scope.getWinner(gameBoard);

        if ( !! winner) {
            return ((winner == 2) ? 10 : -10) - (depth || 0);
        }

        return winner;
    }

    $scope.getPossibleMoves = function (gameBoard) {
        if ($scope.gameOver) return;

        var moves = []

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (!gameBoard[i][j]) {
                    moves.push([i, j]);
                }
            }
        }
        return moves;
    }

    $scope.checkHorizontals = function (gameBoard) {
        var winner;

        for (var i = 0; i < 3; i++) {
            if ( !! gameBoard[i][0] && gameBoard[i][0] === gameBoard[i][1] && gameBoard[i][0] === gameBoard[i][2])
              return gameBoard[i][0];
        }
    }

    $scope.checkVerticals = function (gameBoard) {
        var winner;

        for (var i = 0; i < 3; i++) {
            if ( !! gameBoard[0][i] && gameBoard[0][i] === gameBoard[1][i] && gameBoard[0][i] === gameBoard[2][i])
              return gameBoard[0][i];
        }
    }

    $scope.checkDiagnals = function (gameBoard) {
        var winner;

        if ( !! gameBoard[0][0] && gameBoard[0][0] === gameBoard[1][1] && gameBoard[0][0] === gameBoard[2][2]) winner = gameBoard[0][0];

        else if ( !! gameBoard[2][0] && gameBoard[2][0] === gameBoard[1][1] && gameBoard[2][0] === gameBoard[0][2]) winner = gameBoard[2][0];

        return winner;
    }

    $scope.checkForWin = function (gameBoard) {
        var winner = $scope.getWinner(gameBoard);

        if ( !! winner || winner === 0) {
            $scope.notifyWin(winner);
            $scope.gameOver = true;
        }
    }

    $scope.getWinner = function (gameBoard) {
        var winner;

        winner = $scope.checkDiagnals(gameBoard);
        if ( !! winner) return winner;

        winner = $scope.checkHorizontals(gameBoard);
        if ( !! winner > 0) return winner;

        winner = $scope.checkVerticals(gameBoard);
        if ( !! winner) return winner;

        if ($scope.checkForDraw(gameBoard)) return 0;
    }

    $scope.checkForDraw = function (gameBoard) {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (!gameBoard[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    $scope.notifyWin = function (winner) {
        if (winner === 0) {
            appNotifier.notify('Game is a draw!', false);
        } else {
            appNotifier.notify('Player ' + winner + ' wins!', winner == 1);
        }
    }

    $scope.greetUser();
})

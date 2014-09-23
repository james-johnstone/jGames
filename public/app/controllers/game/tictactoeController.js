angular.module('app').controller('tictactoeController', function ($scope, $timeout, appNotifier, identity) {

    $scope.gameObject;
    $scope.isGreeted = false;
    $scope.isPlaying = false;
    $scope.gameStarted = false
    $scope.gameOver = false;
    $scope.welcome = '';
    $scope.welcomeText = 'Would you like to play a game?'
    $scope.activeTurn;
    $scope.move = 0;
    $scope.isThinking = false;
    $scope.is2Player = false;
    $scope.isPlayer1 = true;
    $scope.isChallenging = false;
    $scope.opponentID;
    var peer = new Peer({
        key: 'lwjd5qra8257b9'
    });
    $scope.connection;
    $scope.peerID;

    peer.on('open', function (id) {
        $scope.$apply(function () {
            $scope.peerID = id;
        });
    });

    peer.on('connection', function (conn) {
        $scope.connection = conn;
        $scope.opponentID = conn.peer;

        $scope.connection.on('open', function () {
            connectionOpen(2);
        });
    });

    $scope.connectToPeer = function () {
        if (!$scope.opponentID) {
            appNotifier.notify('Please enter valid peer ID', false);
            return;
        }

        $scope.connection = peer.connect($scope.opponentID);

        $scope.connection.on('open', function () {
            connectionOpen(1);
        });
    }

    function connectionOpen(player) {
        {
            $scope.is2Player = true;
            $scope.play(player);
            var opponent = player == 1 ? 2 : 1;

            appNotifier.notify('Connection made', true);

            // Receive messages
            $scope.connection.on('data', function (data) {
                //Probably challenge
                if (typeof data === 'string') {
                    if (data == "Challenge!") {
                        msg = Messenger().post({
                            message: "Opponent has challenged you to a rematch!",
                            actions: {
                                accept: {
                                    label: "Accept",
                                    action: function () {
                                        $scope.connection.send("Challenge Accepted");
                                        $scope.$apply(function () {
                                            $scope.challengeAccepted();
                                        });
                                        msg.hide();
                                    }
                                },
                                decline: {
                                    label: "Decline",
                                    action: function () {
                                        $scope.connection.send("Challenge Declined");
                                        msg.hide();
                                    }
                                }
                            }
                        });
                    } else if (data == "Challenge Accepted") {
                        appNotifier.notify('Challenge Accepted', true);
                        $scope.$apply(function () {
                            $scope.challengeAccepted();
                        });
                    } else if (data == "Challenge Declined") {
                        appNotifier.notify('Challenge Declined', false);
                    }
                    else if (data === "terminate"){
                      appNotifier.notify('Opponent has left', false);
                      $scope.$apply(function () {
                            $scope.newOpponent();
                      });
                    }
                } else {
                    $scope.$apply(function () {
                        $scope.applyMove($scope.gameObject, data, opponent);
                        $scope.checkForWin($scope.gameObject);
                        $scope.move++;
                        $scope.activeTurn = player;
                    })
                }
            });
        }
    }

    $scope.challengeAccepted = function () {
        $scope.gameObject = $scope.getEmptyBoard();
        $scope.move = 0;
        $scope.gameOver = false;
    }

    $scope.showPeer = function () {
        $scope.is2Player = true;
    }

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

    $scope.greetUser = function () {
        $.each($scope.welcomeText.split(''), function (i, letter) {
            $timeout(function () {
                $scope.welcome += letter;
                if ($scope.welcome === $scope.welcomeText) $scope.isGreeted = true;
            }, 1 * i);
        });
    };

    $scope.play = function (player) {
        $scope.gameObject = $scope.getEmptyBoard();
        $scope.isPlaying = true;
        $scope.activeTurn = 1;
        $scope.isPlayer1 = player === 1;

        $timeout(function () {
            $scope.gameStarted = true;
        }, 1000)
    }

    $scope.stop = function () {
        $scope.isPlaying = false;
    }

    $scope.gameClick = function (row, index) {
        if ($scope.move === 0 && !$scope.is2Player)
          $scope.isPlayer1 = true;

        var playerTurn = $scope.isPlayer1 ? 1 : 2;
        var opponentTurn = (playerTurn === 1) ? 2 : 1;

        if ($scope.activeTurn !== playerTurn) {
            appNotifier.notify('Please wait for oponent to move', false);
            return;
        }

        $scope.activeTurn = opponentTurn;

        if ($scope.gameOver) {
            appNotifier.notify('Game over, please start new game', false);
            $scope.activeTurn = playerTurn;
            return;
        }

        if ( !! row[index]) {
            appNotifier.notify('Space already taken!', false);
            $scope.activeTurn = playerTurn;
            return;
        }
        row[index] = playerTurn;
        $scope.move++;
        $scope.checkForWin($scope.gameObject);

        if (!$scope.is2Player) {
            $scope.aiClick();
            $scope.activeTurn = playerTurn;
        } else {
            $scope.connection.send([$scope.gameObject.indexOf(row), index]);
        }
    }

    $scope.aiClick = function () {
        if ($scope.move === 0) $scope.isPlayer1 = false;

        var playerTurn = $scope.isPlayer1 ? 2 : 1;
        var oponentTurn = playerTurn ? 2 : 1;

        if ($scope.gameOver) {
            $scope.activeTurn = oponentTurn;
            return;
        }

        $scope.activeTurn = playerTurn;
        $scope.isThinking = true;

        var move = $scope.getMinMax($scope.gameObject, 0).move;
        $scope.isThinking = false;

        $scope.applyMove($scope.gameObject, move, playerTurn)
        $scope.move++;
        $scope.checkForWin($scope.gameObject);

        $scope.activeTurn = oponentTurn;
    }

    $scope.playAgain = function () {
        if (!$scope.is2Player) {
            $scope.gameObject = $scope.getEmptyBoard();
            $scope.move = 0;
            $scope.gameOver = false;
        } else $scope.challengeOpponent();
    }

    $scope.challengeOpponent = function () {
        $scope.connection.send("Challenge!");
    }

    $scope.newOpponent = function(){
      if (!!$scope.connection)
        $scope.connection.send("terminate");
      $scope.connection = null;
      $scope.is2Player = false;
      $scope.playAgain();
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

        if ( !! gameBoard[0][0] && gameBoard[0][0] === gameBoard[1][1] && gameBoard[0][0] === gameBoard[2][2])
          winner = gameBoard[0][0];

        else if ( !! gameBoard[2][0] && gameBoard[2][0] === gameBoard[1][1] && gameBoard[2][0] === gameBoard[0][2])
          winner = gameBoard[2][0];

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
        if ( !! winner)
          return winner;

        winner = $scope.checkHorizontals(gameBoard);
        if ( !! winner > 0)
          return winner;

        winner = $scope.checkVerticals(gameBoard);
        if ( !! winner)
          return winner;

        if ($scope.checkForDraw(gameBoard))
          return 0;
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
            var win = $scope.isPlayer1 ? (winner == 1) : (winner == 2);

            if (win)
              appNotifier.notify('You Win!', true);
            else
              appNotifier.notify('Opponent Wins!', false);
        }
    }

    function randomID() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16);
    }

    function getUserName() {
        if (identity.isAuthenticated())
          return randomID() + '-user-' + identity.getUsername();
    }

    $scope.greetUser();
})

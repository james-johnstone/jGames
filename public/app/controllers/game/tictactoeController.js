angular.module('app').controller('tictactoeController', function($scope, $timeout, appNotifier){

  $scope.isGreeted = false;
  $scope.isPlaying = false;
  $scope.gameStarted = false
  $scope.gameOver = false;
  $scope.welcome = '';
  $scope.welcomeText = 'Would you like to play a game?'
  $scope.activeTurn;

  $scope.getEmptyBoard = function(){
    return [
        new Array(3),
        new Array(3),
        new Array(3)];
  }

  $scope.gameObject = $scope.getEmptyBoard();

  $scope.greetUser = function(){
    $.each($scope.welcomeText.split(''), function (i, letter) {
      $timeout(function () {
              $scope.welcome += letter;
              if ($scope.welcome === $scope.welcomeText)
                $scope.isGreeted = true;
          }, 100 * i);
  });
};

  $scope.play = function(){
        $scope.isPlaying = true;
        $scope.activeTurn = 1;
        $timeout(function(){
          $scope.gameStarted = true;
        }, 1000)
  }

  $scope.stop = function(){
        $scope.isPlaying = false;
  }

  $scope.gameClick = function(row, index){
    if ($scope.gameOver){
      appNotifier.notify('Game over, please start new game', false);
      return;
    }

    if (!!row[index]){
      appNotifier.notify('Space already taken!', false);
      return;
    }
    row[index] = 1;

    $scope.checkForWin($scope.gameObject);

    $scope.activeTurn = 2;
    $scope.aiClick();
    $scope.activeTurn = 1;
  }

  $scope.aiClick = function(){
    if ($scope.gameOver)
      return;

    var move = $scope.getMinMax($scope.gameObject, 0, 0);
    $scope.gameObject[move[0]][move[1]] = 2;

    $scope.checkForWin($scope.gameObject);
  }

  $scope.checkHorizontals = function(gameBoard){
    var winner;

    for (var i=0; i <3; i++){
      if (!!gameBoard[i][0] && gameBoard[i][0] === gameBoard[i][1] && gameBoard[i][0] === gameBoard[i][2])
        winner = gameBoard[i][0];
    }
    return winner;
  }

  $scope.checkVerticals = function(gameBoard){
    var winner;

    for (var i=0; i <3; i++){
      if (!!gameBoard[0][i] && gameBoard[0][i] === gameBoard[1][i] && gameBoard[0][i] === gameBoard[2][i])
        winner = gameBoard[0][1];
    }
    return winner;
  }

  $scope.checkDiagnals = function(gameBoard){
    var winner;

    if (!!gameBoard[0][0] && gameBoard[0][0] === gameBoard[1][1] && gameBoard[0][0] === gameBoard[2][2])
        winner = gameBoard[0][0];

    else if (!!gameBoard[2][0] && gameBoard[2][0] === gameBoard[1][1] && gameBoard[2][0] === gameBoard[0][2])
            winner = gameBoard[2][0];

    return winner;
  }

  $scope.checkForWin = function(gameBoard){
    var winner = $scope.getWinner(gameBoard);

    if (!!winner || winner === 0){
      $scope.notifyWin(winner);
      $scope.gameOver = true;
  }

  }

  $scope.getWinner = function(gameBoard){
    var winner;

    winner = $scope.checkDiagnals(gameBoard);
    if (!!winner)
          return winner;

    winner = $scope.checkHorizontals(gameBoard);
    if (!!winner > 0)
          return winner;

    winner = $scope.checkVerticals(gameBoard);
    if (!!winner)
            return winner;

    if ($scope.checkForDraw(gameBoard))
      return 0;
  }

  $scope.checkForDraw = function(gameBoard){
    for (var i=0; i < 3; i++){
      for (var j=0; j <3; j++){
        if (!gameBoard[i][j]){
           return false;
        }
      }
    }
    return true;
  }

  $scope.notifyWin = function(winner){
    if (winner === 0){
      appNotifier.notify('Game is a draw!', false);
    }
    else {
    appNotifier.notify('Player ' + winner + ' wins!', winner == 1);
  }
}

  $scope.playAgain = function(){
    $scope.gameObject = $scope.getEmptyBoard();
    $scope.gameOver = false;
  }

  $scope.getAIMove = function(){
    var move = $scope.getMinMax($scope.gameObject, 0, 0);
    console.log(move);
  }


  $scope.getMinMax = function(gameBoard, depth, turn){
    if ($scope.gameOver)
      return;

    depth ++;
    var aiTurn = turn % 2 == 0;
    var moves = [];
    var bestMove;
    var possibleMoves = $scope.getPossibleMoves(gameBoard);

    $.each(possibleMoves, function(i, move){
      var tempBoard = angular.copy(gameBoard);
      tempBoard[move[0]][move[1]] = aiTurn ? 2 : 1;
      moves.push({'move' : move, 'score': $scope.getGameScore(tempBoard, depth)});
    });

    $.each(moves, function(i, move){
        if (aiTurn){
          if (move.score > 0)
            bestMove = move.move;
        }
        else {
           if (move.score < 0)
             bestMove = move.move;
        }
        // no win, go for draw
        if (!bestMove && move.score == 0)
          bestMove = move.move;

        if (!!bestMove)
          return;
    });

    // no win or draw found, populate child states
    while (!bestMove){
      for (var i =0; i < moves.length; i++){
        if (!!bestMove)
            break;

        var tempBoard = angular.copy(gameBoard);

        tempBoard[moves[i].move[0]][moves[i].move[1]] = aiTurn ? 2 : 1;

        bestMove = $scope.getMinMax(tempBoard, depth, turn +1);
      }
    }

    return bestMove;
  }

  $scope.getGameScore = function(gameBoard, depth){
    var winner = $scope.getWinner(gameBoard);

    if (!!winner){
        var score = ((winner == 2) ? 10 : -10 ) - (depth || 0);
        return score;
    }

    return winner;
  }

  $scope.getPossibleMoves = function(gameBoard){
    if ($scope.gameOver)
      return;

    var moves = []

    for (var i=0; i < 3; i++){
      for (var j=0; j <3; j++){
        if (!gameBoard[i][j]){
           moves.push([i,j]);
        }
      }
    }
    return moves;
  }

  $scope.greetUser();
})

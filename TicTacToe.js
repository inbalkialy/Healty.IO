module.exports = function(ctx, cb){
  // start game
  if(ctx.data.start && ctx.data.player1 && ctx.data.player2){
    inputValidation(ctx, cb)
    initGame(ctx, cb)
  }
  // play
  else if(ctx.data.play) {
    executeTurn(ctx, cb)
  }
  else {
    return cb(null, "Welcome to Tic Tac Toe Game! no input was inserted.\n To start a new game insert to URL Params: 1. start: tic tac toe \n 2. player1: name \n 3. player2: name. \n To play insert play : coordinate. (coordinate format: xy)")
  }
}

function initGame(ctx, cb){
  ctx.storage.get(function (error, data) {
    if(error) return cb(error)
    var gameData = {
      player1 : {
        name : ctx.data.player1,
        sign : "X"
      },
      player2 : {
        name : ctx.data.player2,
        sign: "O"
      },
      curPlayer : {
        name: ctx.data.player1,
        sign: "X"
      },
      board : [["-", "-", "-"], ["-", "-", "-"], ["-", "-", "-"]],
      numTurnsExecuted : 0,
      gameInitialized : true
    };
    ctx.storage.set(gameData, function(error){
      if(error) return cb(error)
      return cb(null, "Tic Tac Toe Game has started! current player is: " + gameData.curPlayer.name + ". Board: " + gameData.board)
    });
  });
}

function inputValidation(ctx, cb) {
  var player1 = ctx.data.player1
  var player2 = ctx.data.player2
  if (ctx.data.start !== "tic tac toe" || typeof player1 !== 'string' || typeof player2 !== 'string' || !/^[a-zA-Z]+$/.test(player1) || !/^[a-zA-Z]+$/.test(player2)) {
    return cb(null, "ERROR - illegal input")
  }
  return true
}

function executeTurn(ctx, cb){
  ctx.storage.get(function (error, data) {
    if(error) return cb(error)
    if(!data.gameInitialized) {
      return cb(null, "Please start the game before playing")
    }
    
    // input validation
    var x = ctx.data.play[0]
    var y = ctx.data.play[1]
    var cV = coordinateValidation(x, y, data)
    if(!cV.retVal) {
      return cb(null, cV.message)
    }
    else {
      // execute play
      data.board[x][y] = data.curPlayer.sign
      data.numTurnsExecuted += 1
    }
    
    // check for winner
    if(checkForWinner(data)) {
      data.gameInitialized = false
      var winner = data.curPlayer.name
      ctx.storage.set(data, function(error){
        if(error) return cb(error)
        return cb(null, "The winner is: " + winner + "!")
      });
    }
    
    // check for game Over
    else if(data.numTurnsExecuted >= 9) {
      data.gameInitialized = false
      ctx.storage.set(data, function(error){
        if(error) return cb(error)
        return cb(null, "Game Over! Board: " + data.board)
      });
    }
    
    // continue playing
    else {
      if(data.curPlayer.sign === "X") {
        data.curPlayer = data.player2
      }
      else {
        data.curPlayer = data.player1
      }
      // update game data in storage for next round
      ctx.storage.set(data, function(error){
        if(error) return cb(error)
        return cb(null, "Board: " + data.board + " Next turn: " + data.curPlayer.name)
      });
    }
  });
}

function coordinateValidation(x, y, data) {
  if(!x || !y || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
    return {
      retVal : false,
      message : "ERROR - illegal input"}
  }
  else if((x < 0 || x > 2) || (y < 0 || y > 2)) {
    return {
      retVal : false,
      message : "ERROR - coordinate inserted is out of board"}
    }
  else if(data.board[x][y] === "X" || data.board[x][y] === "O") {
     return {
      retVal : false,
      message : "ERROR - coordinate inserted is already in use. Board: " + data.board}
    }   
  else {
    return {
      retVal : true
    }
  }
}

function checkForWinner(data) {
  var board = data.board
  var sign = data.curPlayer.sign
  // rows:
  if(board[0][0] === sign && board[0][1] === sign && board[0][2] === sign) {
    return true
  }
  else if(board[1][0] === sign && board[1][1] === sign && board[1][2] === sign) {
    return true
  }
  else if(board[2][0] === sign && board[2][1] === sign && board[2][2] === sign) {
    return true
  }
  // colums:
  else if(board[0][0] === sign && board[1][0] === sign && board[2][0] === sign) {
    return true
  }
  else if(board[0][1] === sign && board[1][1] === sign && board[2][1] === sign) {
    return true
  }
  else if(board[0][2] === sign && board[1][2] === sign && board[2][2] === sign) {
    return true
  }
  // diagnols:
    else if(board[0][0] === sign && board[1][1] === sign && board[2][2] === sign) {
    return true
  }
    else if(board[0][2] === sign && board[1][1] === sign && board[2][0] === sign) {
      return true
  }
  return false
}

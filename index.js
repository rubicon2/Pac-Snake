// Array of players, contains arrays of each player's snake chunk positions. 
const GAME = document.getElementById("game"); 
const SCORE = document.getElementById("score");
const GAME_WIDTH = GAME.offsetWidth; 
const GAME_HEIGHT = GAME.offsetHeight;
const OBJECT_SIZE = 25;
const MAX_X_POS = GAME_WIDTH - OBJECT_SIZE;
const MAX_Y_POS = GAME_HEIGHT - OBJECT_SIZE;

var moveInterval = null;
var foodTimeout = null; 

// Game states.
const TITLE_SCREEN = 0;
const PLAYERS_SCREEN = 1;
const SETTINGS_SCREEN = 2;
const GAME_SCREEN = 3;
const GAME_OVER_SCREEN = 4;

var state = TITLE_SCREEN;

// In place of enumeration for player movement directions - not sure if js properly does those. 
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;
 
// Used to pause/unpause the game. 
const ESCAPE = 27; 
// Used to skip through screens without using the mouse. 
const SPACE = 32; 
// Used to select number of players without a mouse. 
const NUM_1 = 49;
const NUM_2 = 50;
const NUM_3 = 51;
const NUM_4 = 52; 
// Input keycodes for each player.

// Arrow keys.
const PLAYER_1_UP = 38;
const PLAYER_1_RIGHT = 39;
const PLAYER_1_DOWN = 40;
const PLAYER_1_LEFT = 37;

// WASD. 
const PLAYER_2_UP = 87;
const PLAYER_2_RIGHT = 68;
const PLAYER_2_DOWN = 83;
const PLAYER_2_LEFT = 65;

// IJKL. 
const PLAYER_3_UP = 73;
const PLAYER_3_RIGHT = 76;
const PLAYER_3_DOWN = 75;
const PLAYER_3_LEFT = 74;

// Numpad 8456. 
const PLAYER_4_UP = 104;
const PLAYER_4_RIGHT = 102;
const PLAYER_4_DOWN = 101;
const PLAYER_4_LEFT = 100;

// Data for creating the snakes. 
const startPositionsX = [50, 325,  50, 325];
const startPositionsY = [50, 325, 325,  50]; 
const startMoveDir = [UP, DOWN, LEFT, RIGHT]; 
const playerNames = ["YELLOW", "BLUE", "RED", "GREEN"];
const playerColors = ["yellow", "rgb(0, 220, 213)", "rgb(213, 50, 0)", "rgb(30, 190, 0)"];
const playerClasses = ["player1", "player2", "player3", "player4"];
const initLength = 3;

// Stuff to be used for game loop. 
var snakes = []; 
var supermarket = [];
var isPaused = false;

// Store info for end game display. 
var lastSnakeStanding = null; 
var biggestSnake = {name:"NOBODY", food:"0"}; 
var compliments = ["GARGANTUAN", "GLORIOUS", "SPECTACULAR", "GODLIKE", "HIDEOUS", "DEFORMED", "BLURFING", "SCHPLINDLEOUS"];
var foods = ["FESTERING SCHWIMBLES", "TURNIPS", "SLIGHTLY SMALLER SNAKES", "WEIRD ROTATING SQUARES", "DARK MATTER", "PIXEL BITZ", "HAGGIS", "DOUGHNUT HOLES", "FRESH GLOMBLES", " PREMIUM SCHPLARFNITZLS", "TOAST"];
var currentEndText = 0;
var endTexts = [];

function clearScreen() {

    clearInterval(moveInterval);
    clearTimeout(foodTimeout);
    moveInterval = null;
    foodTimeout = null; 
    snakes = [];
    supermarket = [];

    let children = document.querySelectorAll("#game *"); 
    for (let i = 0; i < children.length; i++) {
        children[i].remove();
    }
}

function showTitle() {

    clearScreen(); 
    state = TITLE_SCREEN;

    let title = document.createElement("a");
    title.className = "interactiveText unselectable";
    title.innerText = "PAC-SNAKE";  
    title.href = "javascript:showPlayersScreen()";
    GAME.appendChild(title);

    /*
    let text = document.createElement("div");
    text.className = "subtitle unselectable";
    text.innerText = "THE LAST SNAKE STANDING WINS";
    GAME.appendChild(text);
    */

    createSnake(0, 25, RIGHT, playerClasses[0], playerColors[0], "nothing");
    createSnake(375, 125, LEFT, playerClasses[1], playerColors[1], "literally doesn't matter");
    createSnake(25, 325, UP, playerClasses[2], playerColors[2], "who cares");
    createSnake(350, 325, DOWN, playerClasses[3], playerColors[3], "filler");

    // Kick off interval that moves the snakes. 
    resetMoveTimer(500);
}

function resetMoveTimer(time) {
    clearInterval(moveInterval);
    moveInterval = setInterval(function() {
        moveSnakes();
    }, time); 
}

addEventListener("keydown", function(e) {
    setMoveDir(e);
})

addEventListener("load", function() {
    showTitle();
})

function showPlayersScreen() {

    clearScreen(); 
    state = PLAYERS_SCREEN; 

    let pl1 = document.createElement("a"); 
    let pl2 = document.createElement("a");
    let pl3 = document.createElement("a");
    let pl4 = document.createElement("a");

    pl1.id = "onePlayer";
    pl2.id = "twoPlayers";
    pl3.id = "threePlayers";
    pl4.id = "fourPlayers";

    pl1.className = "interactiveText";
    pl2.className = "interactiveText";
    pl3.className = "interactiveText";
    pl4.className = "interactiveText";

    pl1.innerText = "ONE PLAYER \n";
    pl2.innerText = "TWO PLAYERS \n"; 
    pl3.innerText = "THREE PLAYERS \n"; 
    pl4.innerText = "FOUR PLAYERS"; 

    pl1.href = "javascript:start(1)";
    pl2.href = "javascript:start(2)";
    pl3.href = "javascript:start(3)";
    pl4.href = "javascript:start(4)";

    GAME.appendChild(pl1);
    GAME.appendChild(pl2);
    GAME.appendChild(pl3);
    GAME.appendChild(pl4);
}

function showSettingsScreen() {
    clearScreen(); 
    state = SETTINGS_SCREEN;
}

function showEndScreen() {

    clearScreen();
    state = GAME_OVER_SCREEN;
    currentEndText = 0;
    let endTexts = [];
    endTexts[0] = `THE LAST SNAKE STANDING WAS ${lastSnakeStanding.name}`;
    endTexts[1] =  `THE MOST ${compliments[Math.round((Math.random() * (compliments.length - 1)))]} SNAKE WAS ${biggestSnake.name} WHO MUNCHED ON ${biggestSnake.food} PIECES OF ${foods[Math.round((Math.random() * (foods.length - 1)))]}.`;

    let pl1 = document.createElement("a"); 
    pl1.className = "interactiveText";
    pl1.innerText = endTexts[0];
    pl1.href = "javascript:nextEndText()";
    GAME.appendChild(pl1);
}

function nextEndText() {
    let el = document.querySelector("a");
    el.innerText = endTexts[++currentEndText]; 
}

function createSnake(originX, originY, initialMoveDir, playerClass, playerColor, playerName) {

    let newSnake = new Object();
    newSnake.name = playerName; 
    newSnake.class = playerClass;
    newSnake.color = playerColor;
    newSnake.alive = true;
    newSnake.score = 0;
    newSnake.nextMoveDir = initialMoveDir;
    newSnake.lastMoveDir = initialMoveDir; 

    newSnake.targetLength = initLength; 
    newSnake.chunks = []; 

    for (let i = 0; i < newSnake.targetLength; i++) {
        // Work out x and y for new chunk piece.
        let xMult = 0;
        let yMult = 0;
        switch(initialMoveDir) {
            case UP: 
                yMult = i;
                break;
            case DOWN:
                yMult = i * -1;
                break;
            case LEFT:
                xMult = i;
                break;
            case RIGHT:
                xMult = i * -1;
                break; 
        }
        let anotherChunk = createNewChunk((originX + (OBJECT_SIZE * xMult)) % GAME_WIDTH, (originY + (OBJECT_SIZE * yMult)) % GAME_HEIGHT, playerClass); 
        newSnake.chunks.push(anotherChunk); 
        GAME.appendChild(anotherChunk); 
    }
    snakes.push(newSnake); 
}

function start(players) {

    // Clear the play space. 
    clearScreen();
    state = GAME_SCREEN;

    // Create the number of snakes we need and their initial chunks. 
    for (let i = 0; i < players; i++) {
        createSnake(startPositionsX[i], startPositionsY[i], startMoveDir[i], playerClasses[i], playerColors[i], playerNames[i]); 
    }

    let countdown = createCenterGameText("3");

    setTimeout(function() {
        countdown.innerText = "2"; 
        setTimeout(function() {
            countdown.innerText = "1"; 
            setTimeout(function() {
                countdown.innerText = "GO!"; 
                // Kick off interval that moves the snakes. 
                resetMoveTimer(500);
                setTimeout(function() {
                    countdown.style.animationName = "fadeOut";
                    setTimeout(function() {
                        countdown.remove();
                        spawnFood();
                    }, 1000)
                }, 1000); 
            }, 1000);
        }, 1000);
    }, 1000);  
}

function createCenterGameText(newText) {
    let text = document.createElement("div");
    text.className = "countdownText unselectable";
    text.innerText = newText;
    GAME.appendChild(text); 
    return text;
}

function spawnFood() {

    let x = null; 
    let y = null; 
    // Used to check if xy conflict with any existing snake chunks. If so, keep generating new xy until they do not conflict. 
    // This will stop food spawning within snakes! 
    let xyOK = null;

    do {
        // Assume it's ok - check through chunks later and if one conflicts, this will be set to false, then the loop will begin again. 
        xyOK = true;
        x = clampDown(Math.random() * MAX_X_POS, OBJECT_SIZE);
        y = clampDown(Math.random() * MAX_Y_POS, OBJECT_SIZE);
        for (let snakeNo = 0; snakeNo < snakes.length; snakeNo++) {
            let currentSnake = snakes[snakeNo];
            for (let chunkNo = 0; chunkNo < currentSnake.chunks.length; chunkNo++) {
                let currentChunk = currentSnake.chunks[chunkNo];
                if (x == posToInt(currentChunk.style.left) && y == posToInt(currentChunk.style.top)) {
                    // These proposed xy for the food are not useable - generate new ones!
                    xyOK = false; 
                    // Break out of this for loop - no point checking any other chunks. 
                    break;
                }
            }
            // If xy have found to be not ok, break out of the for loop - no point checking the other snakes. 
            if (!xyOK) {
                break;
            }
        }
    } while (xyOK == false)


    let food = document.createElement("div"); 
    food.className = "food"; 
    food.style.left = intToPos(x);
    food.style.top = intToPos(y); 
    supermarket.push(food); 
    GAME.appendChild(food); 
}

function setMoveDir(e) {

    switch(state) {
        case GAME_SCREEN:

            // Filter out key presses for players 2 - 4 if they are not playing. 
            if (e.which === PLAYER_2_UP || e.which === PLAYER_2_RIGHT || e.which === PLAYER_2_DOWN || e.which === PLAYER_2_LEFT) {
                if (snakes[1] == null) {
                    return;
                }
            }

            if (e.which === PLAYER_3_UP || e.which === PLAYER_3_RIGHT || e.which === PLAYER_3_DOWN || e.which === PLAYER_3_LEFT) {
                if (snakes[2] == null) {
                    return;
                }
            }

            if (e.which === PLAYER_4_UP || e.which === PLAYER_4_RIGHT || e.which === PLAYER_4_DOWN || e.which === PLAYER_4_LEFT) {
                if (snakes[3] == null) {
                    return;
                }
            }
        
            switch(e.which) {
                // Pause. 
                case SPACE:
                    isPaused = (isPaused) ? false : true; 
                    break; 

                case ESCAPE:
                    showTitle();
                    break;

                case PLAYER_1_UP:
                    if (snakes[0].lastMoveDir != DOWN) {
                        snakes[0].nextMoveDir = UP;
                    }  
                    break;
                case PLAYER_1_RIGHT:
                    if (snakes[0].lastMoveDir != LEFT) {
                        snakes[0].nextMoveDir = RIGHT;
                    }
                    break;
                case PLAYER_1_DOWN:
                    if (snakes[0].lastMoveDir != UP) {
                        snakes[0].nextMoveDir = DOWN;
                    }
                    break;
                case PLAYER_1_LEFT:
                    if (snakes[0].lastMoveDir != RIGHT) {
                        snakes[0].nextMoveDir = LEFT;
                    }
                    break;

                case PLAYER_2_UP:
                    if (snakes[1].lastMoveDir != DOWN) {
                        snakes[1].nextMoveDir = UP;
                    }  
                    break;
                case PLAYER_2_RIGHT:
                    if (snakes[1].lastMoveDir != LEFT) {
                        snakes[1].nextMoveDir = RIGHT;
                    }
                    break;
                case PLAYER_2_DOWN:
                    if (snakes[1].lastMoveDir != UP) {
                        snakes[1].nextMoveDir = DOWN;
                    }
                    break;
                case PLAYER_2_LEFT:
                    if (snakes[1].lastMoveDir != RIGHT) {
                        snakes[1].nextMoveDir = LEFT;
                    }
                    break;

                case PLAYER_3_UP:
                    if (snakes[2].lastMoveDir != DOWN) {
                        snakes[2].nextMoveDir = UP;
                    }  
                    break;
                case PLAYER_3_RIGHT:
                    if (snakes[2].lastMoveDir != LEFT) {
                        snakes[2].nextMoveDir = RIGHT;
                    }
                    break;
                case PLAYER_3_DOWN:
                    if (snakes[2].lastMoveDir != UP) {
                        snakes[2].nextMoveDir = DOWN;
                    }
                    break;
                case PLAYER_3_LEFT:
                    if (snakes[2].lastMoveDir != RIGHT) {
                        snakes[2].nextMoveDir = LEFT;
                    }
                    break;
            
                case PLAYER_4_UP:
                    if (snakes[3].lastMoveDir != DOWN) {
                        snakes[3].nextMoveDir = UP;
                    }  
                    break;
                case PLAYER_4_RIGHT:
                    if (snakes[3].lastMoveDir != LEFT) {
                        snakes[3].nextMoveDir = RIGHT;
                    }
                    break;
                case PLAYER_4_DOWN:
                    if (snakes[3].lastMoveDir != UP) {
                        snakes[3].nextMoveDir = DOWN;
                    }
                    break;
                case PLAYER_4_LEFT:
                    if (snakes[3].lastMoveDir != RIGHT) {
                        snakes[3].nextMoveDir = LEFT;
                    }
                    break;
            }
            // End of game screen controls. 
            break; 
        
        case TITLE_SCREEN:
            switch(e.which) {
                case SPACE:
                    showPlayersScreen();
                    break;
            }
            break;

        case SETTINGS_SCREEN:
            switch(e.which) {

            }
            break;

        case PLAYERS_SCREEN:
            switch(e.which) {
                case NUM_1:
                    start(1); 
                    break;
                case NUM_2:
                    start(2);
                    break;
                case NUM_3:
                    start(3);
                    break;
                case NUM_4:
                    start(4);
                    break;
            }
            break;

        case GAME_OVER_SCREEN:
            switch(e.which) {
                case SPACE:
                    nextEndText();
            }
            break;
    }
}

function moveSnakes() {

    if (!isPaused) {
        for (let i = 0; i < snakes.length; i++) {

            let currentSnake = snakes[i]; 
            if (!currentSnake.alive) {
                continue;
            }
    
            // Calculate predicted new position. 
            let newX = posToInt(currentSnake.chunks[0].style.left); 
            let newY = posToInt(currentSnake.chunks[0].style.top); 
    
            switch(currentSnake.nextMoveDir) {
                case UP:
                    newY -= OBJECT_SIZE;
                    break;
                case RIGHT:
                    newX += OBJECT_SIZE;
                    break;
                case DOWN:
                    newY += OBJECT_SIZE;
                    break;
                case LEFT:
                    newX -= OBJECT_SIZE; 
                    break;
            }
    
            // If the next position is less than zero, or greater than game width/height, roll around to the other side of the game area - like pac man. 
            if (newX < 0) {
                newX = MAX_X_POS;
            } else if (newX > MAX_X_POS) {
                newX = 0;
            }
    
            if (newY < 0) {
                newY = MAX_Y_POS;
            } else if (newY > MAX_Y_POS) {
                newY = 0;
            }
    
            // Collision detection for that gorgeous food! 
            for (let aisle = 0; aisle < supermarket.length; aisle++) {
                let food = supermarket[aisle]; 
                let foodX = posToInt(food.style.left);
                let foodY = posToInt(food.style.top); 
                if (newX == foodX && newY == foodY) {
                    currentSnake.score++;
                    supermarket.pop().remove();
                    currentSnake.targetLength++; 
                    spawnFood(); 
                }
            }
    
            // Collision detection for those not so gorgeous snakes... 
            for (let snakeAisle = 0; snakeAisle < snakes.length; snakeAisle++) {
                let otherSnake = snakes[snakeAisle]; 
                // If the "otherSnake" is THIS snake, ignore the first entry in the chunks array. 
                for (let snakeChunk = 0; snakeChunk < otherSnake.chunks.length; snakeChunk++) {
                    if (snakeAisle == i && snakeChunk == 0) {
                        continue; 
                    } else {
                        let otherChunk = otherSnake.chunks[snakeChunk]; 
                        let otherX = posToInt(otherChunk.style.left);
                        let otherY = posToInt(otherChunk.style.top); 
                        if (newX == otherX && newY == otherY) {
                            // snakes.splice(i, 1); 
                            destroySnake(currentSnake);
                        }
                    }
                }
            }
    
            // If current snake has collided and triggered its death, skip the rest of the loop for this snake - stop movement occurring. 
            if (!currentSnake.alive) {
                continue;
            }
    
            // If no collisions are detected, a new chunk is created and added onto the front of the array, with the newX and Y positions.
            let anotherChunk = createNewChunk(newX, newY, currentSnake.class);
            currentSnake.chunks.unshift(anotherChunk);
            GAME.appendChild(anotherChunk); 
    
            // The last chunk on the end of the array, is removed - unless the amount of chunks is less than the targetLength!  
            if (currentSnake.chunks.length > currentSnake.targetLength) {
                currentSnake.chunks.pop().remove();
            }
    
            currentSnake.lastMoveDir = currentSnake.nextMoveDir; 
        }
        // Now check the projected co-ords for each snake, for snakes projected co-ords. If they conflict, move one player into position and kill both of them. 
    }
}

function destroySnake(snake) {



    // Dispose of this snake... with style (hopefully)! 
    snake.alive = false;
    var currentChunk = 0;
    var deletedChunk = 0;
    var totalChunks = snake.chunks.length;

    function destroyChunk(chunk) {
        if (currentChunk < totalChunks) {
            snake.chunks[chunk].className += " vibrate destroyed";
            currentChunk++; 
            setTimeout(function() {
                destroyChunk(currentChunk); 
            }, 125); 
        }
    }

    function deleteChunks() {   
        if (deletedChunk < totalChunks) {
            snake.chunks.shift().remove();
            deletedChunk++; 
            // If we have finished destroying this snake, check if there are no more snakes left. 
            if (snake.chunks.length < 1) {
                checkGameOver();
                return;
            }
            setTimeout(function() {
                deleteChunks(); 
            }, 250); 
        }
    }

    destroyChunk(currentChunk);

    setTimeout(function() {
        deleteChunks();
    }, 250 * snake.chunks.length); 
}

function checkGameOver() {
    let snakesLeft = 0;
    for (let snakeNo = 0; snakeNo < snakes.length; snakeNo++) {
        let currentSnake = snakes[snakeNo]; 
        if (currentSnake.alive) {
            // Update scoring stuff. 
            lastSnakeStanding = currentSnake; 
            if (biggestSnake.food < currentSnake.chunks.length - initLength) {
                biggestSnake.name = currentSnake.name;
                biggestSnake.food = currentSnake.chunks.length - initLength;
            }
            snakesLeft++; 
        }
    }
    if (snakesLeft < 2) {
        showEndScreen();
    }
}

function createNewChunk(x, y, playerClass) {
    let newChunk = document.createElement("div");
    newChunk.className = `${playerClass} snakeChunk`; 
    newChunk.style.left = intToPos(x);
    newChunk.style.top = intToPos(y);
    return newChunk;
}

function clampDown(value, clampDownTo) {
    let remainder = value % clampDownTo;
    return value - remainder; 
}

function intToPos(number) {
    return `${number}px`;
}

function posToInt(pos) {
    return parseInt(pos.split("px")[0]) | 0;
}

function durationToInt(duration) {
    return parseInt(duration.split("s")[0]) || 0; 
  }

function intToDuration(number) {
    return `${number}s`;
}
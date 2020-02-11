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

// In place of enumeration - not sure if js properly does those. 
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;

// Input keycodes for each player.
const ESCAPE = 27; 
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

// Start val for player:  1,   2,   3,   4. 
const startPositionsX = [50, 325,  50, 325];
const startPositionsY = [50, 325, 325,  50]; 
const playerColors = ["yellow", "rgb(0, 220, 213)", "rgb(213, 50, 0)", "rgb(30, 190, 0)"];
const playerClasses = ["player1", "player2", "player3", "player4"];
const initLength = 3;
var snakes = []; 
var supermarket = [];

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
    let title = document.createElement("a");
    title.className = "interactiveText";
    title.innerText = "PAC-SNAKE";  
    title.href = "javascript:showPlayersScreen()";
    GAME.appendChild(title);
}

addEventListener("load", function() {
    showTitle();
})

function showPlayersScreen() {

    clearScreen(); 

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
}

function showEndScreen() {

    clearScreen();

    let pl1 = document.createElement("a"); 
    let pl2 = document.createElement("a");
    let pl3 = document.createElement("a");
    let pl4 = document.createElement("a");

    pl1.className = "interactiveText";
    pl2.className = "interactiveText";
    pl3.className = "interactiveText";
    pl4.className = "interactiveText";

    pl1.innerText = `THE LAST SNAKE STANDING WAS `;
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

function createSnakes(players) {
    for (let i = 0; i < players; i++) {
        let newSnake = new Object();
        newSnake.x = [];
        newSnake.y = [];
        newSnake.active = true;
        newSnake.score = 0;
        newSnake.nextMoveDir = null;
        newSnake.lastMoveDir = null; 

        newSnake.targetLength = initLength; 
        newSnake.x[0] = startPositionsX[i];
        newSnake.y[0] = startPositionsY[i];
        newSnake.chunks = []; 

        // Set initial chunk positions and movement direction for each snake, depending on player number. 
        switch(i) {
            case 0:
                newSnake.nextMoveDir = UP;
                newSnake.x[1] = newSnake.x[0];
                newSnake.y[1] = newSnake.y[0] + OBJECT_SIZE;
                newSnake.x[2] = newSnake.x[0];
                newSnake.y[2] = newSnake.y[0] + (OBJECT_SIZE * 2);
                break;
            case 1: 
                newSnake.nextMoveDir = DOWN;
                newSnake.x[1] = newSnake.x[0];
                newSnake.y[1] = newSnake.y[0] - OBJECT_SIZE;
                newSnake.x[2] = newSnake.x[0];
                newSnake.y[2] = newSnake.y[0] - (OBJECT_SIZE * 2);
                break;
            case 2:
                newSnake.nextMoveDir = LEFT;
                newSnake.x[1] = newSnake.x[0] + OBJECT_SIZE;
                newSnake.y[1] = newSnake.y[0];
                newSnake.x[2] = newSnake.x[0] + (OBJECT_SIZE * 2);
                newSnake.y[2] = newSnake.y[0];
                break;
            case 3:
                newSnake.nextMoveDir = RIGHT;
                newSnake.x[1] = newSnake.x[0] - OBJECT_SIZE;
                newSnake.y[1] = newSnake.y[0];
                newSnake.x[2] = newSnake.x[0] - (OBJECT_SIZE * 2);
                newSnake.y[2] = newSnake.y[0];
                break;
        }

        newSnake.lastMoveDir = newSnake.nextMoveDir; 

        snakes.push(newSnake);
        for (let chunkNumber = 0; chunkNumber < newSnake.x.length; chunkNumber++) {
            anotherChunk = createNewChunk(newSnake.x[chunkNumber], newSnake.y[chunkNumber], playerClasses[i]);
            newSnake.chunks.push(anotherChunk);
            GAME.appendChild(anotherChunk); 
        }
    }
}

function start(players) {

    // Clear the play space. 
    clearScreen();

    // Create the number of snakes we need and their 3 initial chunks. 
    createSnakes(players); 

    addEventListener("keydown", function(e) {
        setMoveDir(e);
    })

    // Kick off interval that moves the snakes. 
    moveInterval = setInterval(function() {
        moveSnakes();
    }, 500); 

    spawnFood();

}

function spawnFood() {
    let x = clampDown(Math.random() * MAX_X_POS, OBJECT_SIZE);
    let y = clampDown(Math.random() * MAX_Y_POS, OBJECT_SIZE);

    let food = document.createElement("div"); 
    food.className = "food"; 
    food.style.left = intToPos(x);
    food.style.top = intToPos(y); 
    // food.style.marginLeft = intToPos(6.25);
    // food.style.marginTop = intToPos(6.25);
    supermarket.push(food); 
    GAME.appendChild(food); 
}

function setMoveDir(e) {

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

    // Now deal with the key press - somehow lastMoveDir has broken this... 
    switch(e.which) {

        case ESCAPE:
            clearInterval(moveInterval); 
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
}

function moveSnakes() {

    for (let i = 0; i < snakes.length; i++) {

        let currentSnake = snakes[i]; 
        if (!currentSnake.active) {
            continue;
        }

        // Calculate predicted new position. 
        let newX = currentSnake.x[0];
        let newY = currentSnake.y[0]; 
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
                        destroySnake(currentSnake);
                        destroySnake(otherSnake);
                        if (snakes.length < 1) {
                            showEndScreen();
                        }
                        return;
                    }
                }
            }
        }

        // If no collisions are detected, a new chunk is created and added onto the front of the array, with the newX and Y positions.
        currentSnake.x.unshift(newX);
        currentSnake.y.unshift(newY); 

        let anotherChunk = createNewChunk(newX, newY, playerClasses[i]);
        currentSnake.chunks.unshift(anotherChunk);
        GAME.appendChild(anotherChunk); 

        // The last chunk on the end of the array, is removed - unless the amount of chunks is less than the targetLength!  
        if (currentSnake.x.length > currentSnake.targetLength) {
            currentSnake.x.pop();
            currentSnake.y.pop(); 
            currentSnake.chunks.pop().remove();
        }

        currentSnake.lastMoveDir = currentSnake.nextMoveDir; 
    }
}

function destroySnake(snake) {
    snake.active = false;
    for (let i = 0; i < snake.chunks.length; i++) {;
        let chunk = snake.chunks[i];
        chunk.className += " vibrate destroyed";
        snake.chunks.pop().remove;
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
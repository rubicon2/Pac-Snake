// Array of players, contains arrays of each player's snake chunk positions. 
const GAME = document.getElementById("game"); 
const SCORE = document.getElementById("score");
const GAME_WIDTH = 400; 
const GAME_HEIGHT = 400;
const OBJECT_SIZE = 25;
const MAX_X_POS = GAME_WIDTH - OBJECT_SIZE;
const MAX_Y_POS = GAME_HEIGHT - OBJECT_SIZE;

var moveInterval = null;
var foodTimeout = null; 

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
const initLength = 3;
const snakes = []; 
const supermarket = [];

function start(players) {

    // Clear the play space. 

    let startTexts = document.getElementsByClassName("startText"); 
    // Omitted i++ on purpose as it never iterated through the whole list. The length keeps changing as you remove elements, 
    // meaning you want to keep removing the element at index 0. There has to be a better way to do this... 
    for (let i = 0; i < startTexts.length;) {
        startTexts[i].remove();
    }

    let otherStuff = document.getElementsByTagName("p");
    for (let i = 0; i < otherStuff.length;) {
        otherStuff[i].remove();
    }

    // Create the number of snakes we need and their 3 initial chunks. 

    for (let i = 0; i < players; i++) {
        let newSnake = new Object();
        newSnake.x = [];
        newSnake.y = [];
        newSnake.active = true;

        newSnake.targetLength = initLength; 
        newSnake.x[0] = startPositionsX[i];
        newSnake.y[0] = startPositionsY[i];
        newSnake.chunks = []; 

        // Set initial chunk positions and movement direction for each snake, depending on player number. 
        switch(i) {
            case 0:
                newSnake.moveDir = UP;
                newSnake.x[1] = newSnake.x[0];
                newSnake.y[1] = newSnake.y[0] + 25;
                newSnake.x[2] = newSnake.x[0];
                newSnake.y[2] = newSnake.y[0] + 50;
                break;
            case 1: 
                newSnake.moveDir = DOWN;
                newSnake.x[1] = newSnake.x[0];
                newSnake.y[1] = newSnake.y[0] - 25;
                newSnake.x[2] = newSnake.x[0];
                newSnake.y[2] = newSnake.y[0] - 50;
                break;
            case 2:
                newSnake.moveDir = LEFT;
                newSnake.x[1] = newSnake.x[0] + 25;
                newSnake.y[1] = newSnake.y[0];
                newSnake.x[2] = newSnake.x[0] + 50;
                newSnake.y[2] = newSnake.y[0];
                break;
            case 3:
                newSnake.moveDir = RIGHT;
                newSnake.x[1] = newSnake.x[0] - 25;
                newSnake.y[1] = newSnake.y[0];
                newSnake.x[2] = newSnake.x[0] - 50;
                newSnake.y[2] = newSnake.y[0];
                break;
        }

        snakes.push(newSnake);
        for (let chunkNumber = 0; chunkNumber < newSnake.x.length; chunkNumber++) {
            anotherChunk = createNewChunk(newSnake.x[chunkNumber], newSnake.y[chunkNumber], playerColors[i]);
            newSnake.chunks.push(anotherChunk);
            GAME.appendChild(anotherChunk); 
        }
    }

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
    let x = clampDown(Math.random() * MAX_X_POS, 25);
    let y = clampDown(Math.random() * MAX_Y_POS, 25);

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

    // Now deal with the key press. 
    switch(e.which) {

        case ESCAPE:
            clearInterval(moveInterval); 
            break; 

        case PLAYER_1_UP:
            if (snakes[0].moveDir != DOWN) {
                snakes[0].moveDir = UP;
            }  
            break;
        case PLAYER_1_RIGHT:
            if (snakes[0].moveDir != LEFT) {
                snakes[0].moveDir = RIGHT;
            }
            break;
        case PLAYER_1_DOWN:
            if (snakes[0].moveDir != UP) {
                snakes[0].moveDir = DOWN;
            }
            break;
        case PLAYER_1_LEFT:
            if (snakes[0].moveDir != RIGHT) {
                snakes[0].moveDir = LEFT;
            }
            break;

        case PLAYER_2_UP:
            if (snakes[1].moveDir != DOWN) {
                snakes[1].moveDir = UP;
            }  
            break;
        case PLAYER_2_RIGHT:
            if (snakes[1].moveDir != LEFT) {
                snakes[1].moveDir = RIGHT;
            }
            break;
        case PLAYER_2_DOWN:
            if (snakes[1].moveDir != UP) {
                snakes[1].moveDir = DOWN;
            }
            break;
        case PLAYER_2_LEFT:
            if (snakes[1].moveDir != RIGHT) {
                snakes[1].moveDir = LEFT;
            }
            break;

        case PLAYER_3_UP:
            if (snakes[2].moveDir != DOWN) {
                snakes[2].moveDir = UP;
            }  
            break;
        case PLAYER_3_RIGHT:
            if (snakes[2].moveDir != LEFT) {
                snakes[2].moveDir = RIGHT;
            }
            break;
        case PLAYER_3_DOWN:
            if (snakes[2].moveDir != UP) {
                snakes[2].moveDir = DOWN;
            }
            break;
        case PLAYER_3_LEFT:
            if (snakes[2].moveDir != RIGHT) {
                snakes[2].moveDir = LEFT;
            }
            break;
    
        case PLAYER_4_UP:
            if (snakes[3].moveDir != DOWN) {
                snakes[3].moveDir = UP;
            }  
            break;
        case PLAYER_4_RIGHT:
            if (snakes[3].moveDir != LEFT) {
                snakes[3].moveDir = RIGHT;
            }
            break;
        case PLAYER_4_DOWN:
            if (snakes[3].moveDir != UP) {
                snakes[3].moveDir = DOWN;
            }
            break;
        case PLAYER_4_LEFT:
            if (snakes[3].moveDir != RIGHT) {
                snakes[3].moveDir = LEFT;
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
        switch(currentSnake.moveDir) {
            case UP:
                newY -= 25;
                break;
            case RIGHT:
                newX += 25;
                break;
            case DOWN:
                newY += 25;
                break;
            case LEFT:
                newX -= 25; 
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
                console.log("MY SNAKE IS GROWING!!"); 
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
                        console.log("GAME OVER 4 U!!!!"); 
                        currentSnake.active = false; 
                        otherSnake.active = false;
                        // clearInterval(moveInterval); 
                    }
                }
            }
        }

        // A new chunk is created and added onto the front of the array, with the newX and Y positions.
        currentSnake.x.unshift(newX);
        currentSnake.y.unshift(newY); 

        let anotherChunk = createNewChunk(newX, newY, playerColors[i]);
        currentSnake.chunks.unshift(anotherChunk);
        GAME.appendChild(anotherChunk); 

        // The last chunk on the end of the array, is removed - unless the amount of chunks is less than the targetLength!  
        if (currentSnake.x.length > currentSnake.targetLength) {
            currentSnake.x.pop();
            currentSnake.y.pop(); 
            currentSnake.chunks.pop().remove();
        }
        

        // clearInterval(moveInterval);
    }

    // Check for collisions - this is purely based on top/left style values. Everything will be on a grid, clamped to multiples of 25px. 

    // If a player collides with themselves, or any other snake, they are dead m8! 

    // If they collide with some YUMMY FOOD, their targetLength is incremented. 

    // Depending on their movement direction, a new chunk is created and added onto the front of the array. 

    // The last chunk on the end of the array, is removed - unless the amount of chunks is less than the targetLength!  

}

function createNewChunk(x, y, color) {
    let newChunk = document.createElement("div");
    newChunk.className = "snakeChunk"; 
    newChunk.style.left = intToPos(x);
    newChunk.style.top = intToPos(y);
    newChunk.style.backgroundColor = color;
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
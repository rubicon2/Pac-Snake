// Very exciting stuff. 
const GAME = document.getElementById("game"); 
const SCORE = document.getElementById("score");
const GAME_WIDTH = GAME.offsetWidth; 
const GAME_HEIGHT = GAME.offsetHeight;
const OBJECT_SIZE = 25;
const MAX_X_POS = GAME_WIDTH - OBJECT_SIZE;
const MAX_Y_POS = GAME_HEIGHT - OBJECT_SIZE;

// Game states.
const TITLE_SCREEN = 0;
const PLAYERS_SCREEN = 1;
const SETTINGS_SCREEN = 2;
const GAME_SCREEN = 3;
const GAME_OVER_SCREEN = 4;

// In place of enumeration for player movement directions - not sure if js properly does those. 
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;
 
// Used to quit back to title. 
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
const startLengths = [12, 12, 6, 3];
const startPositionsX = [50, 325,  50, 325];
const startPositionsY = [50, 325, 325,  50]; 
const startMoveDir = [UP, DOWN, LEFT, RIGHT]; 
const playerNames = ["PINK", "BLUE", "RED", "GREEN"];
const playerClasses = ["player1", "player2", "player3", "player4"];

// Different speeds. 
const SLOW = 125;
const NORMAL = 250; 
const FAST = 375; 
const INSANE = 500; 

const GAME_SPEED = [{name:"SLOW", speed:500}, {name:"NORMAL", speed:325}, {name:"FAST", speed:200}, {name:"FASTER", speed:75}, {name:"INSANE", speed:50}, {name:"???", speed:"R"}];

// "Global" stuff. 
var state = TITLE_SCREEN;

// Stuff to be used for main game loop. 
var moveInterval = null;
var foodTimeout = null; 

var playerData = [];
var snakes = []; 
var supermarket = [];

var isPaused = false;
var gameOver = false; 
var roundOver = false;

var playersYo = 2;
var initLength = 0;
var roundsToWin = 3;
var gameSpeedSetting = 2; 

var currentRound = 0;

// Store info for end game display. 
var lastSnakeStanding = null; 
var biggestSnake = {name:"NOBODY", food:"0"}; 
var compliments = ["GARGANTUAN", "GLORIOUS", "SPECTACULAR", "GODLIKE", "HIDEOUS", "DEFORMED", "BLURFING", "SCHPLINDLEOUS", "BREATHTAKING", "TOTALLY GORGEOUS", "SNAKE-LIKE", "SNAKE-ISH", "FLOPPY", "FLOPPING", "GERFLINGTONINGLY"];
var eating = ["SCOFFED", "MUNCHED ON", "SCARFED", "GOBBLED", "SCHLOIMBRD", "FIT INTO THEIR GOBHOLE", "SCRIMBLED", "GNASHED", "STOLE FROM THE MOUTHS OF CHILDREN", "FLEECED", "LOOTED", "SPLURFLED", "ATE WITH THEIR MOUTH", "DEVOURED", "GOBSHNARFED", "STOLE FROM A CHARITY SHOP", "GLOBBISHLY MUNCHED"];
var foods = ["FESTERING SCHWIMBLES", "TURNIPS", "SLIGHTLY SMALLER SNAKES", "YOUR MUM", "WEIRD ROTATING SQUARES", "DARK MATTER", "PIXEL BITZ", "HAGGIS", "DOUGHNUT HOLES", "FRESH GLOMBLES", " PREMIUM SCHPLARFNITZLS", "TOAST", "GOOBERS", "EYE HOLES", "WORMS WHICH ARE NOT AT ALL LIKE SNAKES", "SCRUMBLES"];
var currentEndText = 0;
var endTexts = [];

function clearScreen() {

    // WARNING! 
    // Don't clear lastSnakeStanding or biggestSnake values in here, because they need to hold their values between the game and game over screens. 
    // They are reset in the start() function instead. 

    clearInterval(moveInterval);
    clearTimeout(foodTimeout);
    moveInterval = null;
    foodTimeout = null; 
    snakes = [];
    supermarket = [];
    gameOver = false;
    roundOver = false; 
    isPaused = false; 

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
    title.href = "javascript:showSetupScreen()";
    GAME.appendChild(title);

    createSnake(0, 25, 3, RIGHT, playerClasses[0], "nothing");
    createSnake(375, 125, 3, LEFT, playerClasses[1], "literally doesn't matter");
    createSnake(25, 325, 3, UP, playerClasses[2], "who cares");
    createSnake(350, 325, 3, DOWN, playerClasses[3], "filler");

    // Kick off interval that moves the snakes. 
    resetMoveTimer(GAME_SPEED[1].speed);
}

function resetMoveTimer(speed) {
    clearInterval(moveInterval);
    if (speed == "R") {
        let index = Math.floor(Math.random() * (GAME_SPEED.length - 2)); 
        console.log("RANDOMISING SPEED TO INDEX " + index); 
        speed = GAME_SPEED[index].speed; 
    }
    moveInterval = setInterval(function() {
        moveSnakes();
    }, speed); 
}

addEventListener("keydown", function(e) {
    handleInput(e);
})

addEventListener("load", function() {
    showTitle();
})

function showPlayersScreen() {

    clearScreen(); 
    state = PLAYERS_SCREEN; 

    let container = document.createElement("div");
    container.className = "playerTextContainer";

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

    pl1.href = "javascript:startGame(1)";
    pl2.href = "javascript:startGame(2)";
    pl3.href = "javascript:startGame(3)";
    pl4.href = "javascript:startGame(4)";

    // GAME.appendChild(pl1);
    container.appendChild(pl2);
    container.appendChild(pl3);
    container.appendChild(pl4);
    GAME.appendChild(container);
}

function setupLessRounds() {
    if (roundsToWin > 1) {
        roundsToWin--; 
        document.getElementById("setup_rounds").innerText = roundsToWin; 
    }
}

function setupMoreRounds() {
    if (roundsToWin < Number.MAX_SAFE_INTEGER) {
        roundsToWin++; 
        document.getElementById("setup_rounds").innerText = roundsToWin; 
    }
}

function setupLessPlayers() {
    if (playersYo > 2) {
        playersYo--; 
        document.getElementById("setup_players").innerText = playersYo; 
        document.getElementById("setup_ok").href = `javascript:startGame(${playersYo})`;
    }   
}

function setupMorePlayers() {
    if (playersYo < 4) {
        playersYo++; 
        document.getElementById("setup_players").innerText = playersYo; 
        document.getElementById("setup_ok").href = `javascript:startGame(${playersYo})`;
    }
}

function setupLowerSpeed() {
    if (gameSpeedSetting > 0) {
        gameSpeedSetting--; 
        document.getElementById("setup_speed").innerText = GAME_SPEED[gameSpeedSetting].name; 
    }
    resetMoveTimer(GAME_SPEED[gameSpeedSetting].speed); 
}

function setupHigherSpeed() {
    if (gameSpeedSetting < GAME_SPEED.length - 1) {
        gameSpeedSetting++; 
        document.getElementById("setup_speed").innerText = GAME_SPEED[gameSpeedSetting].name; 
    }
    resetMoveTimer(GAME_SPEED[gameSpeedSetting].speed); 
}

function previousOption() {
    let options = document.getElementsByClassName("setupText");
    let selected = document.getElementsByClassName("selectedSetupText");  
    for (let i = options.length - 1; i >= 0; i--) {
        if (options[i].className.includes("selectedSetupText")) {
            options[i].className = "setupOption setupText pulse"; 
            let nextOption = i - 1 >= 0 ? i - 1 : options.length - 1; 
            options[nextOption].className = "setupOption setupText selectedSetupText pulse"; 
            break; 
        }
    }
}

function nextOption() {
    let options = document.getElementsByClassName("setupText"); 
    for (let i = 0; i < options.length; i++) {
        if (options[i].className.includes("selectedSetupText")) {
            options[i].className = "setupOption setupText pulse"; 
            let nextOption = i + 1 < options.length ? i + 1 : 0; 
            options[nextOption].className = "setupOption setupText selectedSetupText pulse"; 
            break; 
        }
    }
}

function changeOptionSetting(up) {
    let selected = document.getElementsByClassName("selectedSetupText"); 
    let option = selected[0].id; 
    switch(option) {
        case "setup_rounds":
            if (up) {
                setupMoreRounds();
            } else {
                setupLessRounds(); 
            }
            break;
        case "setup_players":
            if (up) {
                setupMorePlayers();
            } else {
                setupLessPlayers(); 
            }
            break;
        case "setup_speed":
            if (up) {
                setupHigherSpeed();
            } else {
                setupLowerSpeed(); 
            }
            break;
    }
}

function showSetupScreen() {

    clearScreen(); 
    state = SETTINGS_SCREEN;

    let settingsContainer = document.createElement("div"); 
    settingsContainer.className = "playerTextContainer"; 

    let roundsTitleLine = document.createElement("div");
    roundsTitleLine.className = "setupLine"; 

    let roundsTitle = document.createElement("div");
    roundsTitle.className = "setupTitle"; 
    roundsTitle.innerText = "ROUNDS TO WIN"; 

    roundsTitleLine.appendChild(roundsTitle); 

    let snakesTitleLine = document.createElement("div");
    snakesTitleLine.className = "setupLine"; 
    snakesTitleLine.innerText = "SNAKES"; 

    let speedTitleLine = document.createElement("div");
    speedTitleLine.className = "setupLine"; 
    speedTitleLine.innerText = "SPEED"; 

    let roundsLine = document.createElement("div"); 
    roundsLine.className = "setupLine"; 

    let lessRounds = document.createElement("a");
    lessRounds.className = "setupOption image sub"; 
    lessRounds.href = "javascript:setupLessRounds()"; 

    let rounds = document.createElement("div");
    rounds.innerText = roundsToWin;  
    rounds.className = "setupOption setupText selectedSetupText pulse"; 
    rounds.id = "setup_rounds"; 

    let moreRounds = document.createElement("a");
    moreRounds.className = "setupOption image add"; 
    moreRounds.href = "javascript:setupMoreRounds()"; 

    roundsLine.appendChild(lessRounds); 
    roundsLine.appendChild(rounds); 
    roundsLine.appendChild(moreRounds); 

    let playersLine = document.createElement("div"); 
    playersLine.className = "setupLine"; 

    let lessPlayers = document.createElement("a");
    lessPlayers.className = "setupOption image sub"; 
    lessPlayers.href = "javascript:setupLessPlayers()"; 

    let morePlayers = document.createElement("a");
    morePlayers.className = "setupOption image add"; 
    morePlayers.href = "javascript:setupMorePlayers()"; 

    let players = document.createElement("div");
    players.innerText = playersYo;  
    players.className = "setupOption setupText pulse"; 
    players.id = "setup_players"; 

    playersLine.appendChild(lessPlayers); 
    playersLine.appendChild(players); 
    playersLine.appendChild(morePlayers); 

    let speedLine = document.createElement("div"); 
    speedLine.className = "setupLine"; 

    let slowerSpeed = document.createElement("a"); 
    slowerSpeed.className = "setupOption image sub"; 
    // slowerSpeed.innerText = "SLOWER"; 
    slowerSpeed.href = "javascript:setupLowerSpeed()"; 

    let fasterSpeed = document.createElement("a"); 
    fasterSpeed.className = "setupOption image add"; 
    // fasterSpeed.innerText = "FASTER"; 
    fasterSpeed.href = "javascript:setupHigherSpeed()"; 

    let gameSpeedDiv = document.createElement("div"); 
    gameSpeedDiv.innerText = GAME_SPEED[gameSpeedSetting].name; 
    gameSpeedDiv.className = "setupOption setupText pulse"; 
    gameSpeedDiv.id = "setup_speed"; 

    speedLine.appendChild(slowerSpeed); 
    speedLine.appendChild(gameSpeedDiv); 
    speedLine.appendChild(fasterSpeed); 

    let okLine = document.createElement("div"); 
    okLine.className = "setupLine"; 

    let ok = document.createElement("a"); 
    ok.className = "setupOption setupText"; 
    ok.innerText = "OK"; 
    ok.id = "setup_ok"; 
    ok.style = "margin-top: 10px;"; 
    ok.href = `javascript:startGame(${playersYo})`;

    okLine.appendChild(ok); 

    settingsContainer.appendChild(roundsTitleLine); 
    settingsContainer.appendChild(roundsLine); 

    settingsContainer.appendChild(snakesTitleLine); 
    settingsContainer.appendChild(playersLine); 

    settingsContainer.appendChild(speedTitleLine); 
    settingsContainer.appendChild(speedLine); 

    settingsContainer.appendChild(okLine); 

    GAME.appendChild(settingsContainer); 

    createSnake(25, 325, 8, UP, playerClasses[0], "who cares");
    createSnake(350, 325, 8, DOWN, playerClasses[1], "filler");

    // Kick off interval that moves the snakes. 
    resetMoveTimer(GAME_SPEED[2].speed); 
}

function showEndScreen() {

    clearScreen();
    state = GAME_OVER_SCREEN;

    currentEndText = 0;
    let endTexts = [];
    let lastSnakeName = lastSnakeStanding == null ? "ABSOLUTELY NOBODY!" : lastSnakeStanding.name;
    endTexts[0] = `THE LAST SNAKE STANDING WAS ${lastSnakeName}`;
    endTexts[1] =  `THE MOST ${compliments[Math.round((Math.random() * (compliments.length - 1)))]} SNAKE WAS ${biggestSnake.name} WHO ${eating[Math.round((Math.random() * (eating.length - 1)))]} ${biggestSnake.food} PIECES OF ${foods[Math.round((Math.random() * (foods.length - 1)))]}.`;

    /*
    let pl1 = document.createElement("a"); 
    pl1.className = "centeredText";
    pl1.innerText = endTexts[0];
    GAME.appendChild(pl1);
    */

    let pl1 = createText(endTexts[0], "centeredText endText"); 

    // Re-do this so uses event listeners etc.! More reliable timing! 
    setTimeout(function() {
        // After text has faded out again. 
        pl1.innerText = endTexts[1];
        setTimeout(function() {
            pl1.remove();
            setTimeout(function() {
                showTitle(); 
            }, 500);
        }, 10000); 
    }, 10000); 
}

// Called at start of a round. 
function createSnake(originX, originY, startLength, initialMoveDir, playerClass, playerName) {

    let newSnake = new Object();
    newSnake.name = playerName; 
    newSnake.class = playerClass;
    newSnake.alive = true;
    newSnake.nextMoveDir = initialMoveDir;
    newSnake.lastMoveDir = initialMoveDir; 
    newSnake.targetLength = startLength; 
    newSnake.chunks = []; 

    // Stats for fun time end screens. 
    // How much food eaten. 
    newSnake.score = 0;
    // ...
    newSnake.roundsWon = 0; 
    // Names of players that has caused their deaths. Can use this to make a nemesis/rival thing! 
    newSnake.killedBy = [];
    // Names of players whose deaths they have caused. 
    newSnake.killed = []; 

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
        let chunkClass = i == 0 ? playerClass + " image snakeHead" : playerClass;
        let anotherChunk = createNewChunk((originX + (OBJECT_SIZE * xMult)) % GAME_WIDTH, (originY + (OBJECT_SIZE * yMult)) % GAME_HEIGHT, chunkClass); 
        anotherChunk.style.transform = getRotation(initialMoveDir); 
        newSnake.chunks.push(anotherChunk); 
        GAME.appendChild(anotherChunk); 
    }
    snakes.push(newSnake); 
}

function startGame(players) {
    playerData = []; 
    for (let i = 0; i < players; i++) {
        let player = new Object(); 
        player.roundsWon = 0;
        player.killed = [];
        player.killedBy = []; 
        playerData.push(player); 
    }
    startRound(players); 
}

function startRound(players) {

    currentRound++; 
    roundOver = false;

    // Clear the play space. 
    clearScreen();
    state = GAME_SCREEN;

    // Reset high score values. 
    lastSnakeStanding = null;
    biggestSnake.name = "ABSOLUTELY NOBODY";
    biggestSnake.food = 0; 

    // Create the number of snakes we need and their initial chunks. 
    for (let i = 0; i < players; i++) {
        createSnake(startPositionsX[i], startPositionsY[i], startLengths[players - 1], startMoveDir[i], playerClasses[i], playerNames[i]); 
    }

    let countdown = createText("3", "countdownText unselectable");

    function updateCountdown() {
        let newText = parseInt(countdown.innerText) - 1;
        if (parseInt(newText) < 1) {
            newText = "GO!";
            // Sets snakes moving. 
            resetMoveTimer(GAME_SPEED[gameSpeedSetting].speed); 
            // Change animation/iteration so "GO!" will fade out nicely, then remove itself and clear all event listeners. 
            setTimeout(function() {
                // Need to change this here and THEN add event listener for animation end so it doesn't trigger from where it was doing more than 1 iteration. 
                countdown.style.animationIterationCount = 1;
                countdown.style.animationName = "fadeOut"; 
                setTimeout(function() {
                    countdown.addEventListener("animationend", removeCountdown, false);
                }, 1000);
            }, 1000); 
        }
        countdown.innerText = newText; 
    }

    function removeCountdown() {
        countdown.removeEventListener("animationiteration", updateCountdown, false);
        countdown.removeEventListener("animationend", removeCountdown, false); 
        countdown.remove();
        spawnFood();
    }

    countdown.addEventListener("animationiteration", updateCountdown, false); 
}

function createText(newText, classes) {
    let text = document.createElement("div");
    text.className = classes;
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
    } while (xyOK == false); 

    let food = document.createElement("div"); 
    food.className = "food"; 
    food.style.left = intToPos(x);
    food.style.top = intToPos(y); 
    supermarket.push(food); 
    GAME.appendChild(food); 
}

function handleInput(e) {

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
                    if (!roundOver) {
                        isPaused = (isPaused) ? false : true;
                    } else if (!gameOver) {
                        startRound(playerData.length); 
                    } else {
                        showEndScreen(); 
                    }
                     
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
                    // showPlayersScreen();
                    showSetupScreen(); 
                    break;
            }
            break;

        case SETTINGS_SCREEN:
            switch(e.which) {
                case PLAYER_1_UP:
                    previousOption();
                    break;
                case PLAYER_1_DOWN: 
                    nextOption();
                    break;
                case PLAYER_1_LEFT:
                    // turn option down
                    changeOptionSetting(0); 
                    break;
                case PLAYER_1_RIGHT:
                    // turn option up
                    changeOptionSetting(1); 
                    break;
                case SPACE:
                    // if on OK option, start game. 
                    startGame(playersYo);
                    break;
                case ESCAPE:
                    showTitle(); 
                    break;
            }
            break;

        case PLAYERS_SCREEN:
            switch(e.which) {
                case NUM_1:
                    // start(1); 
                    break;
                case NUM_2:
                    startGame(2);
                    break;
                case NUM_3:
                    startGame(3);
                    break;
                case NUM_4:
                    startGame(4);
                    break;
            }
            break;

        case GAME_OVER_SCREEN:
            switch(e.which) {
                case SPACE:
                    console.log("This was supposed to do something lol");
            }
            break;
    }
}

function getRotation(moveDir) {

    let newRotation = ""; 

    switch(moveDir) {
        case UP:
            newRotation = "rotate(180deg)";
            break;
        case RIGHT:
            newRotation = "rotate(270deg)";
            break;
        case DOWN:
            newRotation = "rotate(0deg)"; 
            break;
        case LEFT:
            newRotation = "rotate(90deg)"; 
            break;
    }

    return newRotation; 
}

function moveSnakes() {

    if (!isPaused && !gameOver && !roundOver) {

        // Remove the tail of each snake before doing any collision checking. 
        // As each snake moves sequentially, but it looks simultaneous - this solves the issue of players hitting and being killed by 
        // another's (or their own) tail when it should have moved out of the way in the same step, as the head moves into the space the tail once occupied. 
        for (let i = 0; i < snakes.length; i++) {
            let currentSnake = snakes[i]; 
            // The last chunk on the end of the array, is removed - unless the amount of chunks is less than the targetLength!  
            if (currentSnake.chunks.length > currentSnake.targetLength) {
                currentSnake.chunks.pop().remove();
            }
        }

        // Need to change this so calculates projected positions - checks against other snakes projected positions. 
        // If there is a conflict, kill all snakes involved so this is actually fair! 
        // Otherwise, player 1 has an advantage over everyone else, and player 2 over 3 and 4, etc. as player 1 moves first. 
        for (let i = 0; i < snakes.length; i++) {

            let currentSnake = snakes[i]; 
            if (!currentSnake.alive) {
                continue;
            }
    
            // Calculate predicted new position. 
            let newX = posToInt(currentSnake.chunks[0].style.left); 
            let newY = posToInt(currentSnake.chunks[0].style.top); 
            newRotation = getRotation(currentSnake.nextMoveDir); 
    
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
                    resetMoveTimer(GAME_SPEED[gameSpeedSetting].speed); 
                    spawnFood(); 
                }
            }
    
            // Collision detection for those not so gorgeous snakes... 
            for (let snakeAisle = 0; snakeAisle < snakes.length; snakeAisle++) {
                let otherSnake = snakes[snakeAisle]; 
                // If other snake is dead, then don't bother checking - player can run over dead snakes without dying. 
                if (!otherSnake.alive) {
                    continue;
                }
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
            let anotherChunk = createNewChunk(newX, newY, currentSnake.class + " image snakeHead");
            anotherChunk.style.transform = newRotation; 
            currentSnake.chunks.unshift(anotherChunk);
            GAME.appendChild(anotherChunk); 

            // Change class of previous chunk so it is no longer a head. 
            let oldHead = currentSnake.chunks[1]; 
            oldHead.className = `${playerClasses[i]} snakeChunk`; 
            oldHead.style.transform = "rotate(0deg)";
    
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
            snake.chunks[chunk].className += " destroyed";
            currentChunk++; 
            setTimeout(function() {
                destroyChunk(currentChunk); 
            }, 125); 
        } else {
            // If all chunks have been animated, start destroying those bad boys after a short delay.
            setTimeout(function() {
                deleteChunks();
            }, 1000); 
        }
    }

    function deleteChunks() {   
        if (deletedChunk < totalChunks) {
            snake.chunks.shift().remove();
            deletedChunk++; 
            // If we have finished destroying this snake, check if there are no more snakes left. 
            if (snake.chunks.length < 1) {
                checkRoundOver();
                return;
            }
            setTimeout(function() {
                deleteChunks(); 
            }, 250); 
        }
    }

    destroyChunk(currentChunk);
}

function checkRoundOver() {
    let snakesLeft = [];
    for (let snakeNo = 0; snakeNo < snakes.length; snakeNo++) {
        let currentSnake = snakes[snakeNo]; 
        if (currentSnake.alive) {
            // Update scoring stuff for last snake standing. 
            lastSnakeStanding = currentSnake; 
            snakesLeft.push(snakeNo); 
        }
        if (biggestSnake.food < currentSnake.score) {
            biggestSnake.name = currentSnake.name;
            biggestSnake.food = currentSnake.score;
        }
    }
    // Game over flag doesn't stop text triggering twice... why? 
    if (snakesLeft.length < 2 && !gameOver) {
        // gameOver = true;
        // showEndScreen();
        let lastSnake = snakesLeft[0]; 
        playerData[lastSnake].roundsWon++; 
        endRound();
    }
}

function endGame(winningSnake) {
    gameOver = true;
    let gameOverText = createText("GAME!", "centeredText roundOver unselectable"); 
}

function endRound() {

    // Start a new round when someone hits space. 
    // Stop all snakes from moving, and also enables space to trigger new round instead of pausing. 
    roundOver = true;

    // Check to see if anyone has won the game. 
    for (let i = 0; i < playerData.length; i++) {
        if (playerData[i].roundsWon >= roundsToWin) {
            endGame(snakes[i]);
            // Return so we skip putting round over text etc. on screen and instead do game over stuff. 
            return;
        }
    }
    // Do some fancy graphics! 
    let roundOverText = createText("ROUND!", "centeredText roundOver unselectable");
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

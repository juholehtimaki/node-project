let player;
let player_sheet;
let bg;
let food_img;
let foods = [];
let rousk_sound;
let fail_sound;
let fart_sound;
let beep_sound;
let last_food_spawned_timestamp;
let game_over = false;
let question_changed_timestamp;
let answers = {};
let submit_timeout;

/**
 * Preload is called before setup to load resources
 */
function preload() {
    bg = loadImage('bg.jpg');
    food_img = loadImage('safka.png');
    player_sheet = loadAnimation(
        'fisu1.png',
        'fisu2.png',
        'fisu3.png',
        'fisu4.png',
        'fisu5.png',
        'fisu6.png',
        'fisu7.png',
        'fisu8.png'
    );
    rousk_sound = loadSound('rousk.mp3');
    rousk_sound.rate(1.3);
    fail_sound = loadSound('fail.mp3');
    fail_sound.rate(1.75);
    fail_sound.setVolume(0.015);
    fart_sound = loadSound('fart.mp3');
    fart_sound.rate(1.0);
    fart_sound.setVolume(0.35);
    beep_sound = loadSound('beep.mp3');
    beep_sound.rate(1.0);
    beep_sound.setVolume(0.3);
}

/**
 * Setup is called first before draw() starts being automatically called
 */
function setup() {
    //console.log(JSON.stringify(questionnaire, undefined, 2));
    let canvas = createCanvas(1000, 800);
    canvas.parent('exercise');
    player = createSprite(width / 2, height / 2, 96, 96);
    player.addAnimation('swim', player_sheet.clone());
    player.animation.frameDelay = 8;
    player.changeAnimation('swim');
    player.setSpeed(0, 0);
    player.scale = 1;
    player.debug = false;
    player.setCollider('circle', 0, 0, 15);
    textAlign(CENTER, CENTER);
}

/**
 * Draw is called on a loop to run the program
 */
function draw() {
    //Draw the background first
    background(bg);

    //Check if we have to switch question set
    if (shouldSwitchToNextQuestion && correctAnswersOnMap() <= 0) {
        if (!switchToNextQuestion()) {
            //If we need a new question set and we dont have any more, end game
            game_over = true;
        }
    }

    //Check if we have to end the game
    if (game_over) {
        myDrawText('GAME OVER!', width / 2, height / 2, 40, 255, 0, 0);
        if (!submit_timeout) {
            submit_timeout = setTimeout(submitExercise, 2000);
        }
        return;
    }

    //Check if there is nearby food to eat
    eatNearbyFood();
    maybeSpawnFood();

    //Move player
    faceMouse();
    if (
        distanceBetween(mouseX, mouseY, player.position.x, player.position.y) >
        20
    ) {
        moveToMouse();
    } else {
        player.setSpeed(0, 0);
    }

    //Draw graphics
    drawSprites();

    //Update foods
    for (let f of foods) {
        drawFoodTextBox(f);
        //drawDebug(f);
        checkExpiredFood(f);
    }

    //Draw current question
    if (currentQuestion) {
        myDrawText(currentQuestion.title, 1000 / 2, 25, 30, 0, 0, 0);
    }
}

/**
 * Checks whether the given food has existed for over 15 seconds, and removes it
 * @param {Object} food to check.
 */
function checkExpiredFood(food) {
    if (Date.now() - food.spawnTimeStamp >= 15000) {
        removeFood(food);
        if (!fart_sound.isPlaying()) {
            fart_sound.play();
        }
    }
}

/**
 * Checks certain conditions to see whether new foods should be spawned
 */
function maybeSpawnFood() {
    if (Date.now() - question_changed_timestamp < 4000) return;
    if (!last_food_spawned_timestamp) {
        createFood();
        return;
    }
    let timeNow = Date.now();
    let timeSinceLastFood = timeNow - last_food_spawned_timestamp;

    if (timeSinceLastFood <= 100) return;

    if (correctAnswersOnMap() == 0) {
        createFood();
        return;
    }

    if (foods.length <= 2) {
        createFood();
        return;
    }

    if (timeSinceLastFood >= 7500 && foods.length <= 7) {
        createFood();
        return;
    }
}

/**
 * Calls the .submit() function on the hidden form to send answers
 */
function submitExercise() {
    $('#answer-form').submit();
}

/**
 * Calculate the remaining foods (options) on the map that are correct answers
 */
function correctAnswersOnMap() {
    let correctAnswersLeft = 0;
    for (f of foods) {
        if (f.option.correctness) {
            correctAnswersLeft += 1;
        }
    }
    return correctAnswersLeft;
}

/**
 * Removes the given food object and also removes it from the foods array
 * @param {Object} food to remove
 */
function removeFood(f) {
    let index = foods.indexOf(f);
    if (index !== -1) foods.splice(index, 1);
    f.remove();
}

/**
 * Checks if a player is near a food and then eats it and does necessary followup such as storing the answer etc.
 * @param {Object} food to check.
 */
function eatNearbyFood() {
    for (let i = foods.length - 1; i >= 0; i--) {
        iterFood = foods[i];
        iterFood.overlap(player, (a, b) => {
            if (!answers[currentQuestion._id]) {
                answers[currentQuestion._id] = [];
            }
            answers[currentQuestion._id].push(a.option._id);
            $('#answers').val(JSON.stringify(answers));
            removeFood(a);
            if (a.option.correctness) {
                rousk_sound.play();
                b.scale += 0.1;
            } else {
                fail_sound.play();
                b.scale -= 0.3;
            }
            b.scale = clampNumber(b.scale, 0.33, 5);
        });
    }
}

/**
 * Clamps the number between given min and max
 * @param {Number} num number to clamp
 * @param {Number} min minimum value
 * @param {Number} maximum maximum value
 */
function clampNumber(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Get the distance from X, Y to nearest food
 * @param {Number} x x
 * @param {Number} y y
 * @param {Number} ignoreFood a food object to ignore in the search
 */
function getNearestFood(x, y, ignoreFood = null) {
    let distance = null;
    let result = null;
    for (let i = foods.length - 1; i >= 0; i--) {
        let f = foods[i];
        if (f === ignoreFood) continue;
        let iterDistance = distanceBetween(f.position.x, f.position.y, x, y);
        if (distance === null || iterDistance < distance) {
            distance = iterDistance;
            result = f;
        }
    }

    return { distance, result };
}

/**
 * Get the distance from between two points
 */
function distanceBetween(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Creates a food on the map
 */
function createFood() {
    let option = getNextOption();
    if (!option) return;
    last_food_spawned_timestamp = Date.now();

    //Dont spawn food near other food or the player
    let spawnX = getRndInteger(0.1 * width, 0.9 * width);
    let spawnY = getRndInteger(0.1 * height, 0.9 * height);
    let distanceToFood = getNearestFood(spawnX, spawnY).distance;
    let distanceToPlayer = distanceBetween(
        player.position.x,
        player.position.y,
        spawnX,
        spawnY
    );

    let iterations = 0;
    while (
        (distanceToFood < 100 || distanceToPlayer < 100) &&
        distanceToFood !== null &&
        distanceToPlayer !== null
    ) {
        iterations += 1;
        if (iterations >= 2000) {
            throw Error(
                'Way too many attempts to create a food spawn point! Infinite loop!'
            );
        }
        spawnX = getRndInteger(0.1 * width, 0.9 * width);
        spawnY = getRndInteger(0.1 * height, 0.9 * height);
        distanceToFood = getNearestFood(spawnX, spawnY).distance;
        distanceToPlayer = distanceBetween(
            player.position.x,
            player.position.y,
            spawnX,
            spawnY
        );
    }

    let food = createSprite(spawnX, spawnY, 16, 16);
    food.addImage(food_img);
    food.scale = 0.02;
    food.option = option;
    food.spawnTimeStamp = Date.now();
    foods.push(food);
}

let currentQuestion;
let outOfQuestions = false;
shouldSwitchToNextQuestion = true;
function switchToNextQuestion() {
    //Remove all foods (answers) on map once switching to a new question
    for (let i = foods.length - 1; i >= 0; i--) {
        let iterFood = foods[i];
        removeFood(iterFood);
    }

    //Check if we have any more questions to take from
    if (questionnaire.questions.length <= 0) {
        outOfQuestions = true;
        return false;
    }

    //Pick a random question
    let random = getRndInteger(0, questionnaire.questions.length - 1);
    currentQuestion = questionnaire.questions.splice(random, 1)[0];
    shouldSwitchToNextQuestion = false;
    question_changed_timestamp = Date.now();
    beep_sound.play();
    return true;
}

/**
 * Gets the next answer option from the current questions answer set, or null if out of options
 */
function getNextOption() {
    //Check if we have any options left to grab from, if not, request a question switch
    if (!currentQuestion || currentQuestion.options.length <= 0) {
        shouldSwitchToNextQuestion = true;
        return null;
    }

    //Pick a random option
    let random = getRndInteger(0, currentQuestion.options.length - 1);
    let option = currentQuestion.options.splice(random, 1)[0];
    return option;
}

/**
 * Wrapper to draw a text in certain font and color
 */
function myDrawText(str, x, y, fontSize, colorR, colorG, colorB) {
    fill(colorR, colorG, colorB);
    textSize(fontSize);
    text(str, x, y);
}
/**
 * Renders the option text above the given food
 * @param {Object0} food The food to draw the text above.
 */
function drawFoodTextBox(food) {
    myDrawText(
        food.option.option,
        food.position.x,
        food.position.y - 30,
        20,
        0,
        0,
        0
    );
}

/**
 * Debugging function
 */
function drawDebug(food) {
    let durationLeft = (15000 - (Date.now() - food.spawnTimeStamp)) / 1000;
    myDrawText(
        Math.round(durationLeft * 100) / 100,
        food.position.x,
        food.position.y + 20,
        12,
        155,
        25,
        25
    );

    if (food.option.correctness) {
        noFill();
        stroke(0, 255, 0);
        strokeWeight(5);
        circle(food.position.x, food.position.y, 20);
        stroke(0, 0, 0);
        strokeWeight(0);
    }
}

/**
 * Get a random integer between min and max
 */
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Moves the player towards the mouse cursor
 */
function moveToMouse() {
    let angle = angleToMouse();
    let distanceToMouse = distanceBetween(
        player.position.x,
        player.position.y,
        mouseX,
        mouseY
    );
    let velocity = (distanceToMouse / 250) * 3.5;

    velocity = clampNumber(velocity, 0.5, 3.5);
    /*
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        */
    player.setSpeed(velocity, angle);
}

/**
 * Gets the angle from the player to the mouse cursor in degrees
 */
function angleToMouse() {
    let dx = mouseX - player.position.x;
    let dy = mouseY - player.position.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
}
/**
 * Makes the player sprite face the mouse cursor
 */
function faceMouse() {
    let angle = angleToMouse();
    if (Math.abs(angle) > 90) {
        player.mirrorX(-1);
        player.rotation = 180 - angle;
    } else {
        player.mirrorX(1);
        player.rotation = angle;
    }
}

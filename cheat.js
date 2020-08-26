// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://dinoswords.gg/
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    function random(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function jump() {
        var groundYPos = runner.tRex.groundYPos;
        if (!runner.tRex.jumping && runner.tRex.yPos === groundYPos) {
            console.log("Jump Pressed");
            var keyboardEvent = new KeyboardEvent("keydown", {keyCode: 32});
            runner.onKeyDown(keyboardEvent);
        }
    }

    function duck() {
        var groundYPos = runner.tRex.groundYPos;
        if (!gameState.descending && runner.tRex.yPos < groundYPos) {
            gameState.descending = true;
            console.log("Did duck");
            var keyboardEvent = new KeyboardEvent("keydown", {keyCode: 40});
            runner.onKeyDown(keyboardEvent);
        }
    }

    var weaponsBindings = {
        "cig": 65,
        "bow": 66,
        "sword": 81,
        "handgun": 87,
        "flipflop": 69,
        "flamethrower": 82,
        "shuriken": 84,
        "scream": 89,
        "chainsaw": 85,
        "helicopter": 73,
        "halberd": 79,
        "kick": 80,
        "double": 68,
        "salute": 70,
        "holywater": 71,
        "portal": 72,
        "grenade": 74,
        "downers": 75,
        "uppers": 76,
        "rifle": 83,
        "meteor": 90,
        "laser": 88,
        "chem": 67,
        "bat": 86,
        "tank": 78,
        "hammer": 77
    }

    var gameState = {
        currentObstacle: null,
        canUseWeapon: false,
        descending: false,
        crashed: false,
    }

    var BotConfig = {
        JUMP_DISTANCE: 170,
        DESTROY_DISTANCE: 90,
        PASS_DISTANCE: 90,
    }

    var canDestroy = ["tank", "halberd", "sword", "chainsaw", "holywater", "hammer", "kick", "laser", "bow", "rifle", "shuriken", "handgun", "portal", "flipflop", "bat"];
    var canDestroyInAir = ["halberd", "kick", "chainsaw", "holywater"];

    setInterval(function() {
        gameState.canUseWeapon = true;
    }, random(300, 500));

    function submitScore() {
        if (runner.score < 110661) {
            setTimeout(function() {
                runner.restart();
            }, 5000);
        }
        console.log(runner.score);
    }

    setInterval(function() {
        if (runner && runner.horizon) {

            if (runner.crashed) {
                if (!gameState.crashed) {
                    console.log("Ended");
                    submitScore();
                    gameState.crashed = true;
                }
            } else {
                gameState.crashed = false;
                return;
                var obstacles = runner.horizon.obstacles;
                if (runner.currentSpeed <= 10 && weaponBox !== null && weaponBox.x < 170) {
                    if (!runner.tRex.jumping && (obstacles.length == 0 || (obstacles.length > 0 && obstacles[0].xPos > 500))) {
                        console.log("Jumped for weapon");
                        jump();
                    }
                }
                if (obstacles.length > 0) {
                    var obstacle = obstacles[0];
                    if (gameState.currentObstacle != obstacle) {
                        gameState.currentObstacle = obstacle;
                    }
                    handleObstacle(gameState.currentOption);
                }
                var groundYPos = runner.tRex.groundYPos;
                if (runner.tRex.yPos === groundYPos) {
                    gameState.descending = false;
                }
            }
        }
    }, 1);

    function handleWeapon(weapon) {
        if (weapon && gameState.canUseWeapon && weapon.isUsable()) {
            console.log("Using weapon " + weapon.id + " at " + performance.now());
            gameState.canUseWeapon = false;
            var keyCode = weaponsBindings[weapon.id];
            var keyboardEvent = new KeyboardEvent("keydown", {keyCode: keyCode});
            window.dispatchEvent(keyboardEvent);
        }
    }

    function handleObstacle(option) {
        var obstacle = gameState.currentObstacle;
        var currentWeapon = weaponManager.currentWeapon;
        if (currentWeapon) {
            if (!canDestroyObstacle(currentWeapon, obstacle)) {
                equipWeapon(obstacle);
            }
        } else {
            equipWeapon(obstacle);
        }

        var willDestroy = canDestroyObstacle(currentWeapon, obstacle) && obstacle.typeConfig.type !== "ptero";
        if (willDestroy) {
            if (!obstacle.destroyed && obstacle.xPos > BotConfig.PASS_DISTANCE) {
                handleWeapon(currentWeapon);
            }
        } else {
            if (!obstacle.destroyed && obstacle.xPos < BotConfig.JUMP_DISTANCE && obstacle.xPos > BotConfig.PASS_DISTANCE) {
                handleWeapon(currentWeapon);
                jump();
            }
        }
        if (runner.tRex.jumping && obstacle.xPos < 30) {
            duck();
        }
    }

    function canDestroyObstacle(weapon, obstacle) {
        if (!weapon) {
            return false;
        }
        if (!weapon.isUsable()) {
            return false;
        }
        if (obstacle.typeConfig.type === "ptero" && canDestroyInAir[weapon.id] === -1) {
            return false;
        }
        if (canDestroy[weapon.id] === -1) {
            return false;
        }
        return true;
    }

    function equipWeapon(obstacle) {
        var weapon = getWeapon(obstacle.typeConfig.type === "ptero" ? canDestroyInAir : canDestroy);
        if (weapon) {
            handleWeapon(weapon);
            return true;
        }
        return false;
    }

    function getWeapon(possible) {
        var weapons = weaponManager.weapons;
        for (var i = 0; i < possible.length; i++) {
            var type = possible[i];
            var weapon = weapons[type];
            if (weapon && weapon.isUsable()) {
                return weapon;
            }
        }
        return null;
    }

})();
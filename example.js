(function(global){
    if(!global.misohena){global.misohena = {};}
    var mypkg = global.misohena;

    mypkg.GameScreenExampleGame = {};
    mypkg.GameScreenExampleGame.create = function(resourceDir)
    {
        if(!resourceDir){ resourceDir = "";}

        var div = document.createElement("div");
        div.width = "640px";
        div.height = "480px";
        div.style.position = "relative";
        div.style.left = "0";
        div.style.top = "0";
        div.style.padding = "0";
        div.style.margin = "0";
        div.style.border = "none";
        div.tabIndex = "0";

        var img = document.createElement("img");
        img.setAttribute("width", 640);
        img.setAttribute("height", 480);
        img.setAttribute("src", resourceDir + "example.jpg");
        img.setAttribute("alt", "forest");
        img.style.position = "absolute";
        img.style.left = "0";
        img.style.top = "0";
        img.style.border = "none";
        img.style.margin = "0";
        img.style.padding = "0";
        div.appendChild(img);

        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", "640");
        canvas.setAttribute("height", "480");
        canvas.style.position = "absolute";
        canvas.style.left = "0";
        canvas.style.top = "0";
        div.appendChild(canvas);
        var ctx = canvas.getContext("2d");

        function InputDevice()
        {
            var self = this;
            this.keyLeft = false;
            this.keyRight = false;
            this.keyShoot = false;

            var keyLeftEdge = false;
            var keyRightEdge = false;
            var keyLeftState = false;
            var keyRightState = false;
            this.fetchKeyState = fetchKeyState;
            function fetchKeyState(){
                self.keyLeft = keyLeftState || keyLeftEdge || touchLeftState || (deviceLeftRightTilt > 12.0);
                self.keyRight = keyRightState || keyRightEdge || touchRightState || (deviceLeftRightTilt < -12.0);
                keyLeftEdge = touchLeftEdge =
                    keyRightEdge = touchRightEdge = false;
            }
            function onKeyDown(e){
                switch(e.keyCode){
                case 37: keyLeftState = keyLeftEdge = true; return true;
                case 39: keyRightState = keyRightEdge = true; return true;
                case 90: //Z
                case 32:  //space
                    self.keyShoot = !e.repeat;
                    return true;
                }
                return false;
            }
            function onKeyUp(e){
                switch(e.keyCode){
                case 37: keyLeftState = false; return true;
                case 39: keyRightState = false; return true;
                case 90: //Z
                case 32:  //space
                    return true;
                }
                return false;
            }
            div.addEventListener("keydown", function(e){
                if(onKeyDown(e)){
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);
            div.addEventListener("keyup", function(e){
                if(onKeyUp(e)){
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, false);

            var touches = {}; ///@todo track touchs
            var touchLeftState = false;
            var touchRightState = false;
            var touchLeftEdge = false;
            var touchRightEdge = false;
            div.addEventListener("touchstart", function(e){
                var pos = misohena.CSSTransformUtils.convertPointFromPageToNodeContentArea(div, e.touches[0].pageX, e.touches[0].pageY);
                if(pos[0] < 150){
                    touchLeftEdge = touchLeftState = true;
                }
                else if(pos[0] > 640-150){
                    touchRightEdge = touchRightState = true;
                }
                else{
                    self.keyShoot = true;
                }
                e.stopPropagation();
                e.preventDefault();
            }, false);
            div.addEventListener("touchend", function(e){
                touchLeftState = touchRightState = false;
                e.stopPropagation();
                e.preventDefault();
            }, false);

            var deviceLeftRightTilt = 0;
            if(screen && screen.orientation && typeof(screen.orientation.angle) == "number"){
                function getLeftRightTiltAngle(ev){
                    // r = rotz(alpha)*rotx(beta)*roty(gamma)*rotz(-screen.orientation.angle)*colvec[1,0,0]
                    // tilt = sin^-1(r.z)
                    function rad(deg){return deg*(Math.PI/180);}
                    var b = rad(ev.beta);
                    var c = rad(ev.gamma);
                    var d = rad(-screen.orientation.angle);
                    var rz = Math.sin(b)*Math.sin(d)-Math.cos(b)*Math.sin(c)*Math.cos(d);
                    return Math.asin(rz)*(180/Math.PI);
                }
                window.addEventListener("deviceorientation", function(e){
                    deviceLeftRightTilt = getLeftRightTiltAngle(e);
                }, false);
            }
        }

        //
        // Game
        //

        function World(inputDevice)
        {
            var player = new Player();
            function Player()
            {
                var PLAYER_W = 60;
                var PLAYER_H = 40;
                var x = 640/2-PLAYER_W/2 ;
                var y = 400;
                var vx = 0;
                var ACC_X = 1.5;
                var MAX_SPEED = 7;

                this.getX = function(){return x;};
                this.getY = function(){return y;};
                this.getW = function(){return PLAYER_W;};
                this.getH = function(){return PLAYER_H;};
                this.draw = function(ctx){
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(x+0,y+20,60,20);
                    ctx.fillRect(x+20,y+0,20,20);
                    ctx.fillStyle = "black";
                    ctx.font = "bold 20px sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillText(playerLife, x+PLAYER_W/2, y+20);
                };
                this.step = function(){
                    if(inputDevice.keyLeft){ vx -= ACC_X;}
                    else if(inputDevice.keyRight){ vx += ACC_X;}
                    else { vx = 0;}
                    if(vx < -MAX_SPEED) { vx = -MAX_SPEED;}
                    else if(vx > MAX_SPEED) { vx = MAX_SPEED;}

                    x += vx;
                    if(x >= 640){
                        x = -PLAYER_W+1;
                    }
                    if(x+PLAYER_W <= 0){
                        x = 640-1;
                    }
                    if(inputDevice.keyShoot){
                        inputDevice.keyShoot = false;
                        bullets.push(new Bullet(x + PLAYER_W/2 - BULLET_W/2, y-BULLET_H));
                    }
                };
            }
            var playerLife = 100;
            var PLAYER_DAMAGE_TIME_MAX = 10;
            function addPlayerDamage(amount, x, y)
            {
                playerDamageTime = PLAYER_DAMAGE_TIME_MAX;
                playerLife -= amount;
                if(playerLife <= 0){
                    playerLife = 0;
                    endGame();
                }
                effects.push(new EffectText("-" + amount, x, y, 30));
            }
            var playerDamageTime = 0;
            function stepPlayerDamage()
            {
                if(playerDamageTime > 0){
                    --playerDamageTime;
                }
            }
            function drawPlayerDamage()
            {
                ctx.fillStyle = "rgba(255,0,0," + playerDamageTime/PLAYER_DAMAGE_TIME_MAX + ")";
                ctx.fillRect(0,0,canvas.width,canvas.height);
            }

            var bullets = [];
            var BULLET_W = 10;
            var BULLET_H = 10;
            function Bullet(x, y)
            {
                var self = this;
                function findEnemy(){
                    return findObjectByRect(enemies, getObjectRect(self));
                }
                this.getX = function(){return x;};
                this.getY = function(){return y;};
                this.getW = function(){return BULLET_W;};
                this.getH = function(){return BULLET_H;};
                this.step = function(){
                    y -= 7;
                    if(y <= -BULLET_H){
                        return false;
                    }
                    var enemy = findEnemy();
                    if(enemy){
                        enemy.die();
                        return false;
                    }

                    return true;
                };
                this.draw = function(ctx){
                    ctx.fillStyle = "white";
                    ctx.fillRect(x,y,BULLET_W, BULLET_H);
                };
            }
            function drawBullets()
            {
                drawObjects(bullets);
            }
            function stepBullets()
            {
                stepObjects(bullets);
            }


            function EnemyGenerator()
            {
                var x = 123456;
                function rand(){
                    x=(x*1103515245+12345)&2147483647;
                    return x / 2147483648;
                }
                var count = 0;
                var nextTime = 100;
                this.step = function(){
                    if(--nextTime <= 0){
                        var x = rand() * (640 - ENEMY_W);
                        enemies.push(new Enemy(x));
                        ++count;

                        nextTime = 5000/TIMER_PERIOD/count + rand() * (100 * 100 / (100+count));
                    }
                };
            }
            var enemyGenerator = new EnemyGenerator();

            var enemies = [];
            var ENEMY_W = 40;
            var ENEMY_H = 20;
            var GROUND_Y = 440;
            function Enemy(x)
            {
                var self = this;
                var dead = false;
                var y = -ENEMY_H;
                this.getX = function(){return x;};
                this.getY = function(){return y;};
                this.getW = function(){return ENEMY_W;};
                this.getH = function(){return ENEMY_H;};
                this.die = function(){
                    dead = true;
                };
                this.step = function(){
                    if(dead){
                        return false;
                    }
                    y += 3;
                    if(y > GROUND_Y){
                        addPlayerDamage(5, x, y);
                        return false;
                    }
                    if(intersectsObject(self, player)){
                        addPlayerDamage(20, x, y);
                        return false;
                    }
                    return true;
                };
                this.draw = function(ctx){
                    ctx.fillStyle = "red";
                    ctx.fillRect(x,y,ENEMY_W, ENEMY_H);
                };
            }

            function drawEnemies()
            {
                drawObjects(enemies);
            }
            function stepEnemies()
            {
                stepObjects(enemies);
            }


            //
            // EffectObject
            //
            var effects = [];
            function EffectText(text, x, y, lifetime, setupStyle)
            {
                var vy = -2;
                if(!setupStyle){
                    setupStyle = function(ctx){
                        ctx.fillStyle = "red";
                        ctx.font = "bold 20px sans-serif";
                        ctx.textAlign = "left";
                        ctx.textBaseline = "top";
                    };
                }
                this.getX = function(){ return x;};
                this.getY = function(){ return y;};
                this.getW = function(){ return 0;};
                this.getH = function(){ return 0;};
                this.step = function(){
                    if(--lifetime <= 0){
                        return false;
                    }

                    vy += 0.08;
                    if(vy > 0){
                        vy = 0;
                    }
                    y += vy;

                    return true;
                };
                this.draw = function(ctx){
                    setupStyle(ctx);
                    ctx.fillText(text, x, y);
                };
            }
            function stepEffects()
            {
                stepObjects(effects);
            }
            function drawEffects()
            {
                drawObjects(effects);
            }


            //
            // GameObject
            //

            function drawObjects(objectArray)
            {
                for(var i = 0; i < objectArray.length; ++i){
                    if(objectArray[i]){
                        objectArray[i].draw(ctx);
                    }
                }
            }
            function stepObjects(objectArray)
            {
                for(var i = 0; i < objectArray.length; ++i){
                    if(objectArray[i]){
                        if(!objectArray[i].step()){
                            objectArray[i] = null;
                        }
                    }
                }
                removeNull(objectArray);
            }
            function removeNull(objectArray)
            {
                var dst = 0;
                var src;
                for(src = 0; src < objectArray.length; ++src){
                    if(objectArray[src]){
                        if(dst != src){
                            objectArray[dst] = objectArray[src];
                        }
                        ++dst;
                    }
                }
                objectArray.splice(dst, src - dst);
            }
            function findObjectByRect(objectArray, r)
            {
                for(var i = 0; i < objectArray.length; ++i){
                    var obj = objectArray[i];
                    if(obj && intersectsRect(getObjectRect(obj), r)){
                        return obj;
                    }
                }
                return null;
            }
            function intersectsObject(o1, o2)
            {
                return intersectsRect(getObjectRect(o1), getObjectRect(o2));
            }
            function getObjectRect(obj)
            {
                return obj ?
                    {x:obj.getX(), y:obj.getY(), w:obj.getW(), h:obj.getH()} :
                {x:0,y:0,w:0,h:0};

            }
            function intersectsRect(r1, r2)
            {
                return r1.x+r1.w > r2.x &&
                    r1.x < r2.x+r2.w &&
                    r1.y+r1.h > r2.y &&
                    r1.y < r2.y+r2.h;
            }


            //

            var TIMER_PERIOD = 20;
            var gameTime = 0; //[msec]
            var GAMESTATE = {
                PLAYING:0,
                END:1
            };
            var gameState = GAMESTATE.PLAYING;

            function endGame()
            {
                if(gameState == GAMESTATE.PLAYING){
                    gameState = GAMESTATE.END;
                }
            }
            function drawGameTime(ctx)
            {
                var gameTimeMS = gameTime * TIMER_PERIOD;
                var ms = ("00" + gameTimeMS % 1000).substr(-3);
                var s = ("0"+ Math.floor(gameTimeMS / 1000) % 60).substr(-2);
                var m = Math.floor(gameTimeMS / 60000);
                ctx.fillStyle = "white";
                ctx.font = "20px sans-serif";
                ctx.textAlign = "right";
                ctx.textBaseline = "top";
                ctx.fillText(m+":"+s+":"+ms, canvas.width, 0);
            }
            function drawGameState(ctx)
            {
                if(gameState == GAMESTATE.END){
                    ctx.fillStyle = "white";
                    ctx.font = "32px sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
                }
            }

            // Timer
            function onFrame()
            {
                ++gameTime;

                inputDevice.fetchKeyState();

                if(gameState == GAMESTATE.PLAYING){
                    player.step();

                    enemyGenerator.step();

                    stepEnemies();
                    stepBullets();
                    stepEffects();
                    stepPlayerDamage();
                }
                else if(gameState == GAMESTATE.END){
                    stopTimer();
                }

                ctx.clearRect(0,0,canvas.width,canvas.height);
                player.draw(ctx);
                drawEnemies();
                drawBullets();
                drawEffects();
                drawPlayerDamage();
                drawGameTime(ctx);
                drawGameState(ctx);
            }
            var intervalId = null;
            this.pauseGame = pauseGame;
            function pauseGame(){
                if(gameState == GAMESTATE.PLAYING){
                    if(intervalId !== null){
                        stopTimer();
                    }
                    else{
                        startTimer();
                    }
                }
            }
            function startTimer(){
                if(intervalId === null){
                    intervalId = setInterval(onFrame, TIMER_PERIOD);
                }
            }
            function stopTimer(){
                if(intervalId !== null){
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
            startTimer();

            this.destroyWorld = destroyWorld;
            function destroyWorld()
            {
                stopTimer();
            }
        }


        var inputDevice = new InputDevice();
        var world = new World(inputDevice);
        function retryGame()
        {
            world.destroyWorld();
            world = new World(inputDevice);
        }

        // UI
        div.setGameScreen = function(gameScreen){
            var controlBar = gameScreen.getControlBar();
            controlBar.addButton("left").setText("Pause").setOnClick(function(){world.pauseGame();});
            controlBar.addButton("left").setText("Retry").setOnClick(retryGame);
        };


        return div;
    };
})(this);

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
            };
            this.step = function(){
                if(keyLeft){ vx -= ACC_X;}
                else if(keyRight){ vx += ACC_X;}
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
                if(keyShoot){
                    keyShoot = false;
                    bullets.push(new Bullet(x + PLAYER_W/2 - BULLET_W/2, y-BULLET_H));
                }
            };
        }
        var playerLife = 100;
        var PLAYER_DAMAGE_TIME_MAX = 10;
        function addPlayerDamage(amount)
        {
            playerDamageTime = PLAYER_DAMAGE_TIME_MAX;
            playerLife -= amount;
            if(playerLife <= 0){
                playerLife = 0;
            }
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

        var enemies = [];
        var ENEMY_W = 40;
        var ENEMY_H = 20;
        function Enemy()
        {
            var self = this;
            var dead = false;
            var x = Math.random() * 640 - ENEMY_W;
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
                if(y > 480){
                    addPlayerDamage(5);
                    return false;
                }
                if(intersectsObject(self, player)){
                    addPlayerDamage(20);
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



        // Input

        var keyLeft = false;
        var keyRight = false;
        var keyShoot = false;
        var keyLeftEdge = false;
        var keyRightEdge = false;
        var keyLeftState = false;
        var keyRightState = false;
        function fetchKeyState(){
            keyLeft = keyLeftState || keyLeftEdge || touchLeftState || (deviceMotionEvent && deviceMotionEvent.accelerationIncludingGravity.x > 2.0);
            keyRight = keyRightState || keyRightEdge || touchRightState || (deviceMotionEvent && deviceMotionEvent.accelerationIncludingGravity.x < -2.0);
            keyLeftEdge = touchLeftEdge =
            keyRightEdge = touchRightEdge = false;
        }
        function onKeyDown(e){
            switch(e.keyCode){
            case 37: keyLeftState = keyLeftEdge = true; return true;
            case 39: keyRightState = keyRightEdge = true; return true;
            case 90: //Z
            case 32:  //space
                keyShoot = !e.repeat;
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
                keyShoot = true;
            }
            e.stopPropagation();
            e.preventDefault();
        }, false);
        div.addEventListener("touchend", function(e){
            touchLeftState = touchRightState = false;
            e.stopPropagation();
            e.preventDefault();
        }, false);

        var deviceMotionEvent = null;
        window.addEventListener("devicemotion", function(e){
            deviceMotionEvent = e;
        }, false);



        // UI
        div.setGameScreen = function(gameScreen){
            var controlBar = gameScreen.getControlBar();
            controlBar.addButton("left").setText("Pause").setOnClick(pauseGame);
        };

        // Timer
        function onFrame()
        {
            fetchKeyState();

            player.step();

            if(Math.random() > 0.95){
                enemies.push(new Enemy());
            }

            stepEnemies();
            stepBullets();
            stepPlayerDamage();

            ctx.clearRect(0,0,canvas.width,canvas.height);
            player.draw(ctx);
            drawEnemies();
            drawBullets();
            drawPlayerDamage();
        }
        var intervalId = null;
        function pauseGame(){
            if(intervalId !== null){
                clearInterval(intervalId);
                intervalId = null;
            }
            else{
                intervalId = setInterval(onFrame, 20);
            }
        }
        pauseGame();

        return div;
    };
})(this);

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

        var PLAYER_W = 60;
        var playerX = 640/2-PLAYER_W/2 ;
        var playerY = 400;
        function drawPlayer()
        {
            ctx.fillStyle = "yellow";
            ctx.fillRect(playerX+0,playerY+20,60,20);
            ctx.fillRect(playerX+20,playerY+0,20,20);
        }
        function stepPlayer()
        {
            if(keyLeft){ playerX -= 10;}
            if(keyRight){ playerX += 10;}
            if(playerX >= 640){
                playerX = -PLAYER_W+1;
            }
            if(playerX+PLAYER_W <= 0){
                playerX = 640-1;
            }
            if(keyShoot){
                keyShoot = false;
                bullets.push(new Bullet(playerX + PLAYER_W/2 - BULLET_W/2, playerY-BULLET_H));
            }
        }

        var enemies = [];
        var ENEMY_W = 40;
        var ENEMY_H = 20;
        function Enemy()
        {
            var dead = false;
            var x = Math.random() * 640 - ENEMY_W;
            var y = -ENEMY_H;
            this.step = function(){
                if(dead){
                    return false;
                }
                y += 3;
                if(y > 480){
                    return false;
                }
                return true;
            };
            this.getX = function(){return x;};
            this.getY = function(){return y;};
            this.die = function(){
                dead = true;
            };
        }
        function drawEnemies()
        {
            ctx.fillStyle = "red";
            for(var i = 0; i < enemies.length; ++i){
                var x = enemies[i].getX();
                var y = enemies[i].getY();
                ctx.fillRect(x,y,ENEMY_W, ENEMY_H);
            }
        }
        function stepEnemies()
        {
            for(var i = enemies.length-1; i >= 0; --i){
                if(!enemies[i].step()){
                    enemies.splice(i, 1);
                }
            }
        }

        function findObjectByRect(objectArray, objectW, objectH, rectX, rectY, rectW, rectH)
        {
            for(var i = 0; i < objectArray.length; ++i){
                var obj = objectArray[i];
                var ox = obj.getX();
                var oy = obj.getY();
                if(ox < rectX+rectW && ox+objectW > rectX &&
                   oy < rectY+rectW && oy+objectH > rectY){
                    return obj;
                }
            }
            return null;
        }

        var bullets = [];
        var BULLET_W = 10;
        var BULLET_H = 10;
        function Bullet(x, y)
        {
            function findEnemy(){
                return findObjectByRect(enemies, ENEMY_W, ENEMY_H, x, y, BULLET_W, BULLET_H);
            }
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
            this.getX = function(){return x;};
            this.getY = function(){return y;};
        }
        function drawBullets()
        {
            ctx.fillStyle = "white";
            for(var i = 0; i < bullets.length; ++i){
                var x = bullets[i].getX();
                var y = bullets[i].getY();
                ctx.fillRect(x,y,BULLET_W, BULLET_H);
            }
        }
        function stepBullets()
        {
            for(var i = bullets.length-1; i >= 0; --i){
                if(!bullets[i].step()){
                    bullets.splice(i, 1);
                }
            }
        }

        function onFrame()
        {
            stepPlayer();

            if(Math.random() > 0.95){
                enemies.push(new Enemy());
            }

            stepEnemies();
            stepBullets();

            ctx.clearRect(0,0,640,480);
            drawPlayer();
            drawEnemies();
            drawBullets();
        }

        var keyLeft = false;
        var keyRight = false;
        var keyShoot = false;
        function onKeyDown(e){
            switch(e.keyCode){
            case 37: keyLeft = true; return true;
            case 39: keyRight = true; return true;
            case 90: //Z
            case 32:  //space
                keyShoot = true;
                return true;
            }
            return false;
        }
        function onKeyUp(e){
            switch(e.keyCode){
            case 37: keyLeft = false; return true;
            case 39: keyRight = false; return true;
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

        setInterval(onFrame, 20);

        return div;
    };
})(this);

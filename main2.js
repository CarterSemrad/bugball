let usedImgs = [8,22,14,12,7,20,10,19,16,15,13,21,18,17,11];

function loadImgs(){
    for(let i = 0; i < 23; i++){
        if(usedImgs.indexOf(i) != -1){
            let img = document.createElement("img");
            img.src = `assets/p1a${i + 1}.png`;
            sprites.push(img);
        } else {
            sprites.push("hi!");
        }
    }
}


let sprites = [];



loadImgs();


let keyDown = [];

let keyPressed = [];
/*
onkeydown = (e) => {
    keyDown[e.key.toLocaleLowerCase()] = true;
    keyPressed[e.key.toLocaleLowerCase()] = true;
}

onkeyup = (e) => {
    keyDown[e.key.toLocaleLowerCase()] = false;
}
*/

function normalize(vec){
    let len = Math.hypot(...vec);
    let res = [];
    for(let i of vec){
        res.push(i/len);
    }

    if(Math.hypot(...res) >= 1.05){
        let r2 = [];
        len = Math.hypot(...res);
        for(let i of res){
            r2.push(i/len);
        }

        return r2;
    }

    return res;
}

function dot(a,b){
    let sum = 0;
    for(let i in a){
        sum += a[i] * b[i];
    }

    return sum;
}

function plus(a,b){
    let res = [];

    for(let i in a){
        res.push(a[i] + b[i]);
    }

    return res;
}

function abs(p){
    let res = [];
    for(let i of p){
        res.push(Math.abs(i));
    }

    return res;
}

let score = [0,0];

function addPoint(id){
    score[id]++;
    document.getElementById("score").innerText = `${score[0]} - ${score[1]}`;

    p1.moveVec = [0,0];
    p1.x = 0.2;
    p1.y = 0.8 - p1.size;

    p2.moveVec = [0,0];
    p2.x = 0.5 + (0.5 - p1.x);
    p2.y = 0.8 - p2.size;

    ball.x = 0.5;
    ball.y = 0.5;
    ball.vel = [0, 0];
}

function minus(a,b){
    let c = [];

    for(let i in a){
        c.push(a[i] - b[i]);
    }

    return c;
}

function times(a, s){
    let res = [];
    for(let i of a){
        res.push(i*s);
    }

    return res;
}

function reflect(v, n){
    return minus(v, times(n, dot(v,n)*2));
}

function sdBox(p, b){
    let d = minus(abs(p),b);
    return Math.hypot(...[Math.max(d[0],0.0), Math.max(d[1],0.0)]) + Math.min(Math.max(d[0],d[1]),0.0);
}

function grad(de, p){
    let eps = 0.001;
    return normalize(
        [
            de(plus(p, [eps, 0])) - de(plus(p, [-eps, 0])),
            de(plus(p, [0, eps])) - de(plus(p, [0, -eps]))
        ]
    );
}

function Camera(){
    this.x = 0;
    this.y = 0;
    this.shakeTimer = 0;

    this.setPos = (x, y) => {
        this.x = x;
        this.y = y;
        this.draw();
    }

    this.draw = () => {
        c.style.top = `${this.y}%`;
        c.style.left = `${this.x}%`;

        bgc.style.top = `${this.y*0.5 - 10}%`;
        bgc.style.left = `${this.x*0.5 - 10}%`;
    }

    this.shake = () => {
        this.shakeTimer = 15;
    }

    this.update = () => {
        let scale = 10;

        if(this.shakeTimer > 0){
            let amount = 4;
            this.setPos((Math.random() - 0.5) * amount + scale*(0.5 - ball.x), (Math.random() - 0.5) * amount + scale*(0.5 - ball.y));
            this.shakeTimer--
        } else {
            this.setPos(scale*(0.5 - ball.x), scale*(0.5 - ball.y));
        }
    }
}

let c = document.createElement("canvas");

c.id = "fg";

let scale = 1.5;
c.width = scale * window.innerWidth;
let s = c.height = scale * window.innerHeight;

let offLeft = (c.width - c.height)/2;

let ols = offLeft / c.height;

document.body.appendChild(c);

let ctx = c.getContext("2d");

let bgc = document.createElement("canvas");

bgc.id = "bg";

bgc.width = scale * window.innerWidth;
bgc.height = scale * window.innerHeight;

document.body.appendChild(bgc);

let bgctx = bgc.getContext("2d");
bgctx.imageSmoothingEnabled = false;

sprites[8].onload = () => {
    bgctx.drawImage(sprites[8], 0, 0, bgc.width, bgc.height);
}

sprites[22].onload = () => {
    let h = 2.3 * bgc.height / 4;
    let w = 2.3*h;
    bgctx.drawImage(sprites[22], bgc.width / 2 - (w)/2, bgc.height / 8, w, h);
}

ctx.imageSmoothingEnabled = false;

let players = [];

let goals = [];

function Goal(){

    goals.push(this);
    this.id = goals.length;

    this.size = 0.1;


    let goalOffset = 0.15;
    this.x = 0 - goalOffset - this.size;

    this.height = 0.3;

    this.y = (0.8 - this.height);

    if(this.id == 2){
        this.x = 1 + goalOffset;
    }

    this.hitbox = (p) => {
        let hbHeight = 0.05;

        return sdBox(minus(p, [this.x + this.size/2, this.y + hbHeight/2]), [this.size / 2, hbHeight / 2]); //bro
    }

    this.norm = (p) => {
        return grad(this.hitbox, p);
    }

    this.draw = () => {
        ctx.fillStyle = "rgba(80, 240, 255, 1)";
        if(this.id == 2){
            ctx.fillStyle = "rgba(255, 80, 80, 1)";
            //ctx.fillRect(this.x * s + offLeft, (0.8 - this.height)*s, this.size*s, this.height*s);
            ctx.drawImage(sprites[14], this.x * s + offLeft - 0.02 * s, (0.8 - this.height)*s, (this.size + 0.01)*s, (this.height + 0.03)*s);


        } else {
            ctx.drawImage(sprites[12], this.x * s + offLeft, (0.8 - this.height)*s, (this.size + 0.01)*s, (this.height + 0.03)*s);
        }
        
        
    }
}

function Ball(){
    this.x = 0.5;
    this.y = 0.5;
    this.size = 0.04;

    this.dt = 1/60;

    this.strFactor = 1;

    this.gravity = 0.035 * 1/60;

    this.friction = 1 - 0.01;

    this.kickBoost = [0, -0.5];

    this.maxSpeed = 0.02;

    this.vel = [0,0];

    this.animStep = 0;

    this.update = () => {
        this.vel[1] += this.gravity;
        
        this.animStep++;

        if(this.y >= 0.8 - this.size){
            this.y = 0.8 - this.size;
            this.vel[1] *= -0.65;
            if(Math.abs(this.vel[1]) <= 0.005){
                this.vel[1] = 0;
                this.vel[0] *= this.friction;
            }
        }

        if(this.y <= 0 + this.size){
            this.y = 0 + this.size;
            this.vel[1] *= -0.65;
        }

        /*
this.x = 0 - goalOffset - this.size;

    this.height = 0.3;

    this.y = (0.8 - this.height);

    if(this.id == 2){
        this.x = 1 + goalOffset;
    }
        */

        if(this.x >= 1 + 0.15 + goals[0].size - this.size){
            this.vel[0] *= -0.65;
            this.x = 1 + 0.15 + goals[0].size - this.size;
        }
        
        if(this.x <= 0 - 0.15  - goals[0].size + this.size){
            this.vel[0] *= -0.65;
            this.x = 0 - 0.15  - goals[0].size + this.size;
        }

        this.collision();


        let speed = Math.hypot(...this.vel);
        if(speed*0.8 >= this.maxSpeed){


            this.vel[0] *= 0.8;
            this.vel[1] *= 0.8;

            
        }

        this.x += this.vel[0];
        this.y += this.vel[1];

        if(this.x >= 1 + ols - this.size){
            this.x = 1 + ols - this.size;
        }
        
        if(this.x <= -ols + this.size){
            this.x = -ols + this.size;
        }

        if(this.y >= 0.8 - this.size){
            this.y = 0.8 - this.size;
        }

        if(this.y <= 0 + this.size){
            this.y = 0 + this.size;
        }

        for(let goal of goals){
            if(goal.hitbox([this.x, this.y]) - this.size <= 0){
                let dist = goal.hitbox([this.x, this.y]);
                let norm = goal.norm([this.x, this.y]);
                this.x += norm[0] * (-(dist - this.size));
                this.y += norm[1] * (-(dist - this.size));
            }
        }

        for(let goal of goals){
            if(this.x >= goal.x && this.x <= goal.x + goal.size && this.y >= goal.y + 0.05 && this.y <= goal.y + goal.height){
                //console.log("here!!");
                addPoint(-goal.id+2);
            }
        }

    }

    this.collision = () => {
        for(let player of players){
            if(Math.hypot(...[player.x - this.x, player.y - this.y]) <= player.size + this.size){

                if(player.groundPounding){
                    let dir = -2 * (player.id - 1.5); //shadertoy has ruined me

                    this.x = player.x + dir*player.size;

                    cam.shake();
                }

                let dist = Math.hypot(...[player.x - this.x, player.y - this.y]) <= player.size + this.size;

                let forceDir = normalize([this.x - player.x, this.y - player.y]);

                let playerDir = times([player.moveVec[0] - this.vel[0], player.moveVec[1] - this.vel[1]], 70);

                let forceStrength = dot(forceDir, playerDir);

                if(forceStrength <= 0){
                    forceStrength = 0;
                }

                this.vel = plus(this.vel, times(forceDir, forceStrength*this.dt*this.strFactor));
                this.vel = plus(this.vel, times(this.kickBoost, this.dt));

                let pos2 = plus([player.x, player.y], times(forceDir, player.size + this.size + 0.001));
                this.x = pos2[0];
                this.y = pos2[1];

            }
        }

        for(let goal of goals){
            if(goal.hitbox([this.x, this.y]) - this.size <= 0){
                let dist = goal.hitbox([this.x, this.y]);
                let norm = goal.norm([this.x, this.y]);
                this.vel = reflect(this.vel, norm);
                this.x += norm[0] * -(dist - this.size);
                this.y += norm[1] * -(dist - this.size);
            }
        }
    }

    this.draw = () => {
        /*
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.arc(this.x * s + offLeft, this.y * s, this.size * s, 0, 2*Math.PI);


    
        ctx.fill();
        ctx.closePath();
        */
        if(this.animStep % 40 <= 20){
            ctx.drawImage(sprites[7], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
        } else {
            ctx.drawImage(sprites[20], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);

        }
    }
}

function Player(){

    players.push(this);

    this.id = players.length;

    this.size = 0.04;

    this.animStep = 0;

    this.facingRight = true;

    this.x = 0.2;

    if(this.id == 2){
        this.x = 0.5 + (0.5-this.x);
        this.facingRight = false;
    }
    this.y = 0.8 - this.size;
    this.gravity = 0.05 * 1/60;

    this.moveVec = [0,0];
    this.jumpsleft = 0;

    this.moveSpeed = 0.02;

    this.groundPounding = false;

    this.update = () => {
        this.animStep++;
        this.moveVec[0] = 0;

        if(!this.groundPounding){

            if(this.id == 1){
                if(keyDown["a"]){
                    
                    this.moveVec[0] -= this.moveSpeed;
                }
                if(keyDown["d"]){
                    this.moveVec[0] += this.moveSpeed;
                }

                if(keyPressed["w"] && this.jumpsleft > 0){
                    this.moveVec[1] = -0.02;
                    this.jumpsleft--;
                }

                if(keyPressed["s"] && this.jumpsleft < 2){
                    this.groundPounding = true;
                }
            } else if(this.id == 2) {
                if(keyDown["arrowleft"]){
                    
                    this.moveVec[0] -= this.moveSpeed;
                }
                if(keyDown["arrowright"]){
                    this.moveVec[0] += this.moveSpeed;
                }

                if(keyPressed["arrowup"] && this.jumpsleft > 0){
                    this.moveVec[1] = -0.02;
                    this.jumpsleft--;
                }

                if(keyPressed["arrowdown"] && this.jumpsleft < 2){
                    this.groundPounding = true;
                }
            }
        } else {
            this.moveVec[1] += 0.005;s
        }

        this.moveVec[1] += this.gravity;

        if(this.y >= 0.8 - this.size){
            this.y = 0.8 - this.size;
            if(this.moveVec[1] >= 0){
                this.moveVec[1] = 0;
                this.jumpsleft = 2;
                this.groundPounding = false;
            }
        }

        this.x += this.moveVec[0];

        if(this.moveVec[0] > 0){
            this.facingRight = true;
            this.animStep++;
        }

        if(this.moveVec[0] < 0){
            this.facingRight = false;
            this.animStep++;
        }
        
        this.y += this.moveVec[1];

        if(this.y >= 0.8 - this.size){
            this.y = 0.8 - this.size;
        }
    }
    this.draw = () => {
        /*
        ctx.beginPath();
        ctx.fillStyle = "rgba(16, 247, 255, 1)";
        if(this.id == 2){
            ctx.fillStyle = "rgba(255, 16, 68, 1)";
        }
        ctx.arc(this.x * s + offLeft, this.y * s, this.size * s, 0, 2*Math.PI);
    
        ctx.fill();
        ctx.closePath();
        */

        if(this.id == 1){
            if(!this.facingRight){
                if(this.animStep % 40 <= 20){
                    ctx.drawImage(sprites[10], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                } else {
                    ctx.drawImage(sprites[19], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                }
            } else {
                if(this.animStep % 40 <= 20){
                    ctx.drawImage(sprites[16], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                } else {
                    ctx.drawImage(sprites[15], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                }
            }
        } else if(this.id == 2){
            if(!this.facingRight){
                if(this.animStep % 40 <= 20){
                    ctx.drawImage(sprites[13], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                } else {
                    ctx.drawImage(sprites[21], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);

                }
            } else {
                if(this.animStep % 40 <= 20){
                    ctx.drawImage(sprites[18], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);
                } else {
                    ctx.drawImage(sprites[17], this.x*s + offLeft - this.size*s, this.y*s - this.size*s, this.size*2*s, this.size*2*s);

                }
            }
        }
    }
}

function Map(){
    this.groundY = 0.8;

    this.draw = () => {
        let margin = s*0.02;
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "rgba(255, 175, 252, 1)";
        ctx.globalAlpha = 1;
        //ctx.fillRect(0, this.groundY * s, c.width, s*(1-this.groundY));
        ctx.drawImage(sprites[11], 0, this.groundY * s - margin, c.width, s*(1-this.groundY));
    }
}

let map = new Map();

let p1 = new Player();
let p2 = new Player();
let ball = new Ball();

let cam = new Camera();

new Goal();
new Goal();

function update(){
    ctx.clearRect(0, 0, c.width, s);
    map.draw();
    for(let i of players){
        i.update();
        i.draw();
    }

    ball.update();
    ball.draw();

    for(let i of goals){
        i.draw();
    }


    cam.update();

    //console.log(goals[0].norm([p1.x, p1.y]));

    keyPressed = [];
}


setInterval(update, 1000/60);
let asteroids = [];
let shapes = [];
let borders = [];
let sun, ship, heatGuage;
let lborder,bborder,rborder;
let gameState = 'start';
let maxAsteroids = 15;
let c = '#F2C77D';
let guage, bg, r, myFont, thrusterSound, alarmSound;

const plScale = 60;
const scaleFrom = (x, y, tileSize = 1) =>
  new planck.Vec2((x / tileSize) * plScale, (y / tileSize) * plScale);
const scaleTo = (x, y, tileSize = 1) =>
  new planck.Vec2((x * tileSize) / plScale, (y * tileSize) / plScale);

function preload(){
  alarmSound = loadSound('sounds/alarm.flac')
  thrusterSound = loadSound('sounds/rocketEngine.wav');
  guage = loadImage('img/AsteroidsGuage.png');
  bg = loadImage('img/AsteroidsBG.png');
  r = loadImage('img/Asteroids3.png');
  myFont = loadFont('img/Bruno.ttf');
}

function setup() {
  
  var cnv = createCanvas(700, 500);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  textFont(myFont);
  shapes[0] = [[-12,37],[0,37],[11,30],[11,25],[0,22],[11,15],[4,8],[-1,11],[-12,8],[-20,18],[-20,30],[-8,30],[-12,37]];
  shapes[1] = [[-78,50],[-68,45],[-57,51],[-46,40],[-56,34],[-47,25],[-57,10],[-72,16],[-78,10],[-90,20],[-83,30],[-89,40],[-78,50]];
  shapes[2] = [[46,55],[70,55],[83,36],[83,22],[68,5],[55,5],[55,18],[45,5],[30,25],[40,30],[30,35],[46,55]];
}

function newGame(){
  makeShip();
  sun = new Sprite(width/2,-250,10,10);
  sun.collider = 'static';
  asteroids = [];
  makeBorders();
  makeAsteroids();
}

function makeBorders(){
  lborder = new Sprite(100,0,5,height*2);
  lborder.color = "#EBEBD3";
  lborder.name = 'leftBorder';
  lborder.collider = 'static';
  bborder = new Sprite(0,height-5,width*2,10);
  bborder.color = "#EBEBD3";
  bborder.name = 'bottomBorder';
  bborder.collider = 'static';
  rborder = new Sprite(width-100,0,5,height*2);
  rborder.color = "#EBEBD3";
  rborder.collider = 'static';
  rborder.name = 'rightBorder';
}

function makeShip(){
  noStroke();
  let x1 = -13;
  let y1 = -42;
  let x2 = 7;
  let y2 = -48;
  let x3 = -13;
  let y3 = -54;
  ship = new Sprite([[x1, y1], [x2, y2], [x3, y3],[x1,y1]]);
  ship.rotationDrag = 10; //CHANGED ROTATION DRAG FROM 0.5 Otherwise was causing bad rotation animation
  ship.drag = 2; //CHANGED SHIP DRAG FROM 1
  ship.x = width / 2;
  ship.y = height / 2;
  ship.heat = 0;
  ship.color = '#EBEBD3';
  ship.collider = 'd';
  ship.name = 'ship';
  ship.score = 0;
}

function playThrusterSound() {
  thrusterSound.play();
}
function unloadSound() {
  thrusterSound.unload();
}

function moveShip(){
  let x = ship.x;
  let y = ship.y;
  if (kb.pressing('left')) ship.rotation -= 4.5; //ROTATE L&R
  if (kb.pressing('right')) ship.rotation += 4.5;
  if (kb.pressing('x')) {
    if(!thrusterSound.isPlaying())
    {
      thrusterSound.play();
    }
	ship.addSpeed(0.08, ship.rotation); //CHANGED SPEED FROM 0.15
  }
  else{
    if(thrusterSound.isPlaying())
    {
      thrusterSound.stop();
    }
  }
  if (ship.y < 0){
    //ACCELERATION
    ship.y = 0.05; //CHANGED SPEED FROM 0.15
  }
}

function rayCast(){
  let hit = false;
  for(let a = -500; a < 1100; a += 10){
    let v1 = scaleTo(sun.x, sun.y, 1);
    let v2 = scaleTo(a,500, 1);
    closest = null;
    world.rayCast(v1, v2, function (fixture, point, normal, fraction) {
    closest = {
      fixture: fixture,
      point: point, // Vec2
      normal: normal, // Vec2
      fraction: fraction, // number v
    };
    return fraction;
  });

  let clPoint;
  if (closest != null) {
    if(closest.fixture.m_body.sprite.name == 'ship'){
      hit = true;
    }
    push();
    stroke(c);
    strokeWeight(1);
    clPoint = scaleFrom(closest.point.x, closest.point.y, 1);
    line(sun.x, sun.y, clPoint.x, clPoint.y);
    pop();
  }
  }
  if (hit){
    if(!alarmSound.isPlaying())
    {
      alarmSound.play();
    }
    ship.heat += 0.2;
  } else {
    if(alarmSound.isPlaying())
    {
      alarmSound.stop();
    }
    if(ship.heat > 0){
      ship.heat -= 0.1;
    }
  }
}

function updateGame(){
  ship.score += 0.2;
  if(ship.heat > 100){
    gameState = 'end';
  }
  push();
  fill(235,235,211);
  rect(0,0,100,height);
  rect(width-100,0,100,height);
  fill(41,41,40);
  text("Score: " + round(ship.score), width-95, 15);
  if(ship.heat > 80){
    fill(210,86,62);
  } else if(ship.heat > 45){
    fill(230,133,75);
  } else {
    fill(238,182,84);
  }
  rect(26,450,45,-ship.heat*4.1);
  image(guage,10,20,85,450);
  pop();
}

function makeAsteroids(){
  let asteroid = new Sprite(shapes[0]);
  asteroid.x = width/2;
  asteroid.y = height/2-50;
  asteroid.vel.x = 0.5;
  asteroid.vel.y = 0;
  asteroid.collider = 'k';
  asteroid.color = "#EBEBD3"
  asteroids.push(asteroid);
  for(let i = asteroids.length; i < maxAsteroids; i++){
    let asteroid = new Sprite(shapes[round(random(2))]);
    asteroid.x = random(100,width-100);
    asteroid.y = random(100,width-100);
    asteroid.vel.x = random(-1,1); //CAN MAKE EASIER HERE ASWELL
    asteroid.vel.y = random(-1,1);
    asteroid.collider = 'k';
    asteroid.rotation = random(360);
    asteroid.color = "#EBEBD3"
    asteroids.push(asteroid);
  }
}

function newAsteroid(index){
  let asteroid = new Sprite(shapes[round(random(2))]);
  let pl = round(random(2))
  if(pl == 0){
    asteroid.x = 0;
    asteroid.y = random(height);
    asteroid.vel.x = random(1);
    asteroid.vel.y = random(-1,1);
  } else if(pl == 1){
    asteroid.x = random(width);
    asteroid.y = height;
    asteroid.vel.x = random(-1,1);
    asteroid.vel.y = random(1);
  } else if(pl == 2){
    asteroid.x = width;
    asteroid.y = random(height);
    asteroid.vel.x = random(-1,0);
    asteroid.vel.y = random(-1,1);
  }
  asteroid.collider = 'k';
  asteroid.color = '#EBEBD3';
  asteroids[index] = asteroid;
}

function draw(){
  if(gameState == 'start'){
    background(41,41,40);
    fill(255,255,255);
    image(bg,0,0,width,height);    
    if (kb.presses('x')) {
      newGame();
	  gameState = 'play';
    }
  } else if(gameState == 'play'){
    background(41,41,40);
    rayCast();
    moveShip();
    updateGame();
    for(let i = 0; i < asteroids.length; i++){
      if(asteroids[i].x < 0 - asteroids[i].width || asteroids[i].x > width + asteroids[i].width || asteroids[i].y > height + asteroids[i].height){
        asteroids[i].remove();
        newAsteroid(i);
      }
    }
    if(asteroids.length < maxAsteroids){
      newAsteroid();
    }
  } else if(gameState == 'end'){
    thrusterSound.stop();
    alarmSound.stop();
    allSprites.remove();
    background(41,41,40);
    fill(235,235,211);
    image(r,0,0,width,height);
    fill(235,235,211);
    text("Score: " + round(ship.score), width/2-20, 350);
    if (kb.presses('x')) {
      newGame();
	  gameState = 'play';
    }
  }
}
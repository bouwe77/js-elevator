kontra.init();
kontra.canvas.width = 20;
kontra.canvas.height = 80;

// === Config ===
// The number of pixels to move the sprite up/down every frame
var speed = 0.2;

// === State ===
var currentFloor = 0;
var direction = 'up';
var stopAtFloor = -3;

var sprite = kontra.sprite({
  x: 0,
  y: 60,
  color: 'white',
  width: 20,
  height: 20,
  dy: speed,
});

var loop = kontra.gameLoop({
  update() {
    sprite.update();

    var bottom = sprite.y + 20 > kontra.canvas.height;
    if (bottom) {
      sprite.dy = speed*-1;
      direction = 'up';
    } 
    else {
      var top = sprite.y < 0;
      if (top) {
        sprite.dy = speed;
        direction = 'down';
      }
    }
    
    var y = Math.round(sprite.y);
    if (y === 60) {
      currentFloor = 0;
    }
    else if (y === 40) {
      currentFloor = 1;
    }
    else if (y === 20){
      currentFloor = 2;
    } 
    else if (y === 0){
      currentFloor = 3;
    }
    
    if (currentFloor === stopAtFloor) {
      sprite.dy = 0;
    }
    
    var status = "Floor: " + currentFloor + "<br/>";
    status += "Direction: " + direction + "<br/>";
    status += "Y: " + y;
    var statusElement = document.getElementById("status");
    statusElement.innerHTML = status;
  },
  render() {
    sprite.render();
  }
});

loop.start();
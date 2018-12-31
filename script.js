// === Config ===
// The number of pixels to move the sprite up/down every frame
var speed = 0.2;
var numberOfFloors = 4;
var carWidth = 20;
var carHeight = 20;
var canvasWidth = 200;
var canvasHeight = (numberOfFloors * carHeight) + carHeight;

kontra.init();
kontra.canvas.width = canvasWidth;
kontra.canvas.height = canvasHeight;

// === State ===
var currentFloor = 0;
var direction = 'up';
var stopAtFloor = -3;

var car1 = createCar();


var floor = createFloor(2);

var loop = kontra.gameLoop({
  update() {
    car1.update();

    var bottom = car1.y + carHeight > kontra.canvas.height;
    if (bottom) {
      car1.dy = speed*-1;
      direction = 'up';
    } 
    else {
      var top = car1.y < 0;
      if (top) {
        car1.dy = speed;
        direction = 'down';
      }
    }
    
    var y = Math.round(car1.y);

    if (y % carHeight === 0) {
      currentFloor = (y/carHeight - numberOfFloors) * -1;
    }
    
    if (currentFloor === stopAtFloor) {
      car1.dy = 0;
    }
    
    var status = "Floor: " + currentFloor + "<br/>";
    status += "Direction: " + direction + "<br/>";
    status += "Y: " + y;
    var statusElement = document.getElementById("status");
    statusElement.innerHTML = status;
  },
  render() {
    floor.render();
    car1.render();
  }
});

loop.start();

function createCar() {
  return kontra.sprite({
    x: 0,
    y: numberOfFloors * carHeight,
    color: 'lightgray',
    width: carWidth,
    height: carHeight,
    dy: speed,
  });
}

function createFloor(floorNr) {
  
  var color = 'white';
  if (floorNr % 2 === 0) {
    color = 'lightgray';
  }
  
  return kontra.sprite({
    x: 0,
    y: 0,
    color: color,
    width: canvasWidth,
    height: carHeight
  });
}
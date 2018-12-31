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

var floors = createFloors(numberOfFloors);

var people = createPeople();
  
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
    floors.forEach(function(floor) {
      floor.render();
    });
    
    people.forEach(function(person) {
      person.render();
    });
    
    car1.render();
  }
});

loop.start();

function createCar() {
  return kontra.sprite({
    x: 0,
    y: numberOfFloors * carHeight,
    color: 'gray',
    width: carWidth,
    height: carHeight,
    dy: speed,
  });
}

function createFloors(numberOfFloors) {
  var floors = [];
  for (var i = 0; i <= numberOfFloors; i++) {  
    var floor = createFloor(i);
    floors.push(floor);
  }
  return floors;
}

function createFloor(floorIndex) {
  
  var color = 'silver';
  if (floorIndex % 2 === 0) {
    color = 'gainsboro';
  }
  
  var y = floorIndex * carHeight;
  
  return kontra.sprite({
    x: 0,
    y: y,
    color: color,
    width: canvasWidth,
    height: carHeight
  });
}

function createPeople() {
  var people = [];
  
  people.push(createPerson());
  
  return people;
}

function createPerson() {
  
  var color = 'red';

  return kontra.sprite({
    x: carWidth,
    y: 10,
    color: color,
    width: carWidth/3,
    height: carHeight/3  
  });
}
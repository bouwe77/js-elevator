// === Config ===
// The number of pixels to move the sprite up/down every frame
var speed = 0.2;
var numberOfFloors = 4;
var carWidth = 20;
var carHeight = 20;
var canvasWidth = 200;
var canvasHeight = (numberOfFloors * carHeight) + carHeight;
var personWidth = carWidth/3;
var personHeight = carHeight/3;
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
    // Update all animated sprites.
    car1.update();

    people.forEach(function(person) {
      person.update();
    });  

    resetDirection();
    updateCurrentFloor();
    updateControlPanel();
    movePeopleAround();
  },
  render() {
    render();
  }
});

loop.start();

function render() {
  floors.forEach(function(floor) {
    floor.render();
  });

  people.forEach(function(person) {
    person.render();
  });

  car1.render();
}

function resetDirection() {
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
}

function updateCurrentFloor() {
  var y = Math.round(car1.y);

  if (y % carHeight === 0) {
    currentFloor = (y/carHeight - numberOfFloors) * -1;
  }

  if (currentFloor === stopAtFloor) {
    stopElevator();
  }
}

function stopElevator() {
  car1.dy = 0;  
}

function updateControlPanel() {
  var status = "Floor: " + currentFloor + "<br/>";
  var statusElement = document.getElementById("status");
  statusElement.innerHTML = status;
}

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

  people.push(createPerson(0));

  return people;
}

function createPerson(floor) {

  var color = 'red';

  var y = getPersonPositionForFloor(floor);

  return kontra.sprite({
    x: getRandomNumber(carWidth, canvasWidth-carWidth),
    y: y,
    color: color,
    width: personWidth,
    height: personHeight,
    dx: speed * -1,
    currentFloor: floor
  });
}


function getPersonPositionForFloor(floor) {
  
  //TODO Refactor this
  
  if (floor === 4) {
    return 10;
  }
  if (floor === 3) {
    return 30;
  }
  if (floor === 2) {
    return 50;
  }
  if (floor === 1) {
    return 70;
  }
  if (floor === 0) {
    return 90;
  }
}

function movePeopleAround() {
  
  people.forEach(function(person) {
    var x = Math.round(person.x);

    var farRight = x > (canvasWidth - personWidth);
    var farLeft = x < carWidth;

    // Moving the person the other way if it is on the far right.
    if (farRight) {
      person.dx = speed * -1;
    }

    // Stop moving the person if it is on the far left.
    if (farLeft) {
      person.dx = 0;
      requestElevator(person.currentFloor);
    } 
    else {
      // Randomly determine whether the person will move the other way.
      // var moveTheOtherWay = getRandomNumber(1,30) === 3;
      // if (moveTheOtherWay) {
      //   person.dx = person.dx * -1;
      // } 
    }
  });
}

function requestElevator(floor) {
  if (stopAtFloor !== floor) {
    stopAtFloor = floor;
    console.log("Elevator requested on floor " + floor);
  }
}
                 
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
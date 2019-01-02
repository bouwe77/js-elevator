// === Config ===
// Speed = The number of pixels to move the sprite up/down every frame
var elevatorSpeed = 1;
var peopleMovingSpeed = 0.2;
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

var car1 = createCar();

var floors = createFloors(numberOfFloors);

var people = createPeople();

startElevator();

var loop = kontra.gameLoop({
  update() {
    updateAnimatedSprites();
    
    resetDirection();
    updateCurrentFloor();
    movePeopleAround();
    stopElevatorWhenArrived();
    //letPeopleEnterElevator();
    updateControlPanel();
  },
  render() {
    renderAnimatedSprites();
  }
});

loop.start();

function renderAnimatedSprites() {
  floors.forEach(function(floor) {
    floor.render();
  });

  car1.render();
  
  people.forEach(function(person) {
    person.render();
  });
}

function updateAnimatedSprites() {
  car1.update();
  people.forEach(function(person) {
    person.update();
  });  
}

function stopElevatorWhenArrived() {
  if (car1.currentFloor === car1.stopAtFloor) {
    stopElevator();
  }
}

function resetDirection() {
  var bottom = car1.y + carHeight > kontra.canvas.height;
  if (bottom) {
    car1.dy = elevatorSpeed*-1;
    car1.direction = 'up';
  } 
  else {
    var top = car1.y < 0;
    if (top) {
      car1.dy = elevatorSpeed;
      car1.direction = 'down';
    }
  }
}

function updateCurrentFloor() {
  var y = Math.round(car1.y);

  if (y % carHeight === 0) {
    car1.currentFloor = (y/carHeight - numberOfFloors) * -1;
  }
}

function stopElevator() {
  car1.dy = 0;
  car1.moving = false;
}

function startElevator() {
  car1.dy = elevatorSpeed;
  car1.moving = true;
}

function updateControlPanel() {
  var status = "Floor: " + car1.currentFloor + "<br/>";
  status += "# peeps: " + car1.currentNumberOfPeople;
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

    // Custom Car properties
    currentFloor: 0,
    direction: 'up',
    stopAtFloor: -1,
    moving: false,
    capacity: 2,
    currentNumberOfPeople: 0,
    locked: false
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

  var x = getRandomNumber(carWidth, canvasWidth-carWidth);
  x = 40;
  var y = getPersonPositionForFloor(floor);

  return kontra.sprite({
    x: x,
    y: y,
    color: color,
    width: personWidth,
    height: personHeight,
    dx: personMovingSpeed * -1,

    // Custom Person properties
    currentFloor: floor,
    elevatorRequested: false
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
      person.dx = peopleMovingSpeed * -1;
    }

    // If the person is on the far left, stop moving and request an elevator.
    if (farLeft) {
      person.dx = 0;
      requestElevator(person);
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

function requestElevator(person) {
  person.elevatorRequested = true;
  if (car1.stopAtFloor !== person.currentFloor) {
    car1.stopAtFloor = person.currentFloor;
  }
}

function letPeopleEnterElevator() {
  
  if (car1.locked)
    return;
  
  car1.locked = true;
  
  if (car1.moving) {
    car1.locked = false;
    return;
  }
  
  var peopleWaitingForElevator = people
  .filter(person => 
          person.elevatorRequested
          && person.currentFloor === car1.currentFloor);
  var anyPeopleWaiting = peopleWaitingForElevator.length !== 0;
  
  if (!anyPeopleWaiting) {
    car1.locked = false;
    return;
  }
  
  var howManyPeopleCanEnter = car1.capacity - car1.currentNumberOfPeople;
  if (howManyPeopleCanEnter === 0) {
    //consolelog("No people can enter: " + car1.capacity + " - " + car1.currentNumberOfPeople)
    car1.locked = false;
    return;
  }
  
  consolelog('Car has stopped, people are waiting and there is room');
  
  peopleWaitingForElevator.forEach(function(person) {
    enterElevator(person);
  });
  
  car1.locked = false;
}

function enterElevator(person) {
  consolelog("entering elevator...")
  person.elevatorRequested = false;
  //person.x = car1.currentNumberOfPeople * 10;
  //consolelog(person.x);

  person.x = 0;

  car1.currentNumberOfPeople = 1;
}

// ================ UTILITIES ========================================================

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentTime() {
  var today = new Date();
  return today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + ',' + today.getMilliseconds();
}

function consolelog(message) {
  console.log(getCurrentTime() + " - " + message);
}
// ===================================================================================
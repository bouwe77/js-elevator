// === Config ===
// Speed = The number of pixels to move the sprite up/down every frame
var elevatorSpeed = 1;
var peopleMovingSpeed = 0.2;
var numberOfFloors = 4; // above ground floor
var carWidth = 20;
var carHeight = 20;
var totalBuildingHeight = (numberOfFloors + 1) * carHeight;
var canvasWidth = 200;
var canvasHeight = totalBuildingHeight;
var personWidth = carWidth/3;
var personHeight = carHeight/3;
var car1, floors, people;

start();

function start() {

  kontra.init();
  kontra.canvas.width = canvasWidth;
  kontra.canvas.height = canvasHeight;

  car1 = createCar();
  floors = createFloors(numberOfFloors);
  people = createPeople();

  startElevator();

  var loop = kontra.gameLoop({
    update() {
      updateAllSprites();

      resetDirection();
      updateCurrentFloor();
      handleArrivingAtDestinationFloor();
      movePeopleAround();
      updateControlPanel();
      displayPeople();
    },
    render() {
      renderAllSprites();
    }
  });

  loop.start();  
}

function renderAllSprites() {
  floors.forEach(function(floor) {
    floor.render();
  });

  car1.render();

  people.forEach(function(person) {
    person.render();
  });
}

function updateAllSprites() {
  car1.update();
  people.forEach(function(person) {
    person.update();
  });  
}

function handleArrivingAtDestinationFloor() {
  if (car1.currentFloor === car1.nextStopAtFloor && car1.doorsOpen) {
    stopElevator();
    letPeopleEnterElevator();
  }
}

function resetDirection() {
  var reachedBottom = car1.y + carHeight > kontra.canvas.height;
  if (reachedBottom) {
    car1.dy = elevatorSpeed*-1;
    car1.direction = 'up';
  } 
  else {
    var reachedTop = car1.y < 0;
    if (reachedTop) {
      car1.dy = elevatorSpeed;
      car1.direction = 'down';
    }
  }
}

function updateCurrentFloor() {
  var y = Math.round(car1.y);

  if (y % carHeight === 0) {
    car1.currentFloor = (y/carHeight - numberOfFloors) * -1;
    openDoors();
  } else {
    closeDoors();
  }
}

function stopElevator() {
  if (car1.moving) {
    car1.dy = 0;
    car1.moving = false;
  }
}

function startElevator() {
  if (!car1.moving) {
    car1.dy = elevatorSpeed;
    car1.moving = true;
  }
}

function updateControlPanel() {
  var status = "Current floor: " + car1.currentFloor + "<br/>";
  status += "People in elevator: " + car1.currentNumberOfPeople + "<br/>";
  status += "Requested UP: " + car1.requestedFloorsUp + "<br/>";
  status += "Requested DOWN: " + car1.requestedFloorsDown + "<br/>";

  var statusElement = document.getElementById("status");
  statusElement.innerHTML = status;
}

function displayPeople() {
  var peopleDetails = '';
  people.forEach(function(person) {
    peopleDetails += person.currentFloor + ": " + person.name + "<br/>";
  }); 

  var peopleElement = document.getElementById("people-details");
  peopleElement.innerHTML = peopleDetails;
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
    direction: null,
    requestedFloorsUp: [],
    requestedFloorsDown: [],
    nextStopAtFloor: null,
    moving: false,
    capacity: 2,
    currentNumberOfPeople: 0,
    doorsOpen: false
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

  // Create a random number of people on each floor.
  // for (var floor = 0; floor <= numberOfFloors; floor++) { 
  //   consolelog(floor);
  //   var howManyPeople = getRandomNumber(0, 5);
  //   for (var i = 0; i < howManyPeople; i++) {
  //     people.push(createPerson(floor));
  //   }
  // }

  return people;
}

function createPerson(floor) {
  var color = getRandomColor();
  var name = getRandomName();

  //var x = getRandomNumber(carWidth, canvasWidth-carWidth);
  var x = getRandomNumber(carWidth, 80);
  var y = getPersonVerticalPosition(floor);

  return kontra.sprite({
    x: x,
    y: y,
    color: color,
    width: personWidth,
    height: personHeight,

    // Custom Person properties
    startedMoving: false,
    name: name,
    currentFloor: floor,
    elevatorRequested: false,
    onElevator: false
  });
}

function getPersonVerticalPosition(floor) {
  return totalBuildingHeight - 10 - (floor*carHeight);
}

function movePeopleAround() {

  people.forEach(function(person) {
    var x = Math.round(person.x);

    if (!person.startedMoving) {
      person.startedMoving = true;
      person.dx = peopleMovingSpeed * -1;      
    }

    var farRight = x > (canvasWidth - personWidth);
    var farLeft = x < carWidth;

    // Move the person the other way if it is on the far right.
    if (farRight) {
      person.dx = peopleMovingSpeed * -1;
    }

    // If the person is on the far left, stop moving and request an elevator.
    if (farLeft && !person.elevatorRequested && !person.onElevator) {
      person.dx = 0;
      requestElevator(person);
    }
    else {
      // Randomly determine whether the person will move the other way.
      var moveTheOtherWay = getRandomNumber(1,30) === 3;
      if (moveTheOtherWay) {
        person.dx = person.dx * -1;
      } 
    }
  });

  // Arrange people that are waiting for an elevator, so they are all visible.
  for (var floor = 0; floor <= numberOfFloors; floor++) {  
    var peopleWaitingForElevator = people
    .filter(person => 
            person.currentFloor == floor 
            && person.elevatorRequested);
    displayPeopleGroup(peopleWaitingForElevator, carWidth);
  }
}

function requestElevator(person) {

  consolelog('requesting elevator...');

  if (person.elevatorRequested)
    return;

  person.elevatorRequested = true;

  var requestedFloor = person.currentFloor;
  addRequestedFloorToQueue(requestedFloor);
}

function addRequestedFloorToQueue(requestedFloor) {
  var direction = 'up';
  if (car1.currentFloor > requestedFloor)
    direction = 'down';

  if (direction === 'up' && 
      car1.requestedFloorsUp.indexOf(requestedFloor) === -1) {
    // Add floor to requests.
    car1.requestedFloorsUp.push(requestedFloor);

    // Sort descending.
    car1.requestedFloorsUp = car1.requestedFloorsUp
      .sort(function (a, b) {  return b - a;  });

    // Determine next stop.
    car1.nextStopAtFloor = car1.requestedFloorsUp[0];
  } 
  else if (direction === 'down' && 
           car1.requestedFloorsDown.indexOf(requestedFloor) === -1) {
    // Add floor to requests.
    car1.requestedFloorsDown.push(requestedFloor);

    // Sort ascending.
    car1.requestedFloorsDown = car1.requestedFloorsDown
      .sort(function (a, b) {  return a - b;  });

    // Determine next stop.
    car1.nextStopAtFloor = car1.requestedFloorsDown[0];
  }
}

function letPeopleEnterElevator() {
  if (car1.moving)
    return;

  var peopleWaitingForElevator = people
  .filter(person => 
          person.elevatorRequested
          && person.currentFloor === car1.currentFloor);
  var anyPeopleWaiting = peopleWaitingForElevator.length !== 0;

  if (!anyPeopleWaiting)
    return;

  var howManyPeopleCanEnter = car1.capacity - car1.currentNumberOfPeople;
  if (howManyPeopleCanEnter === 0) {
    return;
  }

  peopleWaitingForElevator.forEach(function(person) {
    enterElevator(person);
    chooseDestinationFloor(person);
  });

  var peopleOnElevator = people
  .filter(person => person.onElevator);
  displayPeopleGroup(peopleOnElevator, 0);

  closeDoors();
  startElevator();
}

function enterElevator(person) {
  consolelog("entering elevator...")
  person.onElevator = true;
  person.elevatorRequested = false;

  car1.currentNumberOfPeople++;
}

function chooseDestinationFloor(person) {
  // Randomly choose floor.
  var destinationFloor = getRandomNumber(0, numberOfFloors);
  while (destinationFloor === person.currentFloor) {
    destinationFloor = getRandomNumber(0, numberOfFloors);
  }

  addRequestedFloorToQueue(destinationFloor);
}

/**
 * Displays multiple people next to each other.
 */
function displayPeopleGroup(people, startX) {
  people.forEach(function(person) {
    person.x = startX;
    startX += personWidth + 2;
  });
}

function openDoors() {
  car1.doorsOpen = true;
}

function closeDoors() {
  car1.doorsOpen = false;
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

function getRandomColor() {
  var colors = [
    "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177" ,"#0d5ac1" ,
    "#f205e6" ,"#1c0365" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
    "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
    "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635","#b11573" ,"#4bb473" ,"#75d89e" ,
    "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f" ,"#b0d87b" ,"#ca4751" ,"#7e50a8" ,
    "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0" ,"#ffdbe1" ,"#2f1179" ,
    "#935b6d" ,"#916988" ,"#513d98" ,"#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"];
  return colors[Math.floor(Math.random()*colors.length)];
}

function getRandomName() {
  var names = ["Jacob","Michael","Matthew","Joshua","Christopher","Nicholas","Andrew","Joseph","Daniel","Tyler","William","Brandon","Ryan","John","Zachary","David","Anthony","James","Justin","Alexander","Jonathan","Christian","Austin","Dylan","Ethan","Benjamin","Noah","Samuel","Robert","Nathan","Cameron","Kevin","Thomas","Jose","Hunter","Jordan","Kyle","Caleb","Jason","Logan","Aaron","Eric","Brian","Gabriel","Adam","Jack","Isaiah","Juan","Luis","Connor","Emily","Hannah","Madison","Ashley","Sarah","Alexis","Samantha","Jessica","Elizabeth","Taylor","Lauren","Alyssa","Kayla","Abigail","Brianna","Olivia","Emma","Megan","Grace","Victoria","Rachel","Anna","Sydney","Destiny","Morgan","Jennifer","Jasmine","Haley","Julia","Kaitlyn","Nicole","Amanda","Katherine","Natalie","Hailey","Alexandra","Savannah","Chloe","Rebecca","Stephanie","Maria","Sophia","Mackenzie","Allison","Isabella","Amber","Mary","Danielle","Gabrielle","Jordan"];
  return names[Math.floor(Math.random()*names.length)];
}

// ===================================================================================
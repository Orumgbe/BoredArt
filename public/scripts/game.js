document.addEventListener('DOMContentLoaded', () => {
  const urlPath = window.location.pathname.split('/');
  const roomId = urlPath[urlPath.length - 1];

  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');

  // Initialize canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Game logic starts
  let drawingPlayer = null;

  // Upon clicking start game, get all users
  const startButton = document.getElementById('startGame');
  const displayDiv = document.getElementById('displayDiv');
  const promptDiv = document.getElementById('promptDiv');
  startButton.addEventListener('click', async () => {
    socket.emit('startGame', roomId);
  });

  // Function to handle button click
  function handleChoice(choice) {
    clearTimeout(timeoutChoice);
    promptDiv.classList.add('remove');
    const message = choice;
    console.log(message);
  }

 socket.on('gameStart', function(gameData) {
    console.log(gameData);
    try {
      startButton.classList.add('remove');
      while (gameData.roundsPlayed < gameData.rounds) {
        displayDiv.innerText = `Round ${gameData.roundsPlayed + 1}`;
        const players = gameData.users;      
        const playmap = new Map(Object.entries(players)); // Use map to ensure play order
        const words = gameData.wordChoice;
        playmap.forEach((userData, username) => {
          drawingPlayer = username;
          // Display prompt with buttons
          socket.emit('choosing-word', { roomId, username });
          if (drawingPlayer === username) {
            promptDiv.innerHTML = `<p>Choose a word: </p>
            <button onclick="handleChoice('${words[0]}')">${words[0]}</button>
            <button onclick="handleChoice('${words[1]}')">${words[1]}</button>
            <button onclick="handleChoice('${words[2]}')">${words[2]}</button>`;

            // Choice timeout after 10
            timeoutChoice = setTimeout(() => {
            const randomChoice = words[Math.floor(Math.random() * words.length)];
            handleChoice(randomChoice);
            }, 10000);
          }
        });

        gameData.roundsPlayed = gameData.roundsPlayed + 1;
  
        // Add new user to map
        socket.on('userJoined', async (user) => {
          const userData = await getUser(roomId, user);
          playmap.set(user, userData);
        });
        // Remove user from map
        socket.on('userLeft', async (user) => {
          playmap.delete(user);
        });
      }
    } catch (error) {
      console.log('Error in gameStart', error);
    }
  }); 
  
  // Game logic ends

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let color = '#000';
  let lineWidth = 5;
  let isEraser = false;

  socket.on('drawing', function(data) {
    if (data.roomId === roomId) {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.lineWidth);
      console.log(`${data.username} sent drawing event`);
    }
  });

  socket.on('clearCanvas', function(data) {
    if (data.roomId === roomId) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  // Event listeners for drawing
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', finishDrawing);
  canvas.addEventListener('mouseout', finishDrawing);
  canvas.addEventListener('mousemove', draw);

  // Event listener for touch devices
  canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    startDrawing(event.touches[0]);
  }, false);
  canvas.addEventListener('touchend', function(event) {
    event.preventDefault();
    finishDrawing();
  }, false);
  canvas.addEventListener('touchcancel', function(event) {
    event.preventDefault();
    finishDrawing();
  }, false);
  canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    draw(event.touches[0]);
  }, false);

  // Event listeners for control buttons
  document.getElementById('colorPicker').addEventListener('change', (e) => {
    color = e.target.value;
    isEraser = false;
  });

  document.getElementById('lineWidth').addEventListener('change', (e) => {
    lineWidth = e.target.value;
  });

  document.getElementById('clearButton').addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas', { roomId });
  });

  document.getElementById('eraserButton').addEventListener('click', () => {
    isEraser = true;
  });

  document.getElementById('penButton').addEventListener('click', () => {
    isEraser = false;
  });

  // Functions for drawing
  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    draw(e); // Draw initial dot
  }

  function draw(e) {
    if (!isDrawing) return;
  
    const rect = canvas.getBoundingClientRect();
    let offsetX, offsetY;
  
    if (e.type === 'touchmove') {
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
    } else {
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }
  
    const drawColor = isEraser ? '#FFF' : color;
    const drawLineWidth = isEraser ? 20 : lineWidth;
    drawLine(lastX, lastY, offsetX, offsetY, drawColor, drawLineWidth);
  
    socket.emit('drawing', {
      roomId,
      x0: lastX,
      y0: lastY,
      x1: offsetX,
      y1: offsetY,
      color: drawColor,
      lineWidth: drawLineWidth,
      username: drawingPlayer
    });
  
    lastX = offsetX;
    lastY = offsetY;
  }
  
  function finishDrawing() {
    isDrawing = false;
  }

  function drawLine(x0, y0, x1, y1, color, lineWidth) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
  }
});

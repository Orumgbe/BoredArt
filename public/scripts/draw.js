document.addEventListener('DOMContentLoaded', () => {
  const urlPath = window.location.pathname.split('/');
  const roomId = urlPath[urlPath.length - 1];

  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');

  // Initialize canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let color = '#000';
  let lineWidth = 5;
  let isEraser = false;

  socket.on('drawing', function(data) {
    if (data.roomId === roomId) {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.lineWidth);
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
  
    const drawColor = isEraser ? 'burlywood' : color;
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
      username: localStorage.getItem('username') || ''
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

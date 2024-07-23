document.addEventListener("DOMContentLoaded", function() {
  // Retrieve required parameters
  const username = localStorage.getItem('username');
  const urlPath = window.location.pathname.split('/');
  const roomId = urlPath[urlPath.length - 1];

  // Get all the necessary elements by ID
  const chatList = document.getElementById('chats');
  const chatForm = document.getElementById('chat');
  const input = document.getElementById('input');

  chatForm.addEventListener('submit', (button) => {
    button.preventDefault();
    if (input.value) {
      // Remove extra white space
      const message = input.value.trim();
      // Emit chat message event to server
      if (message !== '') {
        socket.emit('chatMessage', { roomId, username, message });
        // Append message for sender
        const item = document.createElement('li');
        item.textContent = `You: ${message}`;
        chatList.appendChild(item);
        // Scroll to bottom of chat container
        chatList.scrollTop = chatList.scrollHeight;
        // Clear input buffer after emitting
        input.value = '';
      }
    }
  });

  socket.on('roomMessage', (data) => {
    const item = document.createElement('li');
    item.textContent = `${data.username}: ${data.message}`;
    chatList.appendChild(item);
    chatList.scrollTop = chatList.scrollHeight;
  });

  socket.on('player-choosing', (username) => {
    const item = document.createElement('li');
    item.textContent = `${username} is choosing a word`;
    item.id = 'game-info-text';
    chatList.appendChild(item);
    chatList.scrollTop = chatList.scrollHeight;
  });
});

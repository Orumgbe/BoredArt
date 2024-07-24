document.getElementById('join-room-form').addEventListener('submit', () => {
  const username = document.getElementById('username').value;
  // Save to browser localStorage
  localStorage.setItem('username', username);
});

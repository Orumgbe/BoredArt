document.getElementById('join-room-form').addEventListener('submit', () => {
  const username = document.getElementById('username').value;
  console.log(`User ${username} joined`);
  localStorage.setItem('username', username);
});

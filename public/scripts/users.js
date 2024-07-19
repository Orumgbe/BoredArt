document.addEventListener('DOMContentLoaded', async () => {
  const urlPath = window.location.pathname.split('/');
  const roomId = urlPath[urlPath.length - 1];

  let inactiveTimeout;

  socket.on('connect', async () => {
    const username = localStorage.getItem('username');
    console.log(username, 'connected to server with id:', socket.id);
    clearTimeout(inactiveTimeout);
    socket.emit('joinRoom', { roomId, username });
    try {
      const userData = await getUser(roomId, username);
      const existingMember = document.getElementById(username);
      if (existingMember) {
        console.log(`${username} reconnected with id: ${socket.id}`);
        existingMember.classList.remove('inactive');
        existingMember.textContent = `${username} (Score: ${userData.score})`;
      } else {
        const users = await getAllUsers(roomId);
        users[username] = userData;
        for (const username in users) {
          addUserToPage(username, users[username]);
        }
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  });

  socket.on('userJoined', async (user) => {
    console.log('userJoined event received for user:', user); // Add log
    try {
      const userData = await getUser(roomId, user); // Pass roomId as well
      addUserToPage(user, userData);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  });

  socket.on('userLeft', (username) => {
    console.log('userLeft event received for user:', username); // Add log
    try {
      const disconnectedUser = document.getElementById(username);
      if (disconnectedUser) {
        disconnectedUser.classList.add('inactive');
        inactiveTimeout = setTimeout(async () => {
          const res = await fetch(`http://0.0.0.0:3000/api/${roomId}/${username}/delete`);
          localStorage.removeItem(username);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const response = await res.json();
          console.log(response);
          disconnectedUser.remove();
        }, 5000);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
});


function addUserToPage(username, userData) {
  console.log('Adding user to page:', username, userData); // Add log
  const membersContainer = document.getElementById('members_container');
  const memberDiv = document.createElement("div");
  memberDiv.classList.add("member");
  memberDiv.id = username;
  memberDiv.textContent = `${username} (Score: ${userData.score})`;
  membersContainer.appendChild(memberDiv);
}

export async function getUser(roomId, username) {
  try {
    const res = await fetch(`http://0.0.0.0:3000/api/${roomId}/${username}`);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await res.json();
    return userData;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return {};
  }
}

export async function getAllUsers(roomId) {
  try {
    const res = await fetch(`http://0.0.0.0:3000/api/${roomId}`);
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const users = await res.json();
    return users;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return {};
  }
}

const domainName = 'http://0.0.0.0:3000';

async function getUser(roomId, username) {
  try {
    const res = await fetch(`${domainName}/api/${roomId}/${username}`);
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

async function getAllUsers(roomId) {
  try {
    const res = await fetch(`${domainName}/api/${roomId}`);
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

async function updateSocketId(roomId, username, socketId) {
  try {
    const response = await fetch(`${domainName}/api/${roomId}/${username}/${socketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log(data);
    } else {
      console.error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function addUserToPage(username, userData) {
  console.log('Adding user to page:', username, userData); // Add log
  const membersContainer = document.getElementById('members_container');
  const memberDiv = document.createElement("div");
  memberDiv.classList.add("member");
  memberDiv.id = username;
  memberDiv.textContent = `${username}`;
  membersContainer.appendChild(memberDiv);
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlPath = window.location.pathname.split('/');
  const roomId = urlPath[urlPath.length - 1];

  let inactiveTimeout;

  socket.on('connect', async () => {
    const username = localStorage.getItem('username');
    console.log(username, 'connected to server with id:', socket.id);
    clearTimeout(inactiveTimeout);
    await updateSocketId(roomId, username, socket.id) 
    socket.emit('joinRoom', { roomId, username });
    try {
      const userData = await getUser(roomId, username);
      const existingMember = document.getElementById(username);
      if (existingMember) {
        console.log(`${username} reconnected with id: ${socket.id}`);
        existingMember.classList.remove('inactive');
        existingMember.textContent = `${username}`;
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

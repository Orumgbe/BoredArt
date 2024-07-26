const domainName = 'https://boredart.onrender.com';

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

function addUserToPage(username) {
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


  const memberCount = document.getElementById('member-count');
  const maxCapacity = 5;
  const leaveButton = document.getElementById('leaveButton');
  let inactiveTimeout;

  socket.on('connect', async () => {
    const username = localStorage.getItem('username');
    clearTimeout(inactiveTimeout);
    if (!username) {
      window.location.href = `/room/${roomId}/join`;
      return;
    }
    await updateSocketId(roomId, username, socket.id) 
    socket.emit('joinRoom', { roomId, username });
    try {
      const userData = await getUser(roomId, username);
      const existingMember = document.getElementById(username);
      if (existingMember) {
        console.log(`${username} reconnected to room`);
        existingMember.classList.remove('inactive');
        existingMember.textContent = `${username}`;
      } else {
        const users = await getAllUsers(roomId);
        // Add member count
        memberCount.textContent = `${Object.keys(users).length}/${maxCapacity}`;
        users[username] = userData;
        for (const username in users) {
          addUserToPage(username);
        }
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  });

  socket.on('userJoined', async (user) => {
    try {
      addUserToPage(user);
      const users = await getAllUsers(roomId);
      // Update member count
      memberCount.textContent = `${Object.keys(users).length}/${maxCapacity}`;
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  });

  leaveButton.addEventListener('click', async () => {
    // Request to clear the cookie
    try {
      const response = await fetch(`${domainName}/api/${roomId}/clear-cookie`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included in the request
      });

      if (!response.ok) {
        throw new Error('Failed to clear cookie');
      }

      // Disconnect from socket
      socket.disconnect();

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
  });

  leaveButton.addEventListener('touchstart', async () => {
    // Request to clear the cookie
    try {
      const response = await fetch(`${domainName}/api/${roomId}/clear-cookie`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are included in the request
      });

      if (!response.ok) {
        throw new Error('Failed to clear cookie');
      }

      // Disconnect from socket
      socket.disconnect();

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error clearing cookie:', error);
    }
  });

  socket.on('userLeft', (username) => {
    console.log('userLeft event received for user:', username); // Add log
    try {
      const disconnectedUser = document.getElementById(username);
      if (disconnectedUser) {
        disconnectedUser.classList.add('inactive');
        inactiveTimeout = setTimeout(async () => {
          const res = await fetch(`${domainName}/api/${roomId}/${username}/delete`);
          localStorage.removeItem('username');
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const users = await getAllUsers(roomId);
          // Update member count after user leaves
          memberCount.textContent = `${Object.keys(users).length}/${maxCapacity}`;
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

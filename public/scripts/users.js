document.addEventListener('DOMContentLoaded', () => {
  // Function to get roomId from the URL
  function getRoomIdFromUrl() {
      const urlPath = window.location.pathname.split('/');
      // return roomId at the last part of url
      return urlPath[urlPath.length - 1];
  }

  // Fetch room members
  async function fetchUserData(roomId) {
    try {
      const response = await fetch(`http://0.0.0.0:3000/api/${roomId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      displayUsers(data);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  }

  // Function to display user data on the page
  function displayUsers(users) {
    const membersContainer = document.getElementById("members_container");

    for (const [username, data] of Object.entries(users)) {
      const memberDiv = document.createElement("div");
      memberDiv.classList.add("member");
      if (!data.isActive) {
        memberDiv.classList.add("inactive");
      }
      memberDiv.textContent = `${username}: ${data.score}`;
      membersContainer.appendChild(memberDiv);
    }
  }

  // Get the roomId, fetch and display the data
  const roomId = getRoomIdFromUrl();
  fetchUserData(roomId);
});

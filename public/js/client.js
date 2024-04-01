//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox__people");


let userName = "";
let id;

const newUserConnected = function (data) {
    

    //give the user a random unique id
    id = Math.floor(Math.random() * 1000000);
    userName = 'user-' +id;
    //emit an event with the user id
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);

    displayNotif(`${userName} has joined.`);

};

const addToUsersBox = function (userName) {
    //This if statement checks whether an element of the user-userlist
    //exists and then inverts the result of the expression in the condition
    //to true, while also casting from an object to boolean
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    
    }
    
    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
    <div class="chat_id ${userName}-userlist">
      <h5>${userName}</h5>
    </div>

  `;

    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

const displayNotif = function (message){
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.textContent = message;
    // Get the div containing the navbar class
  const navbarDiv = document.querySelector(".navbar");
  const messageForm = document.querySelector(".message_form");
  const notificationsContainer = document.querySelector('.notifications');

  // Append the notification next to the form element and under the navbar div
  navbarDiv.parentNode.insertBefore(notification, navbarDiv.nextSibling);
  messageForm.parentNode.insertBefore(notification, messageForm.nextSibling);
  document.body.after(notification);

  setTimeout(() =>{
    notification.style.backgroundColor = "#cecdcd";
  }, 200); //changes the colour of the notif after 0.2 sec so the newest message is highlighted
  setTimeout(() =>{
    notification.remove();
  }, 3000); //removes notif after 3sec
};


//call 
newUserConnected();

//when a new user event is detected
socket.on("new user", function (data) {
  data.map(function (user) {
    return addToUsersBox(user);
   });
});

//when a user leaves
socket.on("user disconnected", function (userName) {
  displayNotif(`${userName} has left.`);
  document.querySelector(`.${userName}-userlist`).remove();
});


const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  //is the message sent or received
  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

// Event listener for input field to detect typing
inputField.addEventListener("input", () => {
    if (inputField.value) {
        // display HTML notification for user typing
        displayNotif(`${userName} is typing`);

    } 
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});
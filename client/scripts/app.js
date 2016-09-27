class App {
  constructor(server) {
    this.server = server;
  }
  init() {
    this.fetch();
  }
  send(message) {
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: (data) => {
        console.log('chatterbox: Message sent');
        this.clearMessages();
        this.fetch();
      },
      error: (data) => {
        console.error('chatterbox: Failed to send message!', data);
      }
    });
  }
  fetch() {
    $.ajax({
      url: this.server,
      type: 'GET',
      success: (data) => {
        data.results.forEach((message) => {
          this.renderMessage(message);
        });
      },
      error: (data) => {
        console.error('chatterbox: Failed to fetch messages!', data);
      }
    });
  }
  clearMessages() {
    $('#chats').empty();
  }
  renderMessage(message) {
    $('#chats').append(`<div class='message'>
                          <p class='username'>${escapeHtml(message.username)}</p>
                          <p class='text'>${escapeHtml(message.text)}</p>
                          <p class='roomname'>${escapeHtml(message.roomname)}</p></div>`);
    $('.username').on('click', () => {
      this.handleUsernameClick();
    });
  }
  renderRoom(roomName) {
    $('#roomSelect').append(`<option>${roomName}</option>`);
  }
  handleUsernameClick() {

  }
  handleSubmit() {
    var message = {
      username: getUserName(),
      text: getText(),
      roomname: getRoomName()
    };
    this.send(message);
  }
}

var app = new App('https://api.parse.com/1/classes/messages');

$(document).ready(() => {
  $('#send').on('submit', () => {
    app.handleSubmit();
    return false;
  });

  $('.userName').append('Welcome ' + getUserName());
  // Get the messages from a selected room name
  app.init();
});

var getUserName = () => {
  return window.location.search.slice(window.location.search.indexOf('=') + 1);
};

var getText = () => {
  return $('#message').val();
};

var getRoomName = () => {
  return $('#roomSelect option:selected').text();
};

// Sanitize the input string
var escapeHtml = (str) => {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// Refresh message list view every 5000 ms
setInterval(() => {
  app.clearMessages();
  app.fetch();
}, 5000);
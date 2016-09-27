class App {
  constructor(server) {
    this.server = server;
    this.rooms = [];
    this.roomsPopulated = false;
    this.selectedRoom = '';
  }
  init() {
    this.fetch();
  }
  send(message) {
    $.ajax({
      url: this.server,
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
        var messages = data.results;
        messages = _.map(messages, (message) => {
          return { 
            username: escapeHtml(message.username),
            text: escapeHtml(message.text),
            roomname: escapeHtml(message.roomname)
          };
        });

        // Refresh the room list
        this.getRoomnames(messages);
        // Refresh room drop down list (UI)
        this.refreshRoomDropDownList();
        // if a room is selected then filter by room name
        if (this.selectedRoom.length > 0) {
          // Filter by room name
          messages = filterMessagesByRoomName(messages, this.selectedRoom);
        }
        messages.forEach((message) => {
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
    $('#chats').append(`<div class='chat'>
                          <div class='username'>${message.username}</div>
                          <div class='text'>${message.text}</div>
                          <div class='text'>${message.roomname}</div>
                          </div>`);
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

  getRoomnames(messages) {
    _.each(messages, (message) => {
      if (this.rooms.indexOf(message.roomname) === -1) {
        this.rooms.unshift(message.roomname);
      }
    });
  }

  refreshRoomDropDownList() {
    _.each(this.rooms, (room) => {
      if (!this.roomsPopulated) {
        $('#roomSelect').append(`<option value=${room}>${room}</option>`);
      } else {
        if (this.rooms.indexOf(room) === -1) {
          $('#roomSelect').append(`<option value=${room}>${room}</option>`);
        }
      }
    });
    this.roomsPopulated = true;
  }
}

var app = new App('https://api.parse.com/1/classes/messages');

$(document).ready(() => {
  $('#send').on('submit', () => {
    app.handleSubmit();
    return false;
  });

  $('#roomSelect').on('change', () => {
    app.selectedRoom = $('#roomSelect').find('option:selected').val();
    app.clearMessages();
    app.fetch();
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

var filterMessagesByRoomName = (messages, roomName) => {
  return _.filter(messages, (message) => {
    return message.roomname === roomName;
  });
};

// Sanitize the input string
var escapeHtml = (str) => {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

//Refresh message list view every 5000 ms
setInterval(() => {
  app.clearMessages();
  app.fetch();
}, 5000);
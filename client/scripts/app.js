class App {
  constructor(server) {
    this.server = server;
    this.rooms = [];
    this.roomsPopulated = false;
    this.selectedRoom = 'Lobby';
    this.defaultRoom = 'Lobby';
  }

  init() {
    // // setup all the even listeners
    // $('#send').on('submit', (event) => {
    //   setSpinner(true);
    //   this.handleSubmit();
    //   $('#message').val('');
    //   return false;
    // });

    // $('#chats').on('click', '.username', (event) => {
    //   this.handleUsernameClick(event);
    // });

    // $('#refresh').on('click', () => {
    //   this.clearMessages();
    //   this.fetch();
    // });
    
    // $('#roomSelect').on('change', () => {
    //   var roomSelected = $('#roomSelect').find('option:selected').val();
    //   if ($('#roomSelect').prop('selectedIndex') === 0) {
    //     // create a new room
    //     var roomname = prompt('New Room');
    //     if (roomname) {
    //       // append it to the room list and select it
    //       setNewRoom(roomname);
    //     } else {
    //       $('#roomSelect option[value="' + this.defaultRoom + '"]').attr('selected', 'selected');
    //     }
    //   } else {
    //     this.selectedRoom = roomSelected;
    //     this.clearMessages();
    //     this.fetch();
    //   }
    // });

    // $('.userName').append('Welcome ' + getUserName());
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
      data: 'order=-createdAt',
      success: (data) => {
        var messages = data.results;
        messages = _.map(messages, (message) => {
          return { 
            username: escapeHtml(message.username),
            text: escapeHtml(message.text),
            roomname: escapeHtml(message.roomname)
          };
        });

        this.getRoomnames(messages);
        this.refreshRoomDropDownList();

        if (this.selectedRoom.length > 0) {
          messages = filterMessagesByRoomName(messages, this.selectedRoom);
        }
        this.clearMessages();
        messages.forEach((message) => {
          this.renderMessage(message);
        });
        setSpinner(false);
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
                        </div>`);
    var elements = $('.chat .username').filter(function() {
      return $(this).text() === message.username;
    });
  }

  renderRoom(roomName) {
    $('#roomSelect').append(`<option>${roomName}</option>`);
  }

  handleUsernameClick(event) {
    var username = $(event.target).html();

    var friendElements = $('.chat .username').filter(function() {
      return $(this).text() === username;
    });

    friendElements.parent().toggleClass('friend');
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
    if ($('#roomSelect option[value="Create new room..."]').length === 0) {
      var $newRoom = $('<option value="Create new room...">Create new room...</option>');
      $('#roomSelect').append($newRoom);
    } 

    _.each(this.rooms, (room) => {
      if (!this.roomsPopulated) {
        $('#roomSelect').append(`<option value="${room}">${room}</option>`);
      } else {
        if (this.rooms.indexOf(room) === -1) {
          $('#roomSelect').append(`<option value="${room}">${room}</option>`);
        }
      }
    });
    $('#roomSelect').val(this.selectedRoom);
    this.roomsPopulated = true;
  }
}

var app = new App('https://api.parse.com/1/classes/messages');

$(document).ready(() => {
  $('#send').on('submit', (event) => {
    setSpinner(true);
    app.handleSubmit();
    $('#message').val('');
    return false;
  });

  $('#chats').on('click', '.username', (event) => {
    app.handleUsernameClick(event);
  });

  $('#refresh').on('click', () => {
    app.clearMessages();
    app.fetch();
  });
    
  $('#roomSelect').on('change', () => {
    var roomSelected = $('#roomSelect').find('option:selected').val();
    if ($('#roomSelect').prop('selectedIndex') === 0) {
      // create a new room
      var roomname = prompt('New Room');
      if (roomname) {
        // append it to the room list and select it
        setNewRoom(roomname);
      } else {
        $('#roomSelect option[value="' + app.defaultRoom + '"]').attr('selected', 'selected');
      }
    } else {
      app.selectedRoom = roomSelected;
      app.clearMessages();
      app.fetch();
    }
  });

  $('.userName').append('Welcome ' + getUserName());
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

var setNewRoom = (newRoomName) => {
  var result = _.find(app.rooms, (roomname) => {
    return roomname === newRoomName;
  });

  if (!result) {
    app.rooms.push(newRoomName);
    $('#roomSelect').append(`<option value="${newRoomName}">${newRoomName}</option>`);
    $('#roomSelect option[value="' + newRoomName + '"]').attr('selected', 'selected');
  }
  app.selectedRoom = newRoomName;
  app.fetch();
};

var setSpinner = (turnOn) => {
  if (turnOn) {
    $('.spinner').show();
  } else {
    $('.spinner').hide();
  }
};

// Sanitize the input string
var escapeHtml = (str) => {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};
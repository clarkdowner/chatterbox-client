class App {
  constructor(server) {
    this.server = server;
  }
  init() {

  }
  send(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message)
    });
  }
  fetch() {
    $.ajax({
      url: this.server,
      type: 'GET'
    });
  }
  clearMessages() {
    $('#chats').empty();
  }
  renderMessage(message) {
    $('#chats').append(`<p>${message.text}</p>`);
  }
  renderRoom(roomName) {
    $('#roomSelect').append(`<option>${roomName}</option>`);
  }
}

var app = new App('https://api.parse.com/1/classes/messages');
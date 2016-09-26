class App {
  constructor() {

  }
  init() {

  }
  send(message) {
    $.ajax({
      url: 'url',
      type: 'POST',
      data: JSON.stringify(message)
    });
  }
}

var app = new App();
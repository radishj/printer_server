//start();
let printer = require('./printer');
const http = require('http');
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

http.createServer((request, response) => {
  if (request.method == 'POST') {
    console.log('Got POST')
    var body = ''
    request.on('data', function(data) {
      body += data;
    })
    request.on('end', function() {
      console.log('Got Body:',body);
      var data = JSON.parse(body);
      sleep(500);
      //console.log(JSON.stringify(data,null,'   '));
      printer.print(data);
      
    })
  } else {
    //console.log('GET')
  }
}).listen(8081);
console.log("printer address:",process.argv[2]," version: 1.0");
console.log('Listen on: '+8081);
printer.print([{"orderID":"Baba Ghannouj Restaurant & Catering"},{"type":"println","text":"Baba Ghannouj Restaurant & Catering"},{"type":"println","text":"Printer connect success."}]);
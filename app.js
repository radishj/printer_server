//start();
let restName = "Cafe Meridian & Catering Company";
let printer = require('./src/printer');
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
      if(data[0].orderID){
        //printer.printOrder(data[0].orderID);
      }
      else{
        console.log("received one order, but no orderID in it!");
      }
      //console.log(JSON.stringify(data,null,'   '));
      /*
      var newTime = new Date().toTimeString();
      var newOrderID = data[0].orderID;
      if(oldOrderID == newOrderID)
      {
        //console.log("Duplicate print declined. ID:"+newOrderID);
        //return;
      }
      else
      {
        time = newTime;
        oldOrderID = newOrderID;
        console.log("Printing... Time:", time,"; ID:",newOrderID,";\n");//,JSON.stringify(data,null,"   "));
    
      }*/
      //printer.print(data);
      
    })
  } else {
    //console.log('GET')
  }
}).listen(8081);
console.log("printer address:",process.argv[2]," version: 1.0");
console.log('Listen on: '+8081);
printer.print([["println","Baba Ghannouj Restaurant & Catering"],["println","Printer connect success."]]);
printer.checkServer();
printer.printOrder('URTaYyCjAyxLnSLfZnvI');
//printer.printOrder('xyDZvZ7imoh68HoQbzIz');
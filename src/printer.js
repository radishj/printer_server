const ThermalPrinter = require("node-thermal-printer").printer;
const Types = require("node-thermal-printer").types;
let db = require('./fb');

function sendCommand(printer, command){
    //console.log('command:',command);
    
    if(!command)
    {
        return {result:false,msg:'Error: command is null'};
    }
    if(!command[0])
    {
        return {result:false,msg:'Error: command.type is null'};
    }
    res={};
    //console.log(command[0]+command[0].length,";",command[1]);
    switch (command[0]) {//type
        case 'set font bold':
                printer.bold(true);
                res = {result:true};
                break;
        case 'set font unbold':
            printer.bold(false);
            res = {result:true};
            break;
        case 'set font big':
            printer.setTypeFontA();
            res = {result:true};
            break;
        case 'set font small':
            printer.setTypeFontB();
            res = {result:true};
            break;
        case 'align':
            if(command[1]==='center')
                printer.alignCenter();
            else if(command[1]==='right')
                printer.alignRight();
            else
                printer.alignLeft();
            res = {result:true};
            break;
        case 'println':
            if(command[1]){//text string
                printer.println(command[1]);
                res = {result:true};
            }
            else
            {
                res = {result:false,msg:'Error: println - command.text is null'};
            }
            break;
        case 'draw line':
            printer.drawLine();
            res = {result:true};
            break;
        case 'printlr':
            var left='';
            var right='';
            if(command[1]) left=command[1];
            if(command[2]) right=command[2];
            printer.leftRight(left, right);
            res = {result:true};
            break;
        case 'table3c':
            //console.log(JSON.stringify(command));
            if(command[1]){//aligns
                if(command[2]){//widths
                    if(command[3]){//data
                        for(i=0; i<command[3].length; i++)
                        {
                            data=[];
                            for(j=0; j<3; j++)
                            {
                                data.push({
                                    text:command[3][i][j],
                                    align:command[1][j],
                                    width:command[2][j]
                                })
                            };
                            printer.tableCustom(data);
                        }
                        //console.log(JSON.stringify(data)+"1111111111111111111111\n");
                        res = {result:true};
                    }
                    else{
                        res = {result:false,msg:'Error: c-table missing data'}; 
                    }
                }
                else{
                    res = {result:false,msg:'Error: c-table missing widths'}; 
                }
            }
            else{
                res = {result:false,msg:'Error: c-table missing aligns'}; 
            }
            break;
                                                                                                                                                                   
        default:
            res = {result:false, msg:'Error: command type ['+command[0]+'] was undefined.'};
    }
    return res;
}
var time = '';
var oldOrderID = '';

async function print (data) {
    let printer = new ThermalPrinter({
        type: Types.EPSON,  // 'star' or 'epson'
        interface: 'tcp://'+ process.argv[2],//'tcp://192.168.0.60',
        options: {
          timeout: 2000
        },
        width: 48,                         // Number of characters in one line - default: 48
        characterSet: 'PC437_USA',          // Character set - default: SLOVENIA
        removeSpecialCharacters: false,    // Removes special characters - default: false
        lineCharacter: "-",                // Use custom character for drawing lines - default: -
    });
    let isConnected = await printer.isPrinterConnected();
    console.log("Printer connected:", isConnected);
    //await printer.printImage('../assets/olaii-logo-black-small.png');
    line = 0;
    data.forEach(command => {
    var res={};
    res = sendCommand(printer,command);
    if(!res.result)
    {
        console.log('Error line:'+line+'; '+res.result);
    }
    return;
    line++;
  });
  printer.cut();
  //printer.openCashDrawer();

  try {
    var res = await printer.execute();
    console.log("Printed:",res);
  } catch (error) {
    console.error("Print error:", error);
  }
}

function printOrder(orderID){
    var docRef = db.collection('printerOrders').doc(orderID);
    var pData=[];
    docRef.get().then(function(doc) {
    if (doc.exists) {
        order = doc.data();
        order.dishData = JSON.parse(order.dishData);
        //console.log(JSON.stringify(order,null,"   "));
        pData.push(["align","center"]);
        pData.push(["set font big"]);
        pData.push(["set font bold"]);
        pData.push(["println","Tasti"]);
        pData.push(["println",order.orderType]);
        pData.push(["set font unbold"]);
        pData.push(["align","left"]);
        pData.push(["println","Order#: "+order.orderNumber]);
        pData.push(["println","Customer Info:"]);
        pData.push(["printlr","Name:"+order.customerName, "Phone:"+order.phone.slice(2)+"    "]);
        var orderTime = order.orderTime.toDate();
        pData.push(["println","Placed: "+orderTime.toLocaleDateString('en-US')+" "+orderTime.toLocaleTimeString('en-US')]);
        if(order.orderType.toLowerCase()==="pickup"){
            pData.push(["align","center"]);
            pData.push(["println","Pickup Time"]);
            var pickupTime = orderTime;
            pickupTime.setMinutes(pickupTime.getMinutes()+20);
            var dateStr = pickupTime.toLocaleDateString('en-US');
            dateStr = dateStr.slice(0,dateStr.length-5);
            pData.push(["println",dateStr+" "+pickupTime.toLocaleTimeString('en-US')]);
        }
        else if(order.orderType.toLowerCase()==="delivery"){
            pData.push(["println","Address: "+order.customerAddress]);
        }
        pData.push(["align","left"]);
        pData.push(["println","Order Details:"]);
        var total=0;
        //console.log('aaaaaaaaaaaaa',order)
        pData.push(["align","center"]);
        order.dishData.mainItems.forEach(dish => {
            var optionsTotal=0;
            var optionsArr=[['Main item', dish.attributeName, dish.price.toFixed(2)+' x '+dish.count]];
            var optionName="";
            dish.subItems.forEach(option => {
                optionsTotal+=option.price*option.count;
                if(optionName!==option.optionName){
                    optionsArr.push([option.optionName,option.name, option.price.toFixed(2)+' x '+option.count]);
                    optionName=option.optionName;
                }
                else
                    optionsArr.push(['',option.name, option.price.toFixed(2)+' x '+option.count])
            });
            var price = dish.price * dish.count + optionsTotal;
            total += price;
            pData.push(["set font big"]);
            pData.push(["printlr",dish.name,price.toFixed(2)]);
            pData.push(["set font small"]);
            var mainItem = [""]
            //console.log('bbbbbbbbbbbbbb',optionsArr,'cccccccccccccccc');
            pData.push(["table3c", 
                ['LEFT','LEFT','RIGHT'],
                [0.25,0.5,0.2],
                optionsArr
            ]);   
        });
        pData.push(["set font big"]);
        pData.push(["align","LEFT"]);
        pData.push(["println","Notes:"]);
        var note=order.notes;
        var len = parseInt(note.length/48);
        var nodes=[];
        for(var i=0; i<len; i++)
        {
            if(len>8){
                note="";
                break;
            }
            pData.push(["println",note.subStr(0,48)]);
            node = note.slice(48);
        }
        if(note!=='')
            pData.push(["println",note]);
        pData.push(["draw line"]);
        pData.push(["printlr","Subtotal:",total.toFixed(2)]);
        pData.push(["printlr","Tax", order.tax.toFixed(2)]);
        pData.push(["printlr","Tip", order.tip.amount.toFixed(2)]);
        pData.push(["printlr","Total", (total+order.tax+order.tip.amount).toFixed(2)]);
        pData.push(["set font small"]);
        pData.push(["align","center"]);
        var restName=order.restName;
        if(order.restPhone)
            restName+=" "+order.restPhone;
        pData.push(["println",restName]);
        pData.push(["println",order.address]);
        print(pData);
        //console.log("Document data:", JSON.stringify(order, null, "   "));

    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

var fs = require('fs');
var restName = "Baba Ghannouj Restaurant & Catering";
async function checkServer()
{
    var d = new Date();
    const todayStr = d.toLocaleDateString('en-US');
    fs.appendFile('todayOrders.txt', '', function (err) {
    if (err) throw err;
        console.log('Saved!');
    });
    ordersPrinted = {};
    fs.readFile('todayOrders.txt', 'utf8', function(err, data) {
        if (err) throw err;
        //console.log('readdata:',data);
        var lines = data.split('\n');
        if(lines.length==0 || lines[0].trim()!==todayStr){
            fs.writeFile('todayOrders.txt', todayStr, function (err) {
                if (err) throw err;
                console.log('Cleared todayOrders.txt!');
            });
        }
        else{
            for(var i=1; i<lines.length; i++){
                ordersPrinted[lines[i].trim()]=0;
            }
        }
    });
    var todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    while(true){
        db.collection("printerOrders")
            .where("restName", "==", restName)
            .where("orderTime", ">=", todayStart)
        .get()
        .then(function(querySnapshot) {
            var appendData="";
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                if(!ordersPrinted.hasOwnProperty(doc.id)){
                    printOrder(doc.id);
                    console.log(doc.id);
                    ordersPrinted[doc.id]=0;
                    appendData+='\n'+doc.id;
                }
            });
            if(appendData!==""){
                fs.appendFile('todayOrders.txt', appendData, function (err) {
                    if (err) throw err;
                    console.log('Updated!');
                });
            }
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
        await new Promise(r => setTimeout(r, 1000));
    }
}
module.exports.print = print;
module.exports.printOrder = printOrder;
module.exports.checkServer = checkServer;
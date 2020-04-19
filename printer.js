const ThermalPrinter = require("node-thermal-printer").printer;
const Types = require("node-thermal-printer").types;

function sendCommand(printer, command){
    console.log('command:',JSON.stringify(command));
    
    if(!command)
    {
        return {result:false,msg:'Error: command is null'};
    }
    if(!command.type)
    {
        return {result:false,msg:'Error: command.type is null'};
    }
    res={};
    switch (command.type) {
        case 'set font big':
            printer.setTypeFontA();
            res = {result:true};
            break;
        case 'set font small':
            printer.setTypeFontB();
            res = {result:true};
            break;
        case 'align center':
            printer.alignCenter();
            res = {result:true};
            break;
        case 'println':
            if(command.text){
                printer.println(command.text);
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
            if(command.left) left=command.left;
            if(command.right) left=command.right;
            printer.leftRight(left, right);
            res = {result:true};
            break;
        case 'c table':
            //console.log(JSON.stringify(command));
            if(command.length){
                if(command.aligns){
                    if(command.widths){
                        if(command.data){
                            for(i=0; i<command.data.length; i++)
                            {
                                data=[];
                                for(j=0; j<command.length; j++)
                                {
                                    data.push({
                                        text:command.data[i][j],
                                        align:command.aligns[j],
                                        width:command.widths[j]
                                    })
                                };
                                //console.log(JSON.stringify(data));
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
            }
            else{
                res = {result:false,msg:'Error: c-table missing length'}; 
            }
            break;
                                                                                                                                                                   
        default:
            res = {result:false, msg:'Error: command type ['+command.type+'] was undefined.'};
    }
    return res;
}
var time = '';
var oldOrderID = '';
async function print (data) {
  var newTime = new Date().toTimeString();
  var newOrderID = data[0].orderID;
  if(oldOrderID == newOrderID)
  {
    console.log("Duplicate print declined. ID:"+newOrderID);
    return;
  }
  else
  {
    time = newTime;
    oldOrderID = newOrderID;
    console.log("Printing... Time:", time,"; ID:",newOrderID,";\n");//,JSON.stringify(data,null,"   "));

  }
  let printer = new ThermalPrinter({
    type: Types.EPSON,  // 'star' or 'epson'
    interface: process.argv[2],//'tcp://192.168.0.60',
    options: {
      timeout: 1000
    },
    width: 60,                         // Number of characters in one line - default: 48
    characterSet: 'PC437_USA',          // Character set - default: SLOVENIA
    removeSpecialCharacters: false,    // Removes special characters - default: false
    lineCharacter: "-",                // Use custom character for drawing lines - default: -
  });

  let isConnected = await printer.isPrinterConnected();
  console.log("Printer connected:", isConnected);

  //printer.alignCenter();
  //await printer.printImage('../assets/olaii-logo-black-small.png');
  line = 0;
  data.forEach(command => {
    var res={};
    if(line>0){
        //console.log('line:'+line+'; '+JSON.stringify(command));
        res = sendCommand(printer,command);
        if(!res.result)
        {
            console.log('Error line:'+line+'; '+res.result);
        }
        return;
    }
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


module.exports.print = print;

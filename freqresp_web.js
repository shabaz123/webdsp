#!/usr/bin/node

// rev 1

var app=require('http').createServer(handler);
var io=require('/usr/lib/node_modules/socket.io')(app);
var fs=require('fs');
var child=require('child_process');
var execSync = require("child_process").execSync;

var progpath='/home/pi/development/webdsp/';
var wmpath='/home/pi/development/waveminer/';
var cmdtext = 'freqresp -a 1.0 -u -m -f ';

app.listen(8081);
console.log('freqresp_web.js is running. Go to http://xx.xx.xx.xx:8081/freqresp.html');

function handler(req, res){
    console.log('url is '+req.url.substr(1));
    reqfile=req.url.substr(1);
    fs.readFile(progpath+reqfile, function(err, data){
        if(err){
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

var cfreq = 0;
var cfreqidx = 0;
var decmult = 10; // start at 10*1 = 10 Hz
var freqpoint=[1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.4, 2.7, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0];
var numfp = freqpoint.length;

io.sockets.on('connection', function(socket){
    sock_connected=1;

    socket.on('start_test', function (data) {
        console.log('emitting chart_data');
        cfreq = freqpoint[cfreqidx] * decmult;
        prog=child.exec(wmpath+cmdtext+cfreq, function (error, data, stderr) {
	          value=data.toString();
            //data = execSync(wmpath+'freqresp -a 1.0 -p -m -f '+i)
            myData = [cfreq, parseFloat(value)];
            console.log('emitting '+myData[0]+' '+myData[1]);
	  		    socket.emit('chart_data', myData);
            cfreqidx = cfreqidx + 1;
		    });
    });

    socket.on('continue_test', function (data) {
        if ((decmult >= 10000) && (freqpoint[cfreqidx] > 2.0)) {
            socket.emit('test_conpleted');
            cfreqidx = 0;
            decmult = 10;
        } else {
            console.log('continue emitting chart_data');
            cfreq = freqpoint[cfreqidx] * decmult;
            prog=child.exec(wmpath+cmdtext+cfreq, function (error, data, stderr) {
	            value=data.toString();
                //data = execSync(wmpath+'freqresp -a 1.0 -p -m -f '+i)
                myData = [cfreq, parseFloat(value)];
                console.log('emitting '+myData[0]+' '+myData[1]);
	  		    socket.emit('chart_data', myData);
                cfreqidx = cfreqidx + 1;
                if (cfreqidx >= numfp) {
                    cfreqidx = 0;
                    decmult = decmult * 10;
                }
		    });
        }
    });


});


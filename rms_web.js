#!/usr/bin/node

// rev 1

var app=require('http').createServer(handler);
var io=require('/usr/lib/node_modules/socket.io')(app);
var fs=require('fs');
var child=require('child_process');
var execSync = require("child_process").execSync;

var progpath=__dirname+'/';
var wmpath='/home/pi/development/waveminer/';
var cmdftext = 'rms ';
var cmdtext = 'rms -v -m';

var use_dummy = 0;

app.listen(8081);
console.log('rms_web.js is running. Go to http://xx.xx.xx.xx:8081/rms.html');

if (process.argv.length > 2) {
    if (process.argv[2] == "dummy") {
        console.log("using dummy data");
        use_dummy=1;
    }
}

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

io.sockets.on('connection', function(socket){
    sock_connected=1;
    console.log('socket connected');
    socket.emit('ready');


    socket.on('read', function (data) {
        //console.log('read measurement');
        if (use_dummy==0) {
            prog=child.exec(wmpath+cmdtext, function (error, data, stderr) {
                //console.log('emitting '+data);
                socket.emit('result', data);
            });
        } else {
            // dummy data
            var dnum = 900+(Math.random()/10);
            socket.emit('result', dnum.toFixed(2));
        }
    });

    socket.on('band', function (data) {
        console.log('set band');
        if (use_dummy==0) {
            var allcmd = cmdftext+'-h '+data[0]+' -l '+data[1];
            prog=child.exec(wmpath+allcmd, function (error, data, stderr) {
                console.log("command is "+allcmd);
                console.log('emitting band status');
                socket.emit('bandstatus', 'ok');
            });
        } else {
            // dummy data mode
            console.log('emitting band status');
            socket.emit('bandstatus', 'ok');
        }
    });
    
});


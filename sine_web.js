#!/usr/bin/node

// rev 1

var app=require('http').createServer(handler);
var io=require('/usr/lib/node_modules/socket.io')(app);
var fs=require('fs');
var child=require('child_process');
var execSync = require("child_process").execSync;

var progpath=__dirname+'/';
var wmpath='/home/pi/development/waveminer/';
var cmdtext = 'dspgen2 -';

var use_dummy = 0;

app.listen(8081);
console.log('sine_web.js is running. Go to http://xx.xx.xx.xx:8081/sine.html');

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


    socket.on('sconfig', function (data) {
        console.log('set config');
        if (use_dummy==0) {
            var allcmd = cmdtext+data[0]+' '+data[1];
            prog=child.exec(wmpath+allcmd, function (error, data, stderr) {
                console.log("command is "+allcmd);
                console.log('emitting config status');
                var stat_txt = allcmd;
                socket.emit('configstatus', stat_txt);
            });
        } else {
            // dummy data mode
            console.log('emitting config status');
            socket.emit('configstatus', 'ok');
        }
    });
    
});


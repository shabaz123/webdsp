#!/usr/bin/node

// rev 1

var app=require('http').createServer(handler);
var io=require('/usr/lib/node_modules/socket.io')(app);
var fs=require('fs');
var child=require('child_process');
var execSync = require("child_process").execSync;

var progpath=__dirname+'/';
var wmpath='/home/pi/development/waveminer/';
var cmdtext = 'freqresp -a 1.0 -u -m -f ';

var use_dummy=0; 
var dummy_x = [10,12,14,16,18,20,24,27,30,35,40,45,50,60,70,80,90,100,120,140,160,180,200,240,270,300,350,400,450,500,600,700,800,900,1000,1200,1400,1600,1800,2000,2400,2700,3000,3500,4000,4500,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000];
var dummy_y = [-0.198883,0.261553,0.71278,0.868271,1.10064,1.260572,1.499121,1.552635,1.668832,1.740032,1.825817,1.847452,1.881889,1.909584,1.933214,1.931055,1.934417,1.946674,1.942369,1.940709,1.945616,1.941839,1.942722,1.933462,1.931905,1.932931,1.929072,1.92801,1.92801,1.926415,1.922799,1.92138,1.918256,1.917156,1.915983,1.911967,1.906631,1.901465,1.896401,1.890831,1.878629,1.869591,1.861001,1.842397,1.819865,1.796083,1.772171,1.71499,1.650253,1.578782,1.498574,1.416777,1.232265,1.032038,0.817606,0.587116,0.332056];

app.listen(8081);
console.log('freqresp_web.js is running. Go to http://xx.xx.xx.xx:8081/freqresp.html');

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

var cfreq = 0;
var cfreqidx = 0;
var decmult = 10; // start at 10*1 = 10 Hz
var freqpoint=[1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.4, 2.7, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0];
var numfp = freqpoint.length;

io.sockets.on('connection', function(socket){
    sock_connected=1;

    socket.on('start_test', function (data) {
        console.log('emitting chart_data');
        cfreqidx = 0;
        decmult = 10;
        cfreq = freqpoint[cfreqidx] * decmult;
        if (use_dummy==0) {
            prog=child.exec(wmpath+cmdtext+cfreq, function (error, data, stderr) {
	            value=data.toString();
                //data = execSync(wmpath+'freqresp -a 1.0 -p -m -f '+i)
                myData = [cfreq, parseFloat(value)];
                console.log('emitting '+myData[0]+' '+myData[1]);
	  		    socket.emit('chart_data', myData);
                cfreqidx = cfreqidx + 1;
		    });
        } else {
            // use dummy data
            myData = [dummy_x[cfreqidx], dummy_y[cfreqidx]];
            console.log('emitting dummy '+myData[0]+' '+myData[1]);
            socket.emit('chart_data', myData);
            cfreqidx = cfreqidx + 1;
        }
    });

    socket.on('continue_test', function (data) {
        if ((decmult >= 10000) && (freqpoint[cfreqidx] > 2.0)) {
            socket.emit('data_complete');
            cfreqidx = 0;
            decmult = 10;
        } else {
            console.log('continue emitting chart_data');
            cfreq = freqpoint[cfreqidx] * decmult;
            if (use_dummy==0) {
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
            } else {
                // use dummy data
                var dummyidx = dummy_x.findIndex((element) => element == cfreq);
                myData = [dummy_x[dummyidx], dummy_y[dummyidx]+(Math.random()/10)];
                console.log('emitting dummy '+myData[0]+' '+myData[1]);
                socket.emit('chart_data', myData);
                cfreqidx = cfreqidx + 1;
                if (cfreqidx >= numfp) {
                    cfreqidx = 0;
                    decmult = decmult * 10;
                }
            }
        }
    });


});


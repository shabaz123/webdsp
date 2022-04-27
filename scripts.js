// functions

var socket; // used for socket.io

var trace1 = { 
    x: [],
    y:[],
    type: 'scatter'
};

var data = [trace1];

var layout = {
    xaxis: {
        title: 'Frequency (Hz)',
        type: 'log',
        autorange: true,
    },
    yaxis: {
        title: 'Amplitude (dB)',
        autorange: true
    },
    title: 'Frequency Response'
};

var frchart_created=0;


$(document).ready(function() {
	
});

jQuery(document).ready(function() {

	
	$("#id_status").html('Connecting to Instrument..');

	
	$("#id_start").click(function(e){
        do_start();
	});
	$("#id_stop").click(function(e){
        do_stop();
	});

    socket = io.connect();

    socket.on('chart_data', function(data) {
        $("#id_status").html(data[1].toFixed(2) + ' dB at '+data[0]+' Hz');
        Plotly.extendTraces('frchart_div', {x: [[data[0]]], y: [[data[1]]]}, [0]);
        socket.emit('continue_test');   
    });
    
})

function do_start(){
    $("#id_status").html('Test Started ');
    if (frchart_created==0) {
        Plotly.newPlot('frchart_div', data, layout);
        frchart_created = 1;
    }
    socket.emit('start_test');
};

function do_stop(){
    $("#id_status").html('Test Stopped ');
};


// functions

var socket; // used for socket.io

// trace1 contains the actual data points
var trace1;
// data contains all trace arrays
var data;
// norm1 contains a copy of trace1 after normalization
var norm1;
var norm_saved = 0;
var idx;

// execution states
const IDLE = 0;
const DO_NORM = 1;
const DO_TEST = 2;

// button states
const BTN_START_TEST = 0;
const BTN_STOP_TEST = 1;
const BTN_RUN_NORM = 0;
const BTN_UN_NORM = 1;
const BTN_NORM_IN_PROGRESS = 2;

var state = IDLE;
var btn_test_state = BTN_START_TEST;
var btn_norm_state = BTN_RUN_NORM;
var abort_test = 0;

var layout = {
    xaxis: {
        title: 'Frequency (Hz)',
        type: 'log',
        autorange: false,
        range: [1, 5] /* 10^1 (10 Hz) to 10^5 (100 kHz) */
    },
    yaxis: {
        title: 'Amplitude (dB)',
        autorange: true
    },
    title: 'Frequency Response',
    line: {
        color: 'rgb(0,0,0)' /* black */
    }
};

var norm_trace1_update = {
    line: {
        color: 'rgb(210,210,210)' /* light gray */
    }
};

var norm_data_update = [norm_trace1_update];


$(document).ready(function() {
	
});

jQuery(document).ready(function() {

    Plotly.newPlot('frchart_div', data, layout);
	
	$("#id_status").html('Status: Ready');
	
	$("#id_test").click(function(e){
        if (btn_test_state==BTN_START_TEST) {
            do_start();
        } else {
            do_stop();
        }
	});
    $("#id_norm").click(function(e){
        if (btn_norm_state==BTN_RUN_NORM) {
            do_norm();
        } else if (btn_norm_state==BTN_UN_NORM){
            do_unnorm();
        } else {
            // do nothing, normalization is in progress
        }
	});

    socket = io.connect();

    socket.on('chart_data', function(d) {
        xdatapoint = d[0];
        ydatapoint = d[1];
        if (state == DO_TEST) {
            if (norm_saved) {
                idx = norm1.x.findIndex((element) => element == xdatapoint);
                if (idx>=0) {
                    ydatapoint = ydatapoint - norm1.y[idx];
                } else {
                    console.log('error, normalization indices do not match the test data!');
                }
            }
        }
        $("#id_status").html(ydatapoint.toFixed(2) + ' dB at '+xdatapoint+' Hz');
        Plotly.extendTraces('frchart_div', {x: [[xdatapoint]], y: [[ydatapoint]]}, [0]);
        if (abort_test==1) { // don't request any more data points, reset the button
            $("#id_status").html('Test aborted');
            abort_test=0;
        } else { // request the next data point
            socket.emit('continue_test');   
        }
    });

    socket.on('data_complete', function(d) {
        if (state==DO_NORM) {
            // normalization completed
            norm1 = trace1; // store the normalization values
            norm_saved = 1;
            $("#id_status").html('Normalization Saved');
            btn_norm_state = BTN_UN_NORM;
            $("#id_norm").html("Undo Normalization").attr("disabled", false);
        } else if (state==DO_TEST) {
            // test completed
            if (norm_saved==1) {
                $("#id_status").html('Test complete (with normalization applied)');
            } else {
                $("#id_status").html('Test complete (no normalization applied)');
            }
            $("#id_test").html("Start Test").removeClass('btn-danger').addClass('btn-success');
            transfer_dataset(trace1);
            btn_test_state=BTN_START_TEST;
        }
        state = IDLE;
    });
    
})

// download function from https://stackoverflow.com/questions/13405129/create-and-save-a-file-with-javascript
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function transfer_dataset(tracedata) {
    var filetext = "";
    var i;
    for (i=0; i<tracedata.x.length; i++) {
        filetext = filetext.concat(tracedata.x[i]+','+tracedata.y[i]+'\n');
    }
    download(filetext, 'freq_resp.csv', 'text/plain');
}

// called when running normalization or test
function start_data() {
    // create an empty set of data points
    trace1 = { 
        x: [],
        y:[],
        type: 'scatter'
    };
    data = [trace1];

    Plotly.react('frchart_div', data, layout); // erases any existing chart
    if (state==DO_NORM) {
        // switch trace color if we are doing normalization:
        Plotly.restyle('frchart_div', norm_trace1_update);
    }
    socket.emit('start_test');
}

// start the test
function do_start(){
    $("#id_status").html('Running Test ');
    abort_test = 0;
    state = DO_TEST;
    btn_test_state = BTN_STOP_TEST;
    $("#id_test").html("Stop Test").removeClass('btn-success').addClass('btn-danger');
    start_data(); // kick off the data gathering and chart plotting for the test
};

function do_stop(){
    $("#id_status").html('Test Stopped ');
    abort_test = 1;
    btn_test_state = BTN_START_TEST;
    $("#id_test").html("Start Test").removeClass('btn-danger').addClass('btn-success');
};

// start the normalization
function do_norm(){
    $("#id_status").html('Running Normalization ');
    state = DO_NORM;
    norm_saved = 0; // forget any previous normalization
    btn_norm_state = BTN_NORM_IN_PROGRESS;
    $("#id_norm").html("Running Normalization..").removeClass('btn-success').addClass('btn-secondary').attr("disabled", true);
    start_data(); // kick off the data gathering and chart plotting for the normalization
};

function do_unnorm(){
    $("#id_status").html('Normalization Erased ');
    norm_saved = 0; // forget any previous normalization
    btn_norm_state = BTN_RUN_NORM;
    $("#id_norm").html("Run Normalize").removeClass('btn-secondary').addClass('btn-success');
};


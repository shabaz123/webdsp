// functions

var socket; // used for socket.io

// high pass and low pass settings
var hpval=0;
var lpval=0;

var do_read=1;
var do_band=0; // when set to 1, a band change request needs to be sent

$(document).ready(function() {
});

jQuery(document).ready(function() {

	$("#id_status").html('Status: Ready');
    $("#fromBypass").prop("checked", true);
    $("#toBypass").prop("checked", true);
    


    // frequency button events
    $('#fromFreq_radio_box').change(function(){
        hpval = $("input[name='fromFreqOptions']:checked").val();
        set_band();
    });
    $('#toFreq_radio_box').change(function(){
        lpval = $("input[name='toFreqOptions']:checked").val();
        set_band();
    });
	
    socket = io.connect();

    socket.on('ready', function(d) {
        socket.emit('read'); // request first measurement 
        set_band();
    });

    socket.on('result', function(d) {
        $("#id_meter1_value").html(d);
        if (do_read==1) {
            socket.emit('read'); // request next measurements
        }
        if (do_band==1) {
            myData = [hpval, lpval];
            socket.emit('band', myData);
            do_band=0;
        }
    });

    socket.on('bandstatus', function(d) {
        $("#id_status").html('Status: Band Set OK');
        do_read=1;
        socket.emit('read'); // resume next measurements   
    });
})

function set_band() {
    do_read=0; // pause reading measurements
    do_band=1; // queue up band change request
}

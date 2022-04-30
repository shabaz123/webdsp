// functions

var socket; // used for socket.io

var connected=0;

$(document).ready(function() {
});

jQuery(document).ready(function() {

	$("#id_status").html('Status: Waiting to Connect..');

    // set up sliders to display correctly
    $("#f1").slider({
        tooltip: 'always'
    });
    $("#f2").slider({
        tooltip: 'always'
    });
    $("#a1").slider({
        precision: 3,
        tooltip: 'always'
    });
    $("#a2").slider({
        precision: 3,
        tooltip: 'always'
    });
    $("#ph").slider({
        tooltip: 'always'
    });

    // set up initial textbox contents
    $("#typef1").val( $("#f1").val() );
    $("#typea1").val( $("#a1").val() );
    $("#typef2").val( $("#f2").val() );
    $("#typea2").val( $("#a2").val() );

    // slider events
    $("#f1").bind('slide', function(slideEvt) {
        v = $("#f1").val(); // get slider value
        $("#typef1").val(v); // update value in box
        //do_freq(1, $("#f1").val()  );
    });
    $("#f2").bind('slide', function(slideEvt) {
        v = $("#f2").val(); // get slider value
        $("#typef2").val(v); // update value in box
        //do_freq(1, $("#f1").val()  );
    });
    $("#a1").bind('slide', function(slideEvt) {
        v = $("#a1").val(); // get slider value
        $("#typea1").val(v); // update value in box
        //do_freq(1, $("#f1").val()  );
    });
    $("#a2").bind('slide', function(slideEvt) {
        v = $("#a2").val(); // get slider value
        $("#typea2").val(v); // update value in box
        //do_freq(1, $("#f1").val()  );
    });

    // on mouseup after adjusting sliders, we call the set functions
    $("#f1").bind('slideStop', function(val) {setfreq(1, val.value)});
    $("#f2").bind('slideStop', function(val) {setfreq(2, val.value)});
    $("#a1").bind('slideStop', function(val) {setamp(1, val.value)});
    $("#a2").bind('slideStop', function(val) {setamp(2, val.value)});
    $("#ph").bind('slideStop', function(val) {setphase(2, val.value)}); // we only control one phase (phase 2)

    // textbox events, we also call the set functions
    $("#typef1").change(function(){
        v = $("#typef1").val(); // get box contents
        $('#f1').slider('setValue', v);
        setfreq(1, v);
    });
    $("#typef2").change(function(){
        v = $("#typef2").val(); // get box contents
        $('#f2').slider('setValue', v);
        setfreq(2, v);
    });
    $("#typea1").change(function(){
        v = $("#typea1").val(); // get box contents
        $('#a1').slider('setValue', v);
        setamp(1, v);
    });
    $("#typea2").change(function(){
        v = $("#typea2").val(); // get box contents
        $('#a2').slider('setValue', v);
        setamp(2, v);
    });

    //var cval =  parseInt($("#f1").val())
	
    socket = io.connect();

    socket.on('ready', function(d) {
        connected=1;
        // push the initial config values to the server
        setfreq(1, $("#f1").val());
        setfreq(2, $("#f2").val());
        setamp(1, $("#a1").val());
        setamp(2, $("#a2").val());
        setphase(2, $("#ph").val());
    });

    // functions to request sine param updates
    function setfreq(ch, fv) {
        console.log("setfreq "+ch+" "+fv);
        var msg = ["f"+ch, fv];
        socket.emit('sconfig', msg);
    }
    function setamp(ch, av) {
        console.log("setamp "+ch+" "+av);
        var msg = ["a"+ch, av];
        socket.emit('sconfig', msg);
    }
    function setphase(ch, pv) {
        console.log("setphase "+pv);
        var msg = ["p"+ch, pv];
        socket.emit('sconfig', msg);
    }


    socket.on('configstatus', function(d) {
        // configuration has been done by the server.
        $("#id_status").html('Status: executed '+d); 
    });

    socket.on('ready', function(d) {
        $("#id_status").html('Status: OK');  
    });
})

function set_band() {
    do_read=0; // pause reading measurements
    do_band=1; // queue up band change request
}



    

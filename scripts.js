// functions

var socket; // used for socket.io


var gidx=0; // graph data point index
var frchart_handle;
var frchart_created=0;
var data_frchart = [0];
var j;
var xstart = 1.0;
var xstop = 20000.0;
var xinc;
var xcur = xstart;
var oldypoint;
var oldxpoint;
var idx;
var logmul = [1, 2, 3, 4, 5, 6, 7, 8, 9];
for (j=0; j<138; j++) {
    data_frchart.push(0);
}

// chart settings
var settings_frchart = [
    "2", /*max y value, e.g. "0.1" for 0.1W */
    "dB",  /* suffix, e.g. "W" */
	"0.5",  /* y grid steps, e.g. "0.01" for 0.01W */
	(xstop - xstart)/20, /* x grid steps e.g. "0.1" for 0.1 volts */
	"0.0", /* extra y factor, e.g. "0.2" for 20% */
	"1", /* steps for y labels e.g. "0.02" for 0.02W */
	"Frequency Response", /* graph title */
	"chartPath", /* line and fill style (css name)*/
	"Amplitude", /* y axis label */
	"Frequency", /* x axis label */
	"0", /* direction of x axis, "0"=normal, "1"=reverse */
	"Hz", /* x axis unit */
	xstart, /* xmin */
	xstop, /* xmax */
	(xstop - xstart)/10, /* steps for x labels e.g. "1" for 1 volt */
    "-10", /* min y value, e.g. "0" */
];



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
        $("#id_status").html('got chart_data '+data[0]+' '+data[1]);
        add_point(data[0], data[1]);
        socket.emit('continue_test');
        //add_point(500,3);
    
    });
    
})

function do_start(){
    $("#id_status").html('Test Started ');
    socket.emit('start_test');
    gidx = 0;
    idx = 0;
    if (frchart_created==0) {
        frchart_handle = new BasicChart('#frchart_div', data_frchart, settings_frchart);
        frchart_created = 1;
    }
};

function do_stop(){
    $("#id_status").html('Test Stopped ');
};

// based on http://jsfiddle.net/npUhG/7/  
function BasicChart(container, data, settings) {
    var i;
    var xidx=0.0;
    var m=0;
    var thisClass = this;
    this.data = data;
    this.data.unshift(0);
    this.data.push(0);
    this.settings = settings == undefined ? [15, '', 1, 10, 0.2] : settings;
    this.container = container;
    this.n = data.length;
    this.duration = 600;
    this.percentExtra = parseFloat(this.settings[4]);
    this.width = $(container).width();
    this.height = $(container).height();
    //$("#id_status").html('width is ' + this.width);
  
    this.graph = {
      ymin: parseFloat(this.settings[15]),
      ymax: parseFloat(this.settings[0] * (1 + this.percentExtra)), 
      threshold: parseFloat(this.settings[0]),
      unit: this.settings[1],
      ygrid: parseFloat(this.settings[2]),
      xgrid: parseFloat(this.settings[3]),
      ylabinc: parseFloat(this.settings[5]),
      title: this.settings[6],
      style: this.settings[7],
      ytitle: this.settings[8],
      xtitle: this.settings[9],
      dir: parseInt(this.settings[10]),
      xunit: this.settings[11],
      xmin: parseFloat(this.settings[12]),
      xmax: parseFloat(this.settings[13]),
      xlabinc: parseFloat(this.settings[14]),
      marginLeft: 70,
      marginRight: 20,
      marginBottom: 60,
      marginTop: 40,
      xlogMode: 1,
    }
  
    this.chartwidth = this.width - this.graph.marginLeft - this.graph.marginRight;
    this.chartheight = this.height - this.graph.marginBottom - this.graph.marginTop;
    
    // set X and Y scalers
    this.x = d3.scale.linear()
        .domain([this.graph.xmin, this.graph.xmax])
        .range([this.graph.marginLeft, this.graph.marginLeft + this.chartwidth]);
    this.y = d3.scale.linear()
        .domain([this.graph.ymin, this.graph.ymax])
        .range([this.chartheight + this.graph.marginTop, this.graph.marginTop]);
 
    if (this.graph.xlogMode==1) {
        this.x = d3.scale.log()
            .domain([this.graph.xmin, this.graph.xmax])
            .range([this.graph.marginLeft, this.graph.marginLeft + this.chartwidth]);
    }
        
    // Define the line that goes over the graph
    this.line = d3.svg.line()
    .x(function (d, i) {
        return thisClass.x(i);
    })
    .y(function (d, i) {
        return thisClass.y(d);
    });
  
    // create the SVG inside the container
    this.svg = d3.select(container).append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height);
  
    // this part clips the TOP
    this.svg.append("defs")
        .append("clipPath")
        .attr("id", "clipTOP")
        .append("rect")
        .attr("x", 0)
        .attr("y", this.y(this.graph.threshold))
        .attr("width", this.width)
        .attr("height", this.y(0));
  
    // this part clips the BOTTOM
    this.svg.append("defs")
        .append("clipPath")
        .attr("id", "clipBOTTOM")
        .append("rect")
        .attr("x", 0)
        .attr("y", this.y(this.graph.ymax))
        .attr("width", this.width)
        .attr("height", this.y(this.graph.threshold));
  
    // create the path inside the SVG
/*
    this.svg.append("svg:path")
        .attr("d", this.line(data))
        .attr("class", this.graph.style);
*/
    // create the path inside the SVG (top red part)
/*
    this.svg.append("svg:path")
        .attr("d", this.line(data))
        .attr("class", this.graph.style+" redFill redLine");
*/
    // draw the line to the path (both get the same data)
/*
    this.svg.selectAll("."+this.graph.style)
        .data([this.data])
        .attr("d", this.line);
*/
    //Define the looks and clips of both of them
/*
    this.svg.selectAll("."+this.graph.style+".redFill").attr("clip-path", "url(#clipBOTTOM)");
    this.svg.selectAll("."+this.graph.style+":not(.redFill)").attr("clip-path", "url(#clipTOP)");
*/ 
    
    if (this.percentExtra>0) {
        // add the threshold line (dashed)
        this.svg.append('line')
            .attr("x1", this.x(this.graph.xmin))
            .attr("y1", this.y(this.graph.threshold))
            .attr("x2", this.x(this.graph.xmax))
            .attr("y2", this.y(this.graph.threshold))
            .attr("class", "line dashed red");
    }
    
    // add the y grid lines
    /*
    for (i=this.graph.ygrid; i<(this.graph.threshold+(this.percentExtra*this.graph.threshold)); i=i+this.graph.ygrid) {
        this.svg.append('line')
            .attr("x1", this.graph.marginLeft)
            .attr("y1", this.y(i))
            .attr("x2", this.width - this.graph.marginLeft - this.graph.marginRight)
            .attr("y2", this.y(i))
            .attr("class", "thinline black");    
    } */

    //$("#id_status").html('ymin is ' + this.graph.ymin);
    for (i=this.graph.ymin/*this.graph.ygrid*/; i<(this.graph.threshold+(this.percentExtra*this.graph.threshold)); i=i+this.graph.ygrid) {
        this.svg.append('line')
            .attr("x1", this.x(this.graph.xmin)) 
            .attr("y1", this.y(i))
            .attr("x2", this.x(this.graph.xmax))
            .attr("y2", this.y(i))
            .attr("class", "thinline black");    
        
    }
    
    // add the x grid lines and x axis numbers
    xidx=this.graph.xlabinc-this.graph.xgrid;


    if (this.graph.xlogMode==0) {
        for (i=this.graph.xmin; i<=this.graph.xmax; i=i+this.graph.xgrid) {
            xidx=xidx+this.graph.xgrid;    
            if (xidx>=this.graph.xlabinc)
            {
                xidx=0;
            
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymax))
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin))
                    .attr("class", "thickline black");
                
                // add the x-axis yellow ticks
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymin)+1)
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin)+3)
                    .attr("class", "yellowLine");

                this.svg.append("svg:text")
                    .attr("dy", this.y(this.graph.ymin)+20)
                    .attr("dx", this.x(i)-4)
                    .attr('height', 100)
                    .attr('class', 'graphText')
                    .text(Math.round(i*1000)/1000 + this.graph.xunit);
            } else {
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymax))
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin))
                    .attr("class", "thinline black"); 
            }
        }
    } else { 
        // log mode
        var lidx = 0;
        var decmul = 1;
        i=this.graph.xmin;
        while(i<=this.graph.xmax) {
            if (lidx==0) {
                // do a thick line
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymax))
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin))
                    .attr("class", "thickline black");
                // add the x-axis yellow ticks
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymin)+1)
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin)+3)
                    .attr("class", "yellowLine");
                this.svg.append("svg:text")
                    .attr("dy", this.y(this.graph.ymin)+20)
                    .attr("dx", this.x(i)-4)
                    .attr('height', 100)
                    .attr('class', 'graphText')
                    .text(Math.round(i*1000)/1000 + this.graph.xunit);
            } else {
                // do a thin line
                this.svg.append('line')
                    .attr("x1", this.x(i))
                    .attr("y1", this.y(this.graph.ymax))
                    .attr("x2", this.x(i))
                    .attr("y2", this.y(this.graph.ymin))
                    .attr("class", "thinline black"); 
            }

            lidx++;
            if (lidx>=logmul.length) {
                lidx = 0;
                decmul = decmul * 10;
            }
            i = this.graph.xmin * decmul * logmul[lidx];
        }
    }
    //add the graph title
    this.svg.append("svg:text")
        .attr("dy", 30)
        .attr("dx", 300)
        .attr('height', 100)
        .attr('class', 'graphTitle')
        .text(this.graph.title);
  
    //add the y-axis title
    this.svg.append("svg:text")
        .attr("dy", this.x(this.graph.xmin)-50)
        .attr("dx", 0-((this.chartheight/2)+this.graph.marginTop))
        .attr('transform', 'rotate(270)')
        .attr('height', 100)
        .attr('class', 'yTitle')
        .text(this.graph.ytitle);
      
    //add the x-axis title
    this.svg.append("svg:text")
        .attr("dy", this.y(this.graph.ymin)+50)
        .attr("dx", (this.chartwidth/2)+this.graph.marginLeft)
        .attr('height', 100)
        .attr('class', 'xTitle')
        .text(this.graph.xtitle);
      
    // add the top text
    /*
    this.svg.append("svg:text")
        .attr("dy", 12)
        .attr("dx", 0)
        .attr('height', 100)
        .attr('class', 'graphText')
        .text(this.graph.ymax + this.graph.unit);
    */
    // add all the y labels
    for (i=this.graph.ymin; i<=this.graph.ymax; i=i+this.graph.ylabinc) {
        if (i>=this.graph.ymin) {
            this.svg.append('line')
                .attr("x1", this.x(this.graph.xmin))
                .attr("y1", this.y(i))
                .attr("x2", this.x(this.graph.xmax))
                .attr("y2", this.y(i))
                .attr("class", "thickline black");
            
            // yellow ticks on the vertical axis:
            this.svg.append('line')
                .attr("x1", this.x(this.graph.xmin)-1) 
                .attr("y1", this.y(i))
                .attr("x2", this.x(this.graph.xmin)-3)
                .attr("y2", this.y(i))
                .attr("class", "yellowLine");  

            if (i==1234 /*this.graph.ymin*/) {
                this.svg.append("svg:text")
                    .attr("dy", this.y(i)+0)
                    .attr("dx", 0)
                    .attr('height', 100)
                    .attr('class', 'graphText')
                    .text(Math.round(i*100000)/100000 + this.graph.unit);
            } else {
                this.svg.append("svg:text")
                    .attr("dy", this.y(i)+4)
                    .attr("dx", this.x(this.graph.xmin)-40)
                    .attr('height', 100)
                    .attr('class', 'graphText')
                    .text(Math.round(i*100000)/100000 + this.graph.unit);
            }
        }
    }
  
    if (this.percentExtra>0) {
        // add the threshold text
        this.svg.append("svg:text")
            .attr("dy", this.y(this.graph.threshold) + 4)
            .attr("dx", 0)
            .attr('height', 100)
            .attr('class', 'graphText red')
            .text(this.graph.threshold + this.graph.unit);
    }
}

BasicChart.prototype.push = function (new_data_point) {
    this.data[gidx+50]=new_data_point;
    // this is just so it can be used on the updating function
    var thisClass = this;
    gidx++;
}


function add_point(xpoint, ypoint) {
    var i;
    //var ypoint;
    //var xpoint;
    

    if (idx==0) {
        oldxpoint = xpoint;
    } else {
        //$("#id_status").html('append, xpoint is '+xpoint);
        frchart_handle.svg.append('line')
            .attr("x1", frchart_handle.x(oldxpoint))
            .attr("y1", frchart_handle.y(oldypoint))
            .attr("x2", frchart_handle.x(xpoint))
            .attr("y2", frchart_handle.y(ypoint))
            .attr("class", "orangeLine");
    }
    oldypoint = ypoint;
    oldxpoint = xpoint;
    idx++;

    if (xcur >= xstop) {
        $("#id_status").html('Test Complete');
    } else if (idx >= -1) {
        xcur += xinc;
    }
    
}




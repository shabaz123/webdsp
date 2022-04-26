
Wave Miner WebDSP
=================

Introduction
------------
webdsp contains just a single application today, called **freqresp_web.js**. When you run it, you can got to a browser and navigate to:
**http://xx.xx.xx.xx:8081/freqresp.html**

(replace **xx.xx.xx.xx** with the correct IP address of course). 

The freqresp_web.js app will run commands that control and query a DSP board, and will then send the results to the browser page, for displaying in a chart.

Notes
-----
webdsp was tested on a Raspberry Pi 4. Some paths are hard-coded for the pi user. You will need to edit the code to modify the paths, if a different user account is used. It is suggested to use the pi user account (create it if it doesn't exist) and then no paths need changing.

Prerequisites
-------------
webdsp requires **waveminer** to be installed, since webdsp runs executables from waveminer. Follow the instructions at the waveminer GitHub page to install it.

webdsp also requires **node.js** and **socket.io** to be available. To install these, type:
    sudo apt-get update
    curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash –
    sudo apt-get install -y nodejs
    sudo npm install -g socket.io

Installing webdsp
-----------------
To install, type:
    mkdir -p ~/development
    cd ~/development
    git clone https://github.com/shabaz123/webdsp.git
    chmod 755 webdsp/*_web.js

Running the code
----------------
To run the app, type:

    cd ~/development/webdsp
    ./freqresp_web.js
  
 Now you can go to **http://xx.xx.xx.xx:8081/freqresp.html**
 

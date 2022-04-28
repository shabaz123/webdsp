
Wave Miner WebDSP
=================

Introduction
------------
webdsp contains just a single application today, called **freqresp_web.js**. When you run it, you can go to a browser and navigate to:
**http://xx.xx.xx.xx:8081/freqresp.html**

(replace **xx.xx.xx.xx** with the correct IP address of course). 

The freqresp_web.js app will run commands that control and query a DSP board, and will then send the results to the browser page, for displaying in a chart.

Notes
-----
webdsp can be run with the Wave Miner hardware card, or it can be run in a dummy data mode. If you're using the Wave Miner hardware then webdsp needs to be installed on the Raspberry Pi that the hardware card is connected to. If you're using the dummy mode then you can install webdsp on any Linux box using any user account.

webdsp with the Wave Miner card was tested on a Raspberry Pi 4. Some paths are hard-coded for the pi user account if you're using the Wave Miner card. You will need to edit the code to modify the paths, if a different user account is used on the Pi. It is suggested to use the pi user account (create it if it doesn't exist) and then no paths need changing.

Prerequisites
-------------
webdsp with the Wave Miner card needs **waveminer** to be installed, since webdsp runs executables from waveminer. Follow the instructions at the waveminer GitHub page to install it.

If you do not have a Wave Miner card attached to the Pi or any other Linux box, then you don't need to install the waveminer software, and you can run webdsp in a dummy mode.

In either mode, webdsp requires **node.js** and **socket.io** to be available. To install these, type:

    sudo apt-get update
    curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash -
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
To run the app with the Wave Miner card, type:

    cd ~/development/webdsp
    ./freqresp_web.js
  
 Now you can go to **http://xx.xx.xx.xx:8081/freqresp.html**
 
 If you don't have a Wave Miner card then you can run webdsp in a dummy mode by typing:
 
    cd ~/development/webdsp
    ./freqresp_web.js dummy
    
 

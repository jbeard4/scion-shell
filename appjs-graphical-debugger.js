var fs = require('fs');

function openGraphicalDebugWindow(pathToDoc,readyCb){

    // load appjs
    var appjs = require('appjs');

    // serve static files from a directory
    appjs.serveFilesFrom(__dirname + '/content');

    appjs.router.get('/scxml', function(request, response, next){
        var s = fs.readFileSync(pathToDoc,'utf8');
        response.writeHead(200,{'Content-Type':'application/xml'});
        response.end(s);
    });

    appjs.router.get('/ready', function(request, response, next){
        response.writeHead(200,{'Content-Type':'text/plain'});
        response.end('OK');
        
        readyCb(window);    //now we are really ready
    });

    // create a window
    var window = appjs.createWindow({
        width: 640,
        height: 460,
        alpha: false
    });

    // prepare the window when first created
    window.on('create', function(){
        //console.log("Window Created");
        // window.frame controls the desktop window
        window.frame.show().center();
    });

    // the window is ready when the DOM is loaded
    window.on('ready', function(){
        //console.log("Window Ready");
    });

    // cleanup code when window is closed
    window.on('close', function(){
        //console.log("Window Closed");
    });
}

module.exports = openGraphicalDebugWindow;

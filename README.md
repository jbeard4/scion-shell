scion-shell provides a simple shell environment for the SCION SCXML interpreter. It accepts SCXML events via stdin, and thus can be used to integrate SCXML with shell programming.

scion-shell accepts a single argument which is a path to an SCXML file. It instantiates an SCXML interpreter from this SCXML file, and then accepts events via stdin.  

When invoking from a tty, stdin is the shell, so it can work as a simple SCXML interpreter shell. 

Because scion-shell accepts events via stdin, scion-shell can accept events over the network by piping from netcat.

    netcat -l 8000 |  node scion-shell.js node_modules/scion/test/scxml-test-framework/test/basic/basic1.scxml

Events can then be sent in using netcat:

    netcat localhost 8000


scion-shell can also be used for demonstration purposes, in two ways. First, scion-shell can print state ids on state entry and exit. Second, scion-shell can start an HTTP server on a port which serves a graphical representation of the SCXML document, which is animated via websockets in response to input events. 

<hr>

    Usage: scion-shell [options] path/to/file.scxml 

    Options:

    event-format ["json" | "string" | "auto"]

        If "json", expects input to be formatted as JSON.

        If "string", expects input to simply be a string, which is the event name. 
            It is not possible to pass in event data using this option.

        If "auto", the interpreter will attempt to parse the input as JSON. If that fails, input will be used as an event name.
            This is the default option.

    event-delimiter <string>

        This is the string which serves as a delimiter between events. By default it is the newline character.

    graphical-trace <port>

        Accepts port number as an argument. Starts an HTTP and WebSocket server on the given port. 
        The client will graphically render the SCXML file, and animate the rendering in response to state entry and exit actions.

    log-state-entry 

        If set to true, the interpreter will log the ids of states entered to stdout. This can be useful in debugging.

    log-state-exit   

        If set to true, the interpreter will log the ids of states exited to stdout.

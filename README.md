scion-shell accepts a single argument which is a path to an SCXML file. It instantiates an SCXML interpreter from this SCXML file, and then accepts events via stdin.  

scion-shell prints state ids on state entry and exit, so it can be used for demo purposes.  

When invoking from a tty, stdin is the shell, so it can work as a simple SCXML interpreter shell. 

scion-dev can also make the SCION interpreter available over the network using netcat. 

    netcat -l 8000 |  node scion-shell.js node_modules/scion/test/scxml-test-framework/test/basic/basic1.scxml

Events can then be sent in using netcat:

    netcat localhost 8000


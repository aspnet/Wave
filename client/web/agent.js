
ko.safeObservable = function (initialValue) {
    var result = ko.observable(initialValue);
    result.safe = ko.dependentObservable(function () {
        return result() || {};
    });

    return result;
};


function Machine(payload) {
    var self = this;
    try {
        self.config = JSON.parse(payload);
        self.name = self.config.clientid;
        self.output = ko.observable("");

        var outputelement = document.getElementById("outputWindow");
        self.output.subscribe(function (value) {
            outputelement.scrollTop = outputelement.scrollHeight;
        });
    } catch (e) {
        self.config = {};
        self.name = 'Unknown';
    }
};

var ViewModel = function () {
    var self = this;
    var creds = _creds;

    self.Input = ko.observable();
    self.CurrentNode = ko.safeObservable();
    self.Machines = ko.observableArray();
    self.broker = ko.observable();
    self.username = ko.observable();
    self.password = ko.observable();
    self.port = ko.observable(443);
    self.connected = ko.observable(false);
    self.broker((creds && creds.broker) ? creds.broker.host : "broker");
    self.username((creds && creds.broker) ? creds.broker.username : "admin");
    self.password((creds && creds.broker) ? creds.broker.password : "");
    self.port((creds && creds.broker.port) ? parseInt(creds.broker.port) + 1 : 443);

    var command = {
        command: "hostname"
    };
    self.Command = ko.observable(JSON.stringify(command, null, 4));

    //var broker = data.broker;
    function Subscribe() {
        // Create a client instance

        client = new Paho.MQTT.Client(self.broker(), 1884, guid());
        client = new Paho.MQTT.Client(self.broker(), parseInt(self.port()), guid());

        // set callback handlers
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // connect the client
        function connect() {
            client.connect({
                onSuccess: onConnect,
                onFailure: onFailure,
                userName: self.username(),
                password: self.password(),
                useSSL: false
            });
        }

        function onFailure(err) {
            console.log(err);
        }

        // called when the client connects
        function onConnect() {
            self.connected(true);

            // Once a connection has been made, make a subscription and send a message.
            console.log("onConnect");
            client.subscribe("client/+/config");

            //message = new Paho.MQTT.Message("Hello");
            //message.destinationName = "/world";
            //client.send(message);
        }

        // called when the client loses its connection
        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
            self.connected(false);
        }

        connect();

        // called when a message arrives
        function onMessageArrived(message) {
            var configIndex = message.destinationName.indexOf("/config")
            if (configIndex > -1) {
                var machineName = message.destinationName.substring(7, configIndex);
                var msg = new Machine(message.payloadString);
                var match = ko.utils.arrayFirst(self.Machines(), function (item) {
                    return item.name === machineName;
                });
                if (msg.name === "Unknown") {
                    self.Machines.remove(match);
                } else if (match) {
                    self.Machines.replace(match, msg);
                }
                else {
                    self.Machines.push(msg);
                }
            }
            var outIndex = message.destinationName.indexOf("output")
            if (outIndex > -1) {
                var match = ko.utils.arrayFirst(self.Machines(), function (item) {
                    return message.destinationName.substring(0, outIndex - 1) === item.name;
                });
                match.output(match.output() + message.payloadString);
            }
            console.log("onMessageArrived: (" + message.destinationName + ")" + message.payloadString);
        }
        return client;

    }
    self.authVisible = ko.observable(true);
    self.cmdVisible = ko.observable(false);

    self.Login = function () {
        self.Machines.removeAll();
        self.client = Subscribe();
        self.cmdVisible(true)
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    self.Send = function () {
        var machine = self.CurrentNode();
        var command = preProcessCommand(self.Command(), machine.config.os === "win32");
        console.log("Send - [" + machine.name + "] " + command);
        var msg = new Paho.MQTT.Message(command);
        msg.destinationName = self.CurrentNode().name;
        self.client.send(msg);
        machine.output(machine.output() + "\n");
    };

    var currentSubscriptions = [];
    self.onNodeClick = function (machine) {

        currentSubscriptions.forEach(function (sub) {
            self.client.unsubscribe(sub);
        });
        //self.Input("");
        self.CurrentNode(machine);
        self.client.subscribe(machine.name);
        self.client.subscribe(machine.name + "/output");
    };

    self.isNodeChosen = function (machine) {
        return self.CurrentNode() === machine;
    }

    /*
    Handle simple commands and prefix shell to make testing easier. 
    */
    function preProcessCommand(command, isWin32) {

        var isSimple = true;
        var cmd = command;

        try {
            cmd = JSON.parse(command);
            isSimple = false;
        } catch (e) { }

        if (isSimple) {
            // This means its a string command;                      
            var arg = command.match(/(?:[^\s"]+|"[^"]*")+/g);
            var cmd = arg.shift();

            if (isChangeDirectory(command)) {
                var cdCommand = {
                    command: "setenv",
                    options: {
                        cwd: arg[0] || ""
                    }
                }

                command = JSON.stringify(cdCommand);

            } else if (isWin32) {
                var hasShell = cmd.match(/^cmd/i) || cmd.match(/^powershell/i);
                var isExe = cmd.match(/\.exe$/i);
                if (!hasShell && !isExe) {
                    command = "cmd.exe /c " + command;
                }
            }
        }

        return command;
    };
    function isChangeDirectory(cmd) {
        return (cmd.match(/cd/i));
    }
    if (self.Machines().length > 0) {
        self.CurrentNode(self.Machines()[0]);
    }

};

$(document).ready(function () {
    var model = new ViewModel();
    ko.applyBindings(model);
});



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
        self.name = self.config.hostname;
    } catch (e) {
        self.config = {};
        self.name = 'Unknown';
    }
};

var ViewModel = function () {
    var self = this;
    var creds = _creds;
    self.Input = ko.observable();
    self.Output = ko.observable();
    self.Machines = ko.observableArray();
    self.broker = ko.observable();
    self.username = ko.observable();
    self.password = ko.observable();
    self.broker((creds && creds.broker) ? creds.broker.host : "broker");
    self.username((creds && creds.broker) ? creds.broker.username : "admin");
    self.password((creds && creds.broker) ? creds.broker.password : "");
    var command = {
        command: "hostname"
    };
    self.Command = ko.observable(JSON.stringify(command, null, 4));

    self.CurrentNode = ko.safeObservable();
    //var broker = data.broker;
    function Subscribe() {
        // Create a client instance
        client = new Paho.MQTT.Client(self.broker(), 1884, "clientId");

        // set callback handlers
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // connect the client
        client.connect({ onSuccess: onConnect, userName: self.username(), password: self.password() });


        // called when the client connects
        function onConnect() {
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
        }

        // called when a message arrives
        function onMessageArrived(message) {
            if (message.destinationName.indexOf("config") > -1) {
                var msg = new Machine(message.payloadString);
                var match = ko.utils.arrayFirst(self.Machines(), function (item) {
                    return msg.name === item.name;
                });
                if (match) {
                    self.Machines.replace(match, msg);
                }
                else {
                    self.Machines.push(msg);
                }
                self.onNodeClick(msg);
            }

            if (message.destinationName.indexOf("output") > -1) {
                self.Output(self.Output() + message.payloadString);
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


    self.Send = function () {
        var machine = self.CurrentNode();
        var command = prefixShell(self.Command(), machine.config.os === "win32");
        console.log("Send - [" + machine.name + "] " + command);
        var msg = new Paho.MQTT.Message(command);
        msg.destinationName = self.CurrentNode().name;
        self.client.send(msg);
        self.Output(self.Output() + "\n");
    };

    var currentSubscriptions = [];
    self.onNodeClick = function (machine) {

        currentSubscriptions.forEach(function (sub) {
            self.client.unsubscribe(sub);
        });
        self.Output("");
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
    function prefixShell(command, isWin32) {

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

            if (isWin32) {
                var hasShell = cmd.match(/^cmd/i) || cmd.match(/^powershell/i);
                var isExe = cmd.match(/\.exe$/i);
                if (!hasShell && !isExe) {
                    return "cmd.exe /c " + command;
                }
            }
        }

        return command;
    };
};

$(document).ready(function () {
    var model = new ViewModel();
    ko.applyBindings(model);
    //Set autoscrolling output-window
    var outputelement = document.getElementById("outputWindow");
    //$('#outputWindow').scrollTop($('#outputWindow')[0].scrollHeight);

    model.Output.subscribe(function (value) {
        outputelement.scrollTop = outputelement.scrollHeight;
    });
});


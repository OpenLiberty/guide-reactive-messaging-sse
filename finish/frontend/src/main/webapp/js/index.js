function initSSE() {
    var source = new EventSource('/api/sse');
    
    source.addEventListener(
        'systemLoad',
        systemLoadHandler
    );
}

function systemLoadHandler(event) {
    console.log("Handled");
    var system = JSON.parse(event.data);
    console.log(system);
    document.getElementById(system.hostname).cells[1].innerHTML = system.loadAverage.toFixed(2);
}

function addSystem(hostname, systemLoad, health) {
    var tableRow = document.createElement('tr');
    tableRow.id = hostname;
    tableRow.innerHTML = '<td>' + hostname + '</td><td>' + systemLoad + '</td><td>' + health + '</td>';
    document.getElementById('sysTableBody').appendChild(tableRow);
}

function getSystem() {
    var request = new XMLHttpRequest();

    request.onload = function() {
        var system = JSON.parse(this.response)[0];
        if (system) {
            addSystem(system["hostname"], system["systemLoad"], system["systemLiveness"])
        }
        initSSE();
    };

    request.open('GET', '/api/inventory/systems');
    request.send();
}

function sendPropertiesRequest(event) {
    event.preventDefault();

    var form = document.getElementById('systemPropertiesForm');
    var properties = form.elements.properties.value;

    var request = new XMLHttpRequest();

    request.onload = function() {
        form.reset();
    };

    request.open('POST', '/api/inventory/systems/properties');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(
        properties
            ? properties
                .split(',')
                .map(function(property) { return property.trim(); }) 
            : []
    ));
}

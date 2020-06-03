function initSSE() {
    var source = new EventSource('/api/sse');
    
    source.addEventListener(
        'systemLoad',
        systemLoadHandler
    );

    source.addEventListener(
        'propertyMessage',
        propertyMessageHandler
    );
}

function systemLoadHandler(event) {
    var system = JSON.parse(event.data);

    document.getElementById('systemName').innerHTML = system.hostname;
    document.getElementById('systemLoad').innerHTML = system.loadAverage.toFixed(2);
}

function propertyMessageHandler() {
    var property = JSON.parse(event.data);

    document.getElementById('systemName').innerHTML = property.hostname;
    addPropertyToTable(property.key, property.value);
}

function addPropertyToTable(property, value) {
    if (!document.getElementById(property)) {
        var tableRow = document.createElement('tr');
        tableRow.id = property;
        tableRow.innerHTML = '<td>' + property + '</td><td>' + value + '</td>';
        document.getElementById('systemsTableBody').appendChild(tableRow);
    }
}

function getSystem() {
    var request = new XMLHttpRequest();

    request.onload = function() {
        var system = JSON.parse(this.response)[0];
        if (system) {
            Object.keys(system).forEach(function (key) {
                switch (key) {
                    case 'hostname':
                        document.getElementById('systemName').innerHTML = system[key];
                        break;
                    case 'systemLoad':
                        document.getElementById('systemLoad').innerHTML = system[key].toFixed(2);
                        break;
                    default:
                        addPropertyToTable(key, system[key]);
                }    
            });
        }

        initSSE();
    };

    request.open('GET', '/api/inventory/systems');
    request.send();
}

function sendPropertiesRequest(event) {
    event.preventDefault();

    var newDataForm = document.getElementById('newDataForm');
    var properties = newDataForm.elements.item(0).value;

    var request = new XMLHttpRequest();

    request.onload = function() {
        newDataForm.reset();
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

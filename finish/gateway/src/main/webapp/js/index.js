function initSSE() {
    // tag::eventSource[]
    var source = new EventSource('/api/sse');
    // end::eventSource[]
    
    // tag::consumeNamedEvent[]
    source.addEventListener(
        // tag::systemLoadEvent[]
        'systemLoad',
        // end::systemLoadEvent[]
        systemLoadHandler
    );

    source.addEventListener(
        // tag::propertyMessageEvent[]
        'propertyMessage',
        // end::propertyMessageEvent[]
        //
        propertyMessageHandler
    );
    // end::consumeNamedEvent[]
}

// tag::eventHandler1[]
function systemLoadHandler(event) {
    // tag::parse[]
    var system = JSON.parse(event.data);
    // end::parse[]

    document.getElementById('systemName').innerHTML = system.hostname;
    document.getElementById('systemLoad').innerHTML = system.loadAverage.toFixed(2);
}
// end::eventHandler1[]

// tag::eventHandler2[]
function propertyMessageHandler() {
    // tag::parse[]
    var property = JSON.parse(event.data);
    // end::parse[]

    document.getElementById('systemName').innerHTML = property.hostname;
    addPropertyToTable(property.key, property.value);
}
// end::eventHandler2[]

function addPropertyToTable(property, value) {
    if (document.getElementById(property)) return;
    var tableRow = document.createElement('tr');
    tableRow.id = property;
    tableRow.innerHTML = '<td>' + property + '</td><td>' + value + '</td>';
    document.getElementById('sysPropertiesTableBody').appendChild(tableRow);
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

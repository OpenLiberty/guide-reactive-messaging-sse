function initSSE() {
    var source = new EventSource('/frontend/sse');
    source.addEventListener(
        'systemLoad',
        systemLoadHandler
    );
}
function systemLoadHandler(event) {
    var system = JSON.parse(event.data);
    if(document.getElementById(system.hostname)){
        document.getElementById(system.hostname).cells[1].innerHTML =
                                        system.loadAverage.toFixed(2);
    }else{
        var tableRow = document.createElement('tr');
        tableRow.id = system.hostname;
        tableRow.innerHTML = '<td>' + system.hostname + '</td><td>'
                             + system.loadAverage.toFixed(2) + '</td>';
        document.getElementById('sysPropertiesTableBody').appendChild(tableRow);
    }
}

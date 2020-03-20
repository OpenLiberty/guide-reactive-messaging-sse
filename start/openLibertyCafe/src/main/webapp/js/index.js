function updateTable(order) {
    const { orderId } = order;
    
    const orderRowNode = createTableRow(order);
    const orderRow = document.getElementById(`order${orderId}`);

    if (orderRow) {
        orderRow.replaceWith(orderRowNode);
    } else {
        document.getElementById('orderTableBody').appendChild(orderRowNode);
    }
}
// end::updateTable[]

async function getStatuses() {
    const res = await fetch('/api/status');
    const orders = await res.json();

    orders.forEach(order => updateTable(order));
}

function createTableRow(order) {
    const { orderId, tableId, type, item, status } = order;   

    const tableRow = document.createElement('tr');

    tableRow.id = `order${orderId}`;
    tableRow.innerHTML = `
        <td>${orderId}</td>
        <td>${tableId}</td>
        <td>${type}</td>
        <td>${item}</td>
        <td>${status}</td>
        <td>
            <button
                class="completeButton"
                ${status === 'READY' ? undefined : "disabled"}
                onclick="completeOrder('${orderId}')"
            >Complete</button>
        </td>
    `;

    return tableRow;
}

function completeOrder(orderId) {
    fetch(`/api/servingWindow/${orderId}`, {
        method: 'POST'
    });
}

async function sendOrderRequest(event) {
    event.preventDefault();

    try {
        const orderForm = document.getElementById('orderForm');

        const tableId = orderForm.elements.item(0).value;
        const foodList = orderForm.elements.item(1).value;
        const beverageList = orderForm.elements.item(2).value;

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tableId,
                foodList: foodList ? foodList.split(',').map(food => food.trim()) : [],
                beverageList: beverageList ? 
                                    beverageList.split(',').map(beverage => beverage.trim()) : [],
            })
        });

        if (res.ok) {
            document.getElementById('orderForm').reset();
        } else {
            const errors = await res.json();
            
            for (let i = 0; i < errors.length; i++) {
                toast(errors[i], i);
            }
        }
    } catch(err) {
        console.log(err);
    }
};

function toast(message, index) {
    const length = 3000;
    const toast = document.getElementById('toast');

    setTimeout(() => {
        toast.innerText = message;
        toast.className = 'show'; 
    }, length * index);

    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, length + length * index);
}

const backgroundContainer = document.getElementById('background-container');
const backgroundImageUrl = './images/x.jpeg';
backgroundContainer.style.backgroundImage = `url('${backgroundImageUrl}')`;
backgroundContainer.style.backgroundSize = 'cover';

function getCsrfToken() {
    const match = document.cookie.match(new RegExp('(^| )csrfToken=([^;]+)'));
    return match ? match[2] : null;
}

async function getBlocks() {
    try {
        const response = await fetch('https://localhost:3000/blocks'); // Ajusta la URL según sea necesario
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching blocks:', error);
        document.getElementById('blocks').textContent = 'Error loading blocks. Please try again later.';
    }
}

async function getBalance() {
    const response = await fetch('https://localhost:3000/balance');
    const data = await response.json();
    document.getElementById('balance').textContent = JSON.stringify(data, null, 2);
}

async function getPublicKey() {
    const response = await fetch('https://localhost:3000/public-key');
    const data = await response.json();
    document.getElementById('public-key').textContent = JSON.stringify(data, null, 2);
}

getPublicKey();

async function createTransaction(event) {
    event.preventDefault();
    const recipient = document.getElementById('recipient').value;
    const amount = parseInt(document.getElementById('amount').value);
    const response = await fetch('https://localhost:3000/transact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient, amount })
    });
    const data = await response.text();
    getTransactions(data);
}

async function createItem(event) {
    event.preventDefault();
    const emoji = document.getElementById('emoji').value;
    const name = document.getElementById('name').value;
    const amount = parseInt(document.getElementById('amount').value);
    const seller = document.getElementById('seller').value;
    const response = await fetch('https://localhost:3000/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji, name, amount, seller })
    });
    const data = await response.text();
    document.getElementById('items').textContent = data;
}


async function getItems() {
    try {
        const response = await fetch('https://localhost:3000/items');
        const data = await response.json();
        displayItems(data);    
    } catch(error) {
        console.error('Error fetching items:', error);
    }
}

// Function to create and insert HTML for each item
function displayItems(items) {
    const container = document.getElementById('items');
    container.innerHTML = ''; // Clear previous items if any
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('crypto-item');
        itemElement.innerHTML = `

            <div class="crypto-info">
                <div class="crypto-name">---------------------------------------------------------------------------------------------------------------------------------------</div>
                <div class="crypto-name">Item Id: ${item.id}</div>
                <div class="crypto-name">Mine: ${item.name}${item.emoji}</div>
                <div class="crypto-amount">Machine: ${item.amount}</div>
                <div class="crypto-name">Owner: ${item.seller}</div>
                <div class="crypto-name">Full: ${item.full}</div>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

getItems();

function displayBlocks(blocks) {
    const container = document.getElementById('blocks');
    container.innerHTML = '';
    blocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.classList.add('block');
        blockElement.innerHTML = `
        
            <div class="crypto-info">
                <div class="crypto-value">----------------------------------------------------------------------------------------------------------------------------------------</div>
                <div class="crypto-name">Timestamp: ${block.timestamp}</div>
                <div class="crypto-name">Last Hash: ${block.lastHash}</div>
                <div class="crypto-name">Hash: ${block.hash}</div>
                <div class="crypto-name">Data: ${block.data}</div>
                <div class="transactions">
                ${block.data.map(transaction => `
                    <div class="transaction">
                        <div class="crypto-name">
                            <span><strong>Transaction ID:</strong> ${transaction.id}</span>
                            <span><strong>Timestamp:</strong> ${transaction.input.timestamp}</span>
                        </div>
                        <div class="crypto-name">
                            <span><strong>Amount:</strong> ${transaction.input.amount}</span>
                            <span><strong>Address:</strong> ${transaction.input.address}</span>
                        </div>
                        <div class="crypto-amount">
                            ${transaction.outputs.map(output => `
                                <div class="output-info">
                                    <span><strong>Amount:</strong> ${output.amount}</span>
                                    <span><strong>Address:</strong> ${output.address}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="crypto-name">Nonce: ${block.nonce}</div>
                <div class="crypto-name">Difficulty: ${block.difficulty}</div>
                <div class="crypto-name">Process Time: ${block.processTime}</div>
            </div>
        `;
        container.appendChild(blockElement);
    });
}

async function filterBlocks() {
    const address = document.getElementById('address-input').value;
    const blocks = await getBlocks();
    const filteredBlocks = blocks.filter(block => {
        return block.data.some(transaction => {
            return transaction.input.address === address || transaction.outputs.some(output => output.address === address);
        });
    });
    displayBlocks(filteredBlocks);
}

getBlocks().then(displayBlocks);
getBlocks();

document.getElementById('buy').addEventListener('click', buyItem);
async function buyItem(event) {
    event.preventDefault();
    const id = document.getElementById('id').value;
    const response = await fetch('https://localhost:3000/buy-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ id })
    });
    const data = await response.text();
    const csrfToken = data.csrfToken;
    document.getElementById('buy').textContent = data;
}

let miningInterval;
const MINING_SPEED = 50; // Velocidad de la barra de progreso (menor es más rápido)

document.getElementById('startMining').addEventListener('click', startMining);
async function startMining() {
    try {
        const response = await fetch('https://localhost:3000/start-mining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if(response.ok) {
            document.getElementById('progress-bar').style.display = 'block'; // Mostrar la barra de progreso
            updateProgressBar();
            const data = await response.text();
            document.getElementById('start').textContent = data;    
        } else {
            console.error('Error starting mining:', response.statusText);
        }
    } catch (error) {
        console.error('Error starting mining:', error);
    }
}

async function stopMining() {
    clearInterval(miningInterval);
    try {
        const response = await fetch('https://localhost:3000/stop-mining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.ok) {
            resetProgressBar();
            const data = await response.text();
            document.getElementById('stop').textContent = data;        
        } else {
            console.error('Error stopping mining:', response.statusText);
        }    
    } catch (error) {
        console.error('Error stopping mining:', error);
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';

    let width = 0;
    miningInterval = setInterval(() => {
        if (width >= 100) {
            width = 0; // Reset the width when it reaches 100%
        } else {
            width += 1; // Increment the width
        }
        progressBar.style.width = width + '%';
    }, MINING_SPEED); // Update the progress bar based on the mining speed
}

function resetProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
}

async function getTransactions() {
    try {
        const response = await fetch('https://localhost:3000/transactions');
        const data = await response.json();
        displayTransactions(data);    
    } catch(error) {
        console.error('Error fetching transactions:', error);
    }
}

getTransactions();

function displayTransactions(transactions) {
    const container = document.getElementById('transactions');
    container.innerHTML = '';
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.classList.add('transaction');
        transactionElement.innerHTML = `

            <div class="crypto-info">
                <div class="crypto-name">Id: ${transaction.id}</div>
                <div class="crypto-name">Timestamp: ${transaction.input.timestamp}</div>
                <div class="crypto-name">Amount: ${transaction.input.amount}</div>
                <div class="crypto-name">Address: ${transaction.input.address}</div>
                <div class="crypto-name">Signature r: ${transaction.input.signature.r}</div>
                <div class="crypto-name">Signature s: ${transaction.input.signature.s}</div>
                ${transaction.outputs.map(output => `
                    <div class="crypto-value">Output Amount: ${output.amount}</div>
                    <div class="crypto-name">Output Address: ${output.address}</div>
                `).join('')}
            </div>
        `;
        container.appendChild(transactionElement);
    });
}

function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        page.style.display = 'none'; // Oculta todas las páginas
    });
    document.getElementById(pageId).style.display = 'block'; // Muestra la página seleccionada
}

document.querySelectorAll('.footer-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        showPage(button.getAttribute('id'));
    });
});

document.querySelectorAll('.actions-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        showPage(button.getAttribute('id'));
    });
});

window.onload = function() {
    showPage('home'); // Muestra la página 'home' cuando la aplicación carga
};

// document.getElementById('homehome').addEventListener('click', function() {
//     location.reload(); // Recarga la página
// });



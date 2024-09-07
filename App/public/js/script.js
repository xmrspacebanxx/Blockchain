
const backgroundContainer = document.getElementById('background-container');
const backgroundImageUrl = '../images/x.jpeg';
backgroundContainer.style.backgroundImage = `url('${backgroundImageUrl}')`;
backgroundContainer.style.backgroundSize = 'cover';

async function fetchCsrfToken() {
    const response = await fetch('https://localhost:3000/get-csrf-token', {
        method: 'GET',
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data.csrfToken;
}

async function getBlocks() {
    try {
        const response = await fetch('https://localhost:3000/blocks');
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

document.getElementById('balance-button').addEventListener('click', getBalance);
async function getBalance(blocks) {
    const response = await fetch('https://localhost:3000/balance');
    const data = await response.json();
    const timestampInit = 1725241389574;
    const timestamp = Date.now();
    const quokkasTotal = (timestamp - timestampInit) / 60000 * 1.2;
    let cumulativeTotal = 0;
    const publicKey = '049766a7c1aee6c920cfd47ce3827e85f88b50768c24295d3bb0bc9301bb6801ad15c4e33fde05739afa77c4d88df5608e0c13f700358da4302307b6caa150da89';
    blocks.forEach(block => {
        let totalAmount = 0;
        block.data.forEach(transaction => {
            transaction.outputs.forEach(output => {
                if(output.address === publicKey) {
                    totalAmount += parseFloat(output.amount);
                }
            });
        });
        cumulativeTotal += totalAmount;
    });
    if (cumulativeTotal > 0) {
        const percent = (quokkasTotal / cumulativeTotal - 1) * 100;
        const percentBalance = quokkasTotal / cumulativeTotal;
        const balance = data * 10000000 * percentBalance;
        document.getElementById('balance').textContent = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('quokkas').textContent = `${cumulativeTotal.toLocaleString('en-US', { minimumFractionDigits: 20, maximumFractionDigits: 20 })}`;
        document.getElementById('percent').textContent = `${percent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

    } else {
        document.getElementById('balance').textContent = 'No balance available';
    }
}

getBlocks().then(getBalance);
setInterval(async () => {
    try {
        await getBlocks().then(getBalance);
    } catch (error) {
        console.error("Error al ejecutar la funcion:", error);
    }
}, 60000);



async function getPublicKey() {
    try {
        const response = await fetch('https://localhost:3000/public-key');
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('public-key').textContent = data;
        return data;
    } catch (error) {
        console.error('Error fetching publicKey:',error);
        document.getElementById('public-key').textContent = 'Error loading publicKey. Please try again later.';
    }
}

getPublicKey();

document.getElementById('transact-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    createTransaction(csrfToken);
});

async function createTransaction(csrfToken) {
    try {
    	const recipient = document.getElementById('recipient').value;
    	const amount = parseFloat(document.getElementById('amount').value);
        const response = await fetch('https://localhost:3000/transact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
			body: JSON.stringify({ recipient, amount })
        });
        if(response.ok) {
            const data = await response.text();
    		getTransactions(data);
        }
 		else {
            console.error('Error send transaction:', response.statusText);
        }
    } catch (error) {
        console.error('Error send transaction:', error);
    }
}

document.getElementById('network').addEventListener('click', async () => {
    const csrfToken = await fetchCsrfToken();
    network(csrfToken);
});
async function network(csrfToken) {
    try {
        const response = await fetch('https://localhost:3000/network', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if(response.ok) {
            const data = await response.json();
            console.log('Network started successfully:', data);
        }
        else{
            console.error('Error starting network:', response.statusText);
        }
    } catch (error) {
        console.error('Error starting network:', error);
    }
    
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

function displayItems(items) {
    const container = document.getElementById('items');
    container.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('crypto-item');
        itemElement.innerHTML = `
            <div class="crypto-info">
                <div class="crypto name">--------------------------------------------
		---------------------------------------------------------------------
		----------------------</div>
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
                <div class="crypto-value">----------->Quokka Block: ${block.nonce}:<---------</div>
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

async function displayAmountsByAddress(blocks) {
    const container = document.getElementById('grafica');
    container.innerHTML = ''; // Limpiar el contenido anterior
    const response = await fetch('https://localhost:3000/public-key');
    const publicKey = await response.json();

    // const publicKey = '049766a7c1aee6c920cfd47ce3827e85f88b50768c24295d3bb0bc9301bb6801ad15c4e33fde05739afa77c4d88df5608e0c13f700358da4302307b6caa150da89049766a7c1aee6c920cfd47ce3827e85f88b50768c24295d3bb0bc9301bb6801ad15c4e33fde05739afa77c4d88df5608e0c13f700358da4302307b6caa150da89';

    // Datos para la gráfica
    const labels = []; // Para los timestamps de los bloques
    const dataValues = []; // Para los montos totales de la dirección
    let cumulativeTotal = 0;
    // Recopilar datos para la gráfica -> ingresos
    blocks.forEach(block => {
        labels.push(new Date(block.timestamp).toLocaleString()); // Convertir timestamp a formato legible

        let totalAmount = 0;

        block.data.forEach(transaction => {
            // Sumar los ingresos
            transaction.outputs.forEach(output => {
                if (output.address === publicKey) {
                    totalAmount += parseFloat(output.amount);
                }
            });

            // Restar los egresos
            if (transaction.input.address === publicKey) {
                totalAmount -= parseFloat(transaction.input.amount);
            }
        });

        cumulativeTotal += totalAmount;
        dataValues.push(cumulativeTotal); // Agregar el total de montos a la lista
    });

    const gain = [];
    let initialTimestamp = 1725241389574; // El timestamp del primer bloque
    blocks.forEach((block, index) => {
        const timestamp = block.timestamp;
        const timestampQuokka = initialTimestamp + (300000 * index); // 5 minutos en ms por bloque
        
        const percent = ((timestamp - initialTimestamp) / timestampQuokka) * 100;
        document.getElementById('percent2').textContent = `${percent.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 })}%`;
        gain.push(percent);
    });

    // Crear un nuevo elemento canvas para la gráfica
    const canvasElement = document.createElement('canvas');
    canvasElement.id = 'amountChart';
    canvasElement.width = 400;
    canvasElement.height = 235;
    container.appendChild(canvasElement); // Agregar el canvas al contenedor

    // Configuración de la gráfica
    const datos = {
        labels: labels,
        datasets: [{
            label: 'Quokkas',
            data: dataValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
        },
        {
            label: 'Gain',
            data: gain,
            borderColor: 'rgba(90, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
        }]
    };

    const config = {
        type: 'bar',
        data: datos,
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamp'
                    },
                    ticks: {
                        display: false  // Oculta las etiquetas en el eje x
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quokkas'
                    },
                    ticks: {
                        display: false  // Oculta las etiquetas en el eje x
                    }
                },
                'y-gain': { // Segundo eje Y para mostrar el porcentaje de ganancia
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Gain (%)'
                    },
                    ticks: {
                        display: false  // Oculta las etiquetas en el eje x
                    }
                }
            },
        },
    };

    // Crear la gráfica
    const ctx = document.getElementById('amountChart').getContext('2d');
    new Chart(ctx, config);
}

getBlocks().then(updateProgressBar);
getBlocks().then(displayAmountsByAddress);
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
const MINING_SPEED = 50;

document.getElementById('startMining').addEventListener('click', async () => {
    const csrfToken = await fetchCsrfToken();
    startMining(csrfToken);
});

async function startMining(csrfToken) {
    try {
        const response = await fetch('https://localhost:3000/start-mining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if(response.ok) {
            const startButton = document.getElementById('startMining');
            startButton.classList.add('success');
            startButton.classList.remove('error');
        } else {
            console.error('Error starting mining:', response.statusText);
            const startButton = document.getElementById('startMining');
            startButton.classList.add('success');
            startButton.classList.remove('error'); // Cambiar color a rojo si falla
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

document.getElementById('newWallet').addEventListener('click', async () => {
    const csrfToken = await fetchCsrfToken();
    newWallet(csrfToken);
});

async function newWallet(csrfToken) {
    try {
        const response = await fetch('https://localhost:3000/wallets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if(response.ok) {
            const data = await response.text();
            document.getElementById('wallets').textContent = data;    
        }
 else {
            console.error('Error starting mining:', response.statusText);
        }
    } catch (error) {
        console.error('Error starting mining:', error);
    }
}

async function updateProgressBar(blocks) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
    const response = await fetch('https://localhost:3000/public-key');
    const publicKey = await response.json();
    let partialAmount = 0;
    const totalAmount = 1000000;
    try {
    // const response = await fetch('https://localhost:3000/balance');
    // const partialAmount = await response.json();
    blocks.forEach(block => {
        let dataAmount = 0;
        block.data.forEach(transaction => {
            transaction.outputs.forEach(output => {
                if(output.address === publicKey) {
                    dataAmount += parseFloat(output.amount);
                }
            });
        });
        partialAmount += dataAmount;
    });
    let progress = 0;
    if(partialAmount <= 0){
        console.error('Error: Total amount must be greater than zero.');
        return;
    }
    miningInterval = setInterval(() => {
        progress = (partialAmount / totalAmount) * 100;
        if(progress >= 100) {
            progress = 100;
            clearInterval(miningInterval);
        }
        progressBar.style.width = progress + '%';
    }, 10);
    } catch(error){
        console.error('Error fetching balance:', error);
    }
}

updateProgressBar();

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
    document.querySelectorAll('.page').forEach(function(page) {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

document.querySelectorAll('.footer-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        showPage(button.getAttribute('id').replace('Btn', 'Page'));
    });
});

document.querySelectorAll('.actions-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        showPage(button.getAttribute('id') + 'Page');
    });
});

window.onload = function() {
    showPage('homePage');
};

document.getElementById('homeBtn').addEventListener('click', function() {
     location.reload();
});


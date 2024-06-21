document.getElementById('checkBalanceButton').addEventListener('click', async () => {
    const publicKey = document.getElementById('publicKey').value;
    try {
        const response = await fetch(`http://localhost:3000/balance?publicKey=${publicKey}`);
        const data = await response.json();
        document.getElementById('balanceDisplay').innerText = `Balance: ${data}`;
    } catch (error) {
        console.error(error);
        document.getElementById('balanceDisplay').innerText = 'Error fetching balance';
    }
});

document.getElementById('mineBlockButton').addEventListener('click', async () => {
    try {
        const response = await fetch(`http://localhost:3000/mine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: 'Sample Data' })
        });
        document.getElementById('mineStatus').innerText = 'New block mined successfully!';
    } catch (error) {
        console.error(error);
        document.getElementById('mineStatus').innerText = 'Error mining block';
    }
});

document.getElementById('getBlocksButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/blocks');
        const blocks = await response.json();
        document.getElementById('blocksDisplay').innerText = JSON.stringify(blocks, null, 2);
    } catch (error) {
        console.error(error);
        document.getElementById('blocksDisplay').innerText = 'Error fetching blocks';
    }
});

document.getElementById('getTransactionsButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/transactions');
        const transactions = await response.json();
        document.getElementById('transactionsDisplay').innerText = JSON.stringify(transactions, null, 2);
    } catch (error) {
        console.error(error);
        document.getElementById('transactionsDisplay').innerText = 'Error fetching transactions';
    }
});

document.getElementById('transactButton').addEventListener('click', async () => {
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;
    try {
        const response = await fetch('http://localhost:3000/transact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient, amount })
        });
        document.getElementById('transactionsDisplay').innerText = 'Transaction sent!';
    } catch (error) {
        console.error(error);
        document.getElementById('transactionsDisplay').innerText = 'Error sending transaction';
    }
});

document.getElementById('newWalletButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/wallets', {
            method: 'POST'
        });
        const newWallet = await response.json();
        document.getElementById('walletsDisplay').innerText = `New wallet created: ${JSON.stringify(newWallet, null, 2)}`;
    } catch (error) {
        console.error(error);
        document.getElementById('walletsDisplay').innerText = 'Error creating new wallet';
    }
});

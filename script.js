let web3;
let contract;
const contractAddress = "0xDf5dFD0618E3B6b804fE528Eb459e9069E785c85"; // Replace with the contract address
const contractABI = [
    // Your contract ABI here
];

const connectWalletButton = document.getElementById("connectWallet");
const tokenSelect = document.getElementById("tokenSelect");
const sacrificeAmount = document.getElementById("sacrificeAmount");
const sacrificeButton = document.getElementById("sacrificeButton");
const sacrificeTable = document.getElementById("sacrificeTable");
const claimTokensButton = document.getElementById("claimTokens");
const withdrawFundsButton = document.getElementById("withdrawFunds");
const countdownElement = document.getElementById("countdown");

const sacrificeStartTime = new Date("2025-02-01T12:00:00Z"); // Replace with the actual start time

function updateCountdown() {
    const now = new Date();
    const diff = sacrificeStartTime - now;

    if (diff <= 0) {
        countdownElement.textContent = "The sacrifice has started!";
        clearInterval(countdownInterval);
    } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

connectWalletButton.addEventListener("click", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        contract = new web3.eth.Contract(contractABI, contractAddress);
        await loadTokens();
        loadSacrifices();
    } else {
        alert("Please install MetaMask to continue.");
    }
});

async function loadTokens() {
    try {
        tokenSelect.innerHTML = "";
        const tokenAddresses = ["0xefD766cCb38EaF1dfd701853BFCe31359239F305", "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", "0xINC_ADDRESS", "0xWETH_ADDRESS", "0xUSDT_ADDRESS", "0xWPLS_ADDRESS"];
        for (const token of tokenAddresses) {
            const isValid = await contract.methods.validTokens(token).call();
            if (isValid) {
                const option = document.createElement("option");
                option.value = token;
                option.textContent = token;
                tokenSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error loading tokens: ", error);
    }
}

sacrificeButton.addEventListener("click", async () => {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const tokenAddress = tokenSelect.value;
    const amount = web3.utils.toWei(sacrificeAmount.value, "ether");

    try {
        await contract.methods.sacrifice(tokenAddress, amount).send({ from: userAddress });
        alert("Sacrifice successful.");
        loadSacrifices();
    } catch (error) {
        console.error(error);
        alert("Error making the sacrifice.");
    }
});

async function loadSacrifices() {
    try {
        const events = await contract.getPastEvents("Sacrificed", {
            fromBlock: 0,
            toBlock: "latest"
        });

        sacrificeTable.innerHTML = "";

        events.forEach(event => {
            const { user, token, amount } = event.returnValues;
            const row = `<tr><td>${user}</td><td>${token}</td><td>${web3.utils.fromWei(amount, "ether")}</td></tr>`;
            sacrificeTable.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading sacrifices: ", error);
    }
}

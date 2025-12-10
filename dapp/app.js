// ===== CONFIG – FILL THESE WITH REAL VALUES FROM PERSON A =====
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Sepolia address, e.g. "0x1234..."

const CONTRACT_ABI = [
  // Paste full ABI JSON array here (from CarRepairEscrow.sol deployment)
];

// Sepolia chainId (0xaa36a7 = 11155111)
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
const ETHERSCAN_TX_BASE = "https://sepolia.etherscan.io/tx/";

let provider;
let signer;
let contract;
let currentAccount = null;

// Latest contract state (for role / button updates)
let contractOwner = null;
let contractMechanic = null;
let contractInspector = null;
let lastStatus = null;

// UI elements
const connectButton = document.getElementById("connectButton");
const accountSpan = document.getElementById("account");
const networkSpan = document.getElementById("network");
const contractAddressDisplay = document.getElementById("contractAddressDisplay");
const currentRoleSpan = document.getElementById("currentRole");

const statusSpan = document.getElementById("status");
const descriptionSpan = document.getElementById("description");
const priceSpan = document.getElementById("price");
const ownerSpan = document.getElementById("owner");
const mechanicSpan = document.getElementById("mechanic");
const inspectorSpan = document.getElementById("inspector");

const logOutput = document.getElementById("logOutput");

const refreshButton = document.getElementById("refreshButton");
const createRequestButton = document.getElementById("createRequestButton");
const depositButton = document.getElementById("depositButton");
const acceptJobButton = document.getElementById("acceptJobButton");
const markCompletedButton = document.getElementById("markCompletedButton");
const refundOwnerButton = document.getElementById("refundOwnerButton");
const confirmCompletionButton = document.getElementById("confirmCompletionButton");

const ownerCard = document.getElementById("ownerCard");
const mechanicCard = document.getElementById("mechanicCard");
const inspectorCard = document.getElementById("inspectorCard");

// ===== Helpers =====

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  logOutput.textContent = `[${timestamp}] ${message}\n` + logOutput.textContent;
}

function logTx(label, tx) {
  log(`${label} tx hash: ${tx.hash}`);
  log(`View on Etherscan: ${ETHERSCAN_TX_BASE}${tx.hash}`);
}

// Map status code (enum) to human-readable string
function statusToText(status) {
  const mapping = {
    0: "NotCreated",
    1: "Requested",
    2: "Accepted",
    3: "Paid",
    4: "Completed",
    5: "Confirmed"
  };
  return mapping[status] ?? `Unknown (${status})`;
}

function getCurrentRole() {
  if (!currentAccount) return "Unknown";
  if (!contractOwner && !contractMechanic && !contractInspector) return "Unknown";

  const acc = currentAccount.toLowerCase();
  if (contractOwner && acc === contractOwner.toLowerCase()) return "Owner";
  if (contractMechanic && acc === contractMechanic.toLowerCase()) return "Mechanic";
  if (contractInspector && acc === contractInspector.toLowerCase()) return "Inspector";
  return "Unknown";
}

function updateRoleUI() {
  const role = getCurrentRole();
  currentRoleSpan.textContent = role;

  // Clear highlights
  [ownerCard, mechanicCard, inspectorCard].forEach(card => {
    card.classList.remove("active-role");
  });

  if (role === "Owner") ownerCard.classList.add("active-role");
  if (role === "Mechanic") mechanicCard.classList.add("active-role");
  if (role === "Inspector") inspectorCard.classList.add("active-role");
}

function updateStatusSteps(statusNum) {
  const steps = document.querySelectorAll(".status-step");
  steps.forEach(step => {
    const s = Number(step.dataset.status);
    step.classList.remove("active", "done");
    if (s < statusNum) {
      step.classList.add("done");
    } else if (s === statusNum) {
      step.classList.add("active");
    }
  });
}

function updateButtonStates(statusNum) {
  // Disable all by default
  [
    createRequestButton,
    depositButton,
    acceptJobButton,
    markCompletedButton,
    refundOwnerButton,
    confirmCompletionButton
  ].forEach(btn => {
    btn.disabled = true;
  });

  const role = getCurrentRole();

  // Logic based on contract rules
  if (role === "Owner") {
    // createRequest: only in NotCreated
    if (statusNum === 0) {
      createRequestButton.disabled = false;
    }
    // depositPayment: only in Accepted
    if (statusNum === 2) {
      depositButton.disabled = false;
    }
  }

  if (role === "Mechanic") {
    // acceptJob: Requested
    if (statusNum === 1) {
      acceptJobButton.disabled = false;
    }
    // markCompleted: Paid
    if (statusNum === 3) {
      markCompletedButton.disabled = false;
    }
    // refundOwner: Accepted or Paid
    if (statusNum === 2 || statusNum === 3) {
      refundOwnerButton.disabled = false;
    }
  }

  if (role === "Inspector") {
    // confirmCompletion: Completed
    if (statusNum === 4) {
      confirmCompletionButton.disabled = false;
    }
  }
}

// ===== Connection logic =====

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install it.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    currentAccount = accounts[0];
    accountSpan.textContent = currentAccount;

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    networkSpan.textContent = `${network.name} (${network.chainId})`;

    // Warn if not on Sepolia
    if (network.chainId !== 11155111) {
      log("Wrong network. Trying to switch to Sepolia...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
        });
        log("Switched to Sepolia. Please reconnect if needed.");
      } catch (switchError) {
        log("Failed to switch network: " + switchError.message);
      }
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      log("⚠️ Please configure CONTRACT_ADDRESS and CONTRACT_ABI in app.js");
      return;
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    contractAddressDisplay.textContent = CONTRACT_ADDRESS;

    log("Wallet connected. Contract initialized.");
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Error connecting wallet: " + err.message);
  }
}

// ===== State loading =====

async function loadContractState() {
  if (!contract) {
    log("Contract not initialized.");
    return;
  }

  try {
    const [status, desc, priceWei, owner, mechanic, inspector] = await Promise.all([
      contract.status(),
      contract.description(),
      contract.price(),
      contract.owner(),
      contract.mechanic(),
      contract.inspector()
    ]);

    const statusNum = Number(status);
    lastStatus = statusNum;

    contractOwner = owner;
    contractMechanic = mechanic;
    contractInspector = inspector;

    statusSpan.textContent = statusToText(statusNum);
    descriptionSpan.textContent = desc;
    priceSpan.textContent = ethers.utils.formatEther(priceWei);
    ownerSpan.textContent = owner;
    mechanicSpan.textContent = mechanic;
    inspectorSpan.textContent = inspector;

    updateStatusSteps(statusNum);
    updateRoleUI();
    updateButtonStates(statusNum);

    log("Contract state refreshed.");
  } catch (err) {
    console.error(err);
    log("Error loading contract state: " + (err.data?.message || err.message));
  }
}

// ===== Actions =====

async function createRequest() {
  if (!contract) return;

  const descriptionInput = document.getElementById("descriptionInput");
  const priceInput = document.getElementById("priceInput");
  const inspectorInput = document.getElementById("inspectorInput");

  const desc = descriptionInput.value.trim();
  const priceEth = priceInput.value.trim();
  const inspectorAddr = inspectorInput.value.trim();

  if (!desc || !priceEth || !inspectorAddr) {
    alert("Please fill description, price and inspector address.");
    return;
  }

  try {
    const priceWei = ethers.utils.parseEther(priceEth);
    log("Sending createRequest transaction...");
    const tx = await contract.createRequest(priceWei, desc, inspectorAddr);
    logTx("createRequest", tx);
    const receipt = await tx.wait();
    log(`createRequest confirmed in block ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Error in createRequest: " + (err.data?.message || err.message));
  }
}

async function depositPayment() {
  if (!contract) return;

  const depositInput = document.getElementById("depositInput");
  const amountEth = depositInput.value.trim();

  if (!amountEth) {
    alert("Please enter deposit amount in ETH (must equal price).");
    return;
  }

  try {
    const valueWei = ethers.utils.parseEther(amountEth);
    log("Sending depositPayment transaction...");
    const tx = await contract.depositPayment({ value: valueWei });
    logTx("depositPayment", tx);
    const receipt = await tx.wait();
    log(`depositPayment confirmed in block ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Error in depositPayment: " + (err.data?.message || err.message));
  }
}

async function simpleCall(methodName, label) {
  if (!contract) return;

  try {
    log(`Sending ${label} transaction...`);
    const tx = await contract[methodName]();
    logTx(label, tx);
    const receipt = await tx.wait();
    log(`${label} confirmed in block ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log(`Error in ${label}: ` + (err.data?.message || err.message));
  }
}

// ===== Event listeners =====

connectButton.addEventListener("click", connectWallet);
refreshButton.addEventListener("click", loadContractState);

createRequestButton.addEventListener("click", createRequest);
depositButton.addEventListener("click", depositPayment);
acceptJobButton.addEventListener("click", () => simpleCall("acceptJob", "acceptJob"));
markCompletedButton.addEventListener("click", () => simpleCall("markCompleted", "markCompleted"));
refundOwnerButton.addEventListener("click", () => simpleCall("refundOwner", "refundOwner"));
confirmCompletionButton.addEventListener("click", () => simpleCall("confirmCompletion", "confirmCompletion"));

// React to account / network changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      currentAccount = null;
      accountSpan.textContent = "Not connected";
      currentRoleSpan.textContent = "Unknown";
      [ownerCard, mechanicCard, inspectorCard].forEach(card =>
        card.classList.remove("active-role")
      );
      log("MetaMask disconnected.");
    } else {
      currentAccount = accounts[0];
      accountSpan.textContent = currentAccount;
      log("Account changed: " + currentAccount);
      updateRoleUI();
      if (lastStatus !== null) {
        updateButtonStates(lastStatus);
      }
    }
  });

  window.ethereum.on("chainChanged", (_chainId) => {
    // Hard reload
    window.location.reload();
  });
}

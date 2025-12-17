// ===== KONFIGURACIJA LOKALIAM (GANACHE) TINKLUI =====

// 1) Įdėk čia kontrakto adresą iš Ganache
const CONTRACT_ADDRESS = "0xBf663B7EDa4D780dC28DE13B2f1113c881393590";

// 2) Čia įklijuok pilną ABI iš CarRepairEscrow.json ("abi" masyvas)
// ===== KONFIGURACIJA LOKALIAM (GANACHE) TINKLUI =====

// 2) Čia įklijuok TIK "abi" masyvą, be "contractName" ir be "abi": rakto
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "mechanic",
        "type": "address"
      }
    ],
    "name": "JobAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "mechanic",
        "type": "address"
      }
    ],
    "name": "JobCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "inspector",
        "type": "address"
      }
    ],
    "name": "JobConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PaymentDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "Refunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "RequestCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "inspector",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "mechanic",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "price",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "status",
    "outputs": [
      {
        "internalType": "enum CarRepairEscrow.Status",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_inspector",
        "type": "address"
      }
    ],
    "name": "createRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "markCompleted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confirmCompletion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refundOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


// Tik informacinis labelas loguose, lokaliam tinklui Etherscan nenaudojam
const ETHERSCAN_TX_BASE = "";

// Tikimės dirbti su Ganache tinklu (network id ~5777 arba 1337)
const EXPECTED_CHAIN_ID = 1337;

let provider;
let signer;
let contract;
let currentAccount = null;

// Kontrakto būsena
let contractOwner = null;
let contractMechanic = null;
let contractInspector = null;
let lastStatus = null;

// UI elementai
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

// ===== Pagalbinės funkcijos =====

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  logOutput.textContent = `[${timestamp}] ${message}\n` + logOutput.textContent;
}

function logTx(label, tx) {
  log(`${label} tx hash: ${tx.hash}`);
  if (ETHERSCAN_TX_BASE) {
    log(`Etherscan: ${ETHERSCAN_TX_BASE}${tx.hash}`);
  }
}

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

  [ownerCard, mechanicCard, inspectorCard].forEach(card =>
    card.classList.remove("active-role")
  );

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
  [
    createRequestButton,
    depositButton,
    acceptJobButton,
    markCompletedButton,
    refundOwnerButton,
    confirmCompletionButton
  ].forEach(btn => (btn.disabled = true));

  const role = getCurrentRole();

  // ✅ 1) createRequest galima daryti bet kam, kai NotCreated
  // (owner atsiranda tik po createRequest)
  if (statusNum === 0) {
    createRequestButton.disabled = false;
  }

  // ✅ 2) acceptJob galima daryti bet kam, kai Requested
  // (mechanic atsiranda tik po acceptJob)
  if (statusNum === 1) {
    acceptJobButton.disabled = false;
  }

  // ✅ 3) depositPayment – tik Owner ir tik kai Accepted
  if (role === "Owner" && statusNum === 2) {
    depositButton.disabled = false;
  }

  // ✅ 4) Likę veiksmai jau priklauso nuo rolės, nes rolės tuo metu egzistuoja
  if (role === "Mechanic") {
    if (statusNum === 3) markCompletedButton.disabled = false;
    if (statusNum === 2 || statusNum === 3) refundOwnerButton.disabled = false;
  }

  if (role === "Inspector" && statusNum === 4) {
    confirmCompletionButton.disabled = false;
  }
}



// ===== Prisijungimas su MetaMask (per Ganache) =====

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask nerastas. Įsidiek pluginą.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    currentAccount = accounts[0];
    accountSpan.textContent = currentAccount;

    // ethers v5 Web3Provider – naudos MetaMask RPC (Ganache)
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    networkSpan.textContent = `${network.name || "local"} (${network.chainId})`;

    if (network.chainId !== EXPECTED_CHAIN_ID) {
      log(
        `Dėmesio: prisijungta prie chainId ${network.chainId}, tikimasi ${EXPECTED_CHAIN_ID} (Ganache). Patikrink MetaMask tinklą.`
      );
    } else {
      log("Prisijungta prie lokalaus Ganache tinklo.");
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      log("⚠️ Pirmiausia sukonfigūruok CONTRACT_ADDRESS ir CONTRACT_ABI app.js faile.");
      return;
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    contractAddressDisplay.textContent = CONTRACT_ADDRESS;

    log("Wallet prijungtas. Kontraktas inicializuotas.");
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Klaida jungiantis: " + err.message);
  }
}

// ===== Kontrakto būsenos nuskaitymas =====

async function loadContractState() {
  if (!contract) {
    log("Kontraktas dar neinicijuotas.");
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

    log("Kontrakto būsena atnaujinta.");
  } catch (err) {
    console.error(err);
    log("Klaida skaitant būseną: " + (err.data?.message || err.message));
  }
}

// ===== Veiksmai =====

async function createRequest() {
  if (!contract) return;

  const desc = document.getElementById("descriptionInput").value.trim();
  const priceEth = document.getElementById("priceInput").value.trim();
  const inspectorAddr = document.getElementById("inspectorInput").value.trim();

  if (!desc || !priceEth || !inspectorAddr) {
    alert("Užpildyk aprašymą, kainą ir inspektoriaus adresą.");
    return;
  }

  try {
    const priceWei = ethers.utils.parseEther(priceEth);
    log("Vykdome createRequest...");
    const tx = await contract.createRequest(priceWei, desc, inspectorAddr);
    logTx("createRequest", tx);
    const receipt = await tx.wait();
    log(`createRequest patvirtinta bloke ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Klaida createRequest: " + (err.data?.message || err.message));
  }
}

async function depositPayment() {
  if (!contract) return;

  const amountEth = document.getElementById("depositInput").value.trim();
  if (!amountEth) {
    alert("Įvesk depozito sumą ETH (turi lygiuotis su price).");
    return;
  }

  try {
    const valueWei = ethers.utils.parseEther(amountEth);
    log("Vykdome depositPayment...");
    const tx = await contract.depositPayment({ value: valueWei });
    logTx("depositPayment", tx);
    const receipt = await tx.wait();
    log(`depositPayment patvirtinta bloke ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log("Klaida depositPayment: " + (err.data?.message || err.message));
  }
}

async function simpleCall(methodName, label) {
  if (!contract) return;

  try {
    log(`Vykdome ${label}...`);
    const tx = await contract[methodName]();
    logTx(label, tx);
    const receipt = await tx.wait();
    log(`${label} patvirtinta bloke ${receipt.blockNumber}`);
    await loadContractState();
  } catch (err) {
    console.error(err);
    log(`Klaida ${label}: ` + (err.data?.message || err.message));
  }
}

// ===== Event listeneriai =====

connectButton.addEventListener("click", connectWallet);
refreshButton.addEventListener("click", loadContractState);

createRequestButton.addEventListener("click", createRequest);
depositButton.addEventListener("click", depositPayment);
acceptJobButton.addEventListener("click", () => simpleCall("acceptJob", "acceptJob"));
markCompletedButton.addEventListener("click", () => simpleCall("markCompleted", "markCompleted"));
refundOwnerButton.addEventListener("click", () => simpleCall("refundOwner", "refundOwner"));
confirmCompletionButton.addEventListener("click", () => simpleCall("confirmCompletion", "confirmCompletion"));

if (window.ethereum) {
  window.ethereum.on("accountsChanged", accounts => {
    if (accounts.length === 0) {
      currentAccount = null;
      accountSpan.textContent = "Not connected";
      currentRoleSpan.textContent = "Unknown";
      [ownerCard, mechanicCard, inspectorCard].forEach(card =>
        card.classList.remove("active-role")
      );
      log("MetaMask atsijungė.");
    } else {
      currentAccount = accounts[0];
      accountSpan.textContent = currentAccount;
      log("Paskyra pakeista: " + currentAccount);
      updateRoleUI();
      if (lastStatus !== null) updateButtonStates(lastStatus);
    }
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

# Išmaniosios sutarties decentralizuota aplikacija pasiremiant autoremonto escrow modeliu

Decentralizuota aplikacija (DApp), realizuojanti automobilio remonto escrow modelį Ethereum Sepolia tinkle.

Projektą sudaro:
- Išmanioji sutartis (CarRepairEscrow.sol)
- Front-end (HTML + CSS + JavaScript + Ethers.js)
- Integracija su MetaMask

Tikslas – užtikrinti saugų trijų šalių bendradarbiavimą (Owner, Mechanic, Inspector), kai mokėjimas laikomas išmaniojoje sutartyje ir išmokamas tik patvirtinus darbų atlikimą.

---

## Verslo modelis

### Dalyviai

**Owner (automobilio savininkas)**  
- Kuria remonto užklausą  
- Perveda mokėjimą į escrow  

**Mechanic (mechanikas / servisas)**  
- Priima darbą  
- Pažymi, kad darbas baigtas  
- Gali grąžinti lėšas savininkui (refund)  

**Inspector (inspektorius)**  
- Patvirtina, kad remontas atliktas  
- Inicijuoja lėšų išmokėjimą mechanikui  

---

## Tipinis scenarijus

1. Owner sukuria remonto užklausą  
2. Mechanic priima darbą  
3. Owner perveda mokėjimą į escrow  
4. Mechanic pažymi, kad darbas atliktas  
5. Inspector patvirtina atlikimą  
6. Mechanic gauna lėšas  

Papildoma šaka: Mechanic gali grąžinti lėšas Owner’iui (`refundOwner()`), jei darbas atšaukiamas.

---

## Išmanioji sutartis

### Būsenos (Status enum)

- NotCreated  
- Requested  
- Accepted  
- Paid  
- Completed  
- Confirmed  

### Funkcijos

- createRequest(price, description, inspector)  
- acceptJob()  
- depositPayment()  
- markCompleted()  
- confirmCompletion()  
- refundOwner()  

---

## Būsenų diagrama

```mermaid
stateDiagram-v2
    [*] --> NotCreated

    NotCreated --> Requested: createRequest()
    Requested --> Accepted: acceptJob()
    Accepted --> Paid: depositPayment()
    Paid --> Completed: markCompleted()
    Completed --> Confirmed: confirmCompletion()

    Accepted --> Requested: refundOwner()
    Paid --> Requested: refundOwner()
```

---

## Sekų diagrama

```mermaid
sequenceDiagram
    participant Owner
    participant Mechanic
    participant Inspector
    participant Contract as CarRepairEscrow

    Owner->>Contract: createRequest()
    Contract-->>Owner: status = Requested

    Mechanic->>Contract: acceptJob()
    Contract-->>Mechanic: status = Accepted

    Owner->>Contract: depositPayment()
    Contract-->>Owner: status = Paid

    Mechanic->>Contract: markCompleted()
    Contract-->>Mechanic: status = Completed

    Inspector->>Contract: confirmCompletion()
    Contract-->>Mechanic: payout
    Contract-->>Inspector: status = Confirmed

    alt Atšaukimas
        Mechanic->>Contract: refundOwner()
        Contract-->>Owner: refund
        Contract-->>Mechanic: status = Requested
    end
```

---

## Front-end (DApp)

Front-end aplikacija leidžia vartotojui sąveikauti su išmaniąja sutartimi per MetaMask ir Ethers.js.

### Funkcionalumas

- MetaMask prisijungimas  
- Automatinis tinklo patikrinimas (reikalauja Sepolia)  
- Vartotojo rolės nustatymas (Owner / Mechanic / Inspector)  
- Dinaminis mygtukų aktyvavimas pagal rolę ir būseną  
- Dabartinės sutarties būsenos rodymas  
- Būsenų stepper vizualizacija  
- Transakcijų log’ai su nuorodomis į Etherscan  

---

## Paleidimas lokaliai

### 1. Įrašyti kontrakto adresą ir ABI į `app.js`

```javascript
const CONTRACT_ADDRESS = "0x...";  
const CONTRACT_ABI = [ /* ABI JSON */ ];
```

### 2. Paleisti lokalų serverį

```bash
python3 -m http.server 8000
```

Tada naršyklėje atidaryti:  
http://localhost:8000

---

## Testavimo scenarijai

### Owner testai
- createRequest – sukuria užklausą  
- depositPayment – perveda ETH į escrow  

### Mechanic testai
- acceptJob – priima darbą  
- markCompleted – pažymi atlikimą  
- refundOwner – grąžina ETH savininkui  

### Inspector testai
- confirmCompletion – patvirtina ir išmoka lėšas  

---

## Etherscan log'ai

Kai kontraktas bus deploy’intas į Sepolia tinklą, transakcijų log'us galima tikrinti čia:

https://sepolia.etherscan.io/tx/<hash>

Rodoma:
- įvykdytos funkcijos  
- event'ai  
- transakcijos siuntėjas  
- "gas" sunaudojimas  
- grąžinti ar išmokėti ETH  

---

## Ekrano nuotraukos
Testavimas Remix <br />
<img width="260" height="780" alt="Screenshot 2025-12-09 195721" src="https://github.com/user-attachments/assets/e5c2c347-457c-4ac8-94a8-3c9eb5b167f1" /> <br />
Įrankiai <br />
<img width="299" height="166" alt="Screenshot 2025-12-09 223422" src="https://github.com/user-attachments/assets/63674c42-a582-4733-ac0e-b9454ea477cc" /> <br />
Ganache account dashboard <br />
<img width="1193" height="796" alt="Screenshot 2025-12-09 224742" src="https://github.com/user-attachments/assets/448a783c-979f-4810-878b-f79a67e89f55" /> <br />
truffle-config.js <br />
<img width="996" height="788" alt="Screenshot 2025-12-09 225018" src="https://github.com/user-attachments/assets/7221351a-3741-4c00-b607-91076505d547" /> <br />
Local contract deployment <br />
<img width="685" height="566" alt="Screenshot 2025-12-09 225712" src="https://github.com/user-attachments/assets/c96ef25e-2eb7-4fc3-b56c-936ef979ffb3" /> <br />
Ganache deployed contract view <br />
<img width="1172" height="794" alt="Screenshot 2025-12-09 231222" src="https://github.com/user-attachments/assets/6fdc93f1-9bed-499d-8e42-1d1ed474f66f" /> <br />
Sepolia testnet config in metamask <br />
<img width="370" height="603" alt="Screenshot 2025-12-09 232622" src="https://github.com/user-attachments/assets/628eecdd-6c86-4be3-b254-86b121f7aaa1" /> <br />
Token issue in Sepolia faucet <br />
<img width="601" height="673" alt="Screenshot 2025-12-09 234251" src="https://github.com/user-attachments/assets/98b72d1c-92f4-448d-a95f-3f46699e4ae5" /> <br />
Token issue in Sepolia faucet <br />
<img width="1654" height="760" alt="Screenshot 2025-12-09 235743" src="https://github.com/user-attachments/assets/d4829cfb-6038-42fc-a8eb-4b4571846c5a" /> <br />
Polygon Amoy testnet config in metamask <br />
<img width="494" height="609" alt="Screenshot 2025-12-10 004252" src="https://github.com/user-attachments/assets/065204ac-e958-478a-b0a5-d861ae5e50dd" /> <br />
Recieved POL from faucet <br />
<img width="804" height="161" alt="Screenshot 2025-12-10 002213" src="https://github.com/user-attachments/assets/6e58d5da-ff61-4df3-aafb-85a54f6a3e25" /> <br />
Truffle dashboard (after initiating deployment) <br />
<img width="1707" height="550" alt="Screenshot 2025-12-10 003428" src="https://github.com/user-attachments/assets/0e273389-7bb8-4236-8501-d75c1753d9d7" /> <br />
Confirmation of deployment inside dashboard (metamask popup) <br />
<img width="374" height="596" alt="Screenshot 2025-12-10 003441" src="https://github.com/user-attachments/assets/e51608f1-f9bb-4325-92bf-4f8c837429da" /> <br />
Our deployed contract on Amoy testnet explorer
<img width="1299" height="738" alt="Screenshot 2025-12-10 010622" src="https://github.com/user-attachments/assets/0b845718-6e3b-4294-b639-2b9a52c6f920" /> <br />
Testing deployed contract on amoy issue (tsg neuztenka tokens kiek duoda)
<img width="1454" height="937" alt="Screenshot 2025-12-10 015230" src="https://github.com/user-attachments/assets/bf9841aa-d89b-462f-976c-46d451051334" /> <br />

Trumpai apibendrinant: Kontraktui sukurti naudotas Remix IDE, is pradziu testuojama per pati Remix naudojant ju VM, veliau per Truffle ir Ganache lokaliai. Tada bandziau paleisti i testnet (Sepolia), bet dėl pasikeitusios tvarkos neįmanoma gauti token'ų iš faucetų (reikalauja turėti kažkiek ETH wallete, į kurį norimą siųsti). Galiausiai pasirinktas Polygon Amoy testnet. Deja, šis testnet nėra toks efektyvus taip Sepolia, nes labai greitai pasibaigia token'ai (vien deployment kontrakto sunaudoja beveik viską, lieka tik view funkcijoms). Kontraktas vis tiek buvo paleistas ir patestuotas, tačiau front-endui bus naudojamas lokalus tinklas dėl šio naujo apribojimo. Prie kiekvienos foto palieku komentarą, kuris žingsnis tai buvo, integruosi šitą į readme savo nuožiūra :)
## Išvada

Šis projektas demonstruoja, kaip išmanioji sutartis gali pakeisti tradicinį tarpininko vaidmenį realiame verslo scenarijuje. Automatinė escrow logika užtikrina:

- skaidrumą,  
- saugumą,  
- decentralizuotą sprendimų priėmimą,  
- aiškiai apibrėžtas roles,  
- patikimą lėšų laikymą iki užduoties įvykdymo.

DApp suteikia patogią vartotojo sąsają visam procesui išbandyti Ethereum Sepolia testiniame tinkle.

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

## Ekrano nuotraukos ir testavimo eiga

Šiame skyriuje pateikiamos pagrindinės projekto kūrimo, testavimo ir diegimo stadijos, iliustruojamos ekrano nuotraukomis. Jos atspindi visą išmaniosios sutarties kūrimo ciklą – nuo pirminio testavimo „Remix IDE“ aplinkoje iki bandymų diegti kontraktą į viešus testinius tinklus.

---

### Išmaniosios sutarties testavimas naudojant Remix IDE

Pirmasis etapas buvo išmaniosios sutarties kūrimas ir testavimas naudojant Remix IDE. Šioje aplinkoje sutartis buvo kompiliuojama ir testuojama naudojant „Remix VM“, leidžiant greitai patikrinti pagrindinę logiką, būsenų perėjimus ir funkcijų veikimą be išorinių priklausomybių.

Testavimo metu buvo:
- tikrinamos `createRequest`, `acceptJob`, `depositPayment` ir kitos funkcijos;
- stebimi būsenų (`status`) pasikeitimai;
- tikrinami `event` pranešimai.

<img width="260" height="780" alt="Screenshot 2025-12-09 195721" src="https://github.com/user-attachments/assets/e5c2c347-457c-4ac8-94a8-3c9eb5b167f1" />

---

### Naudojami įrankiai

Žemiau pateikiama ekrano nuotrauka su pagrindiniais projekto metu naudotais įrankiais:
- **Remix IDE** – išmaniosios sutarties kūrimui ir pirminiam testavimui;
- **Truffle** – kontrakto diegimui ir migracijoms;
- **Ganache** – lokalaus „Ethereum“ tinklo emuliacijai;
- **MetaMask** – piniginės ir transakcijų pasirašymo integracijai;
- **Ethers.js** – front-end sąsajai su išmaniąja sutartimi.

<img width="299" height="166" alt="Screenshot 2025-12-09 223422" src="https://github.com/user-attachments/assets/63674c42-a582-4733-ac0e-b9454ea477cc" />

---

### Ganache paskyrų ir lokalaus tinklo peržiūra

Šiame etape buvo naudojamas Ganache įrankis, leidžiantis sukurti lokalų „Ethereum“ tinklą su iš anksto sugeneruotomis paskyromis ir ETH likučiais. Tai leido saugiai ir greitai testuoti kontraktą be realių lėšų naudojimo.

Ekrano nuotraukoje matomas:
- automatiškai sugeneruotų paskyrų sąrašas;
- jų ETH likučiai;
- tinklo parametrai (RPC URL, Chain ID).

<img width="1193" height="796" alt="Screenshot 2025-12-09 224742" src="https://github.com/user-attachments/assets/448a783c-979f-4810-878b-f79a67e89f55" />

---

### Truffle konfigūracija

Žemiau pateikiamas `truffle-config.js` failo vaizdas, kuriame aprašyta:
- lokalaus tinklo (`development`) konfigūracija;
- RPC adresas;
- naudojamas kompiliatoriaus („Solidity“) versijos nustatymas.

Šis failas buvo būtinas sėkmingam kontrakto diegimui naudojant „Truffle“.

<img width="996" height="788" alt="Screenshot 2025-12-09 225018" src="https://github.com/user-attachments/assets/7221351a-3741-4c00-b607-91076505d547" />

---

### Išmaniosios sutarties diegimas lokaliame tinkle

Šiame etape kontraktas buvo sėkmingai deploy’intas į Ganache lokalų tinklą naudojant `truffle migrate`. Tai leido:
- patikrinti migracijų scenarijų veikimą;
- gauti realų kontrakto adresą;
- vėliau šį adresą naudoti front-end aplikacijoje.

<img width="685" height="566" alt="Screenshot 2025-12-09 225712" src="https://github.com/user-attachments/assets/c96ef25e-2eb7-4fc3-b56c-936ef979ffb3" />

---

### Deploy’into kontrakto peržiūra Ganache aplinkoje

Šioje ekrano nuotraukoje matomas jau sėkmingai deploy’intas kontraktas Ganache sąsajoje, su:
- kontrakto adresu;
- transakcijų skaičiumi;
- būsena „Deployed“.

<img width="1172" height="794" alt="Screenshot 2025-12-09 231222" src="https://github.com/user-attachments/assets/6fdc93f1-9bed-499d-8e42-1d1ed474f66f" />

---

### Bandymas naudoti Sepolia testnet

Toliau buvo bandoma perkelti kontraktą į Ethereum Sepolia testnet, sukonfigūruojant šį tinklą MetaMask piniginėje.

<img width="370" height="603" alt="Screenshot 2025-12-09 232622" src="https://github.com/user-attachments/assets/628eecdd-6c86-4be3-b254-86b121f7aaa1" />

Tačiau bandant gauti testinių ETH iš Sepolia faucet išryškėjo nauji apribojimai:
- faucet reikalauja, kad piniginė jau turėtų nedidelį kiekį ETH;
- tai apsunkina naujų projektų testavimą.

<img width="601" height="673" alt="Screenshot 2025-12-09 234251" src="https://github.com/user-attachments/assets/98b72d1c-92f4-448d-a95f-3f46699e4ae5" />

<img width="1654" height="760" alt="Screenshot 2025-12-09 235743" src="https://github.com/user-attachments/assets/d4829cfb-6038-42fc-a8eb-4b4571846c5a" />

---

### Polygon Amoy testnet alternatyva

Dėl Sepolia tinklo apribojimų buvo pasirinktas **Polygon Amoy testnet** kaip alternatyva. Žemiau pateikiama MetaMask tinklo konfigūracija ir gautų testinių POL žetonų vaizdas.

<img width="494" height="609" alt="Screenshot 2025-12-10 004252" src="https://github.com/user-attachments/assets/065204ac-e958-478a-b0a5-d861ae5e50dd" />

<img width="804" height="161" alt="Screenshot 2025-12-10 002213" src="https://github.com/user-attachments/assets/6e58d5da-ff61-4df3-aafb-85a54f6a3e25" />

---

### Kontrakto diegimas per Truffle Dashboard

Toliau pateikiamos ekrano nuotraukos, rodančios:
- Truffle Dashboard inicijavimą;
- diegimo transakcijos patvirtinimą per MetaMask;
- sėkmingai deploy’intą kontraktą Polygon Amoy testnet „block explorer’yje“.

<img width="1707" height="550" alt="Screenshot 2025-12-10 003428" src="https://github.com/user-attachments/assets/0e273389-7bb8-4236-8501-d75c1753d9d7" />

<img width="374" height="596" alt="Screenshot 2025-12-10 003441" src="https://github.com/user-attachments/assets/e51608f1-f9bb-4325-92bf-4f8c837429da" />

<img width="1299" height="738" alt="Screenshot 2025-12-10 010622" src="https://github.com/user-attachments/assets/0b845718-6e3b-4294-b639-2b9a52c6f920" />

---

### Testavimo metu aptikta problema

Galiausiai testavimo metu buvo susidurta su problema, kai testinių žetonų kiekis buvo nepakankamas pilnam kontrakto testavimui, nes vienas diegimas sunaudoja didžiąją dalį suteikiamų resursų.

<img width="1454" height="937" alt="Screenshot 2025-12-10 015230" src="https://github.com/user-attachments/assets/bf9841aa-d89b-462f-976c-46d451051334" />

---

### Testavimo apibendrinimas

Apibendrinant galima teigti, kad:
- išmanioji sutartis sėkmingai sukurta ir ištestuota lokaliai;
- viešų testnet tinklų (Sepolia, Polygon Amoy) naudojimas susidūrė su praktiniais apribojimais;
Dėl šių priežasčių front-end aplikacijos demonstracijai ir testavimui pasirinktas lokalus Ganache tinklas, kuris užtikrina stabilų ir pilną funkcionalumą be papildomų kaštų ar apribojimų.

### DApp veikimo demonstracija    
<img width="1996" height="1156" alt="image" src="https://github.com/user-attachments/assets/c9ffd8f3-ce52-4e12-94f5-0843353a54b8" />

Decentralizuota aplikacija (DApp) šiame projekte veikia kaip naudotojo sąsaja, leidžianti
verslo modelio dalyviams (Owner, Mechanic, Inspector) sąveikauti su išmaniąja sutartimi
be tiesioginio darbo su blockchain įrankiais. Visa pagrindinė verslo logika,
būsenų valdymas ir mokėjimų kontrolė yra realizuoti išmaniojoje sutartyje,
o front-end dalis veikia tik kaip tarpinė sąsaja tarp naudotojo ir blockchain tinklo.
Mūsų aplikacija taip pat turi log'ą, integruotą į sąsają, kad būtų lengva identifikuot pasitaikiusias klaidas.

<img width="1807" height="1040" alt="image" src="https://github.com/user-attachments/assets/da5f883e-cd39-4f6d-ad0b-efa42d571fda" />





## Galutinės išvados

Šis projektas demonstruoja, kaip išmanioji sutartis gali pakeisti tradicinį tarpininko vaidmenį realiame verslo scenarijuje. Automatinė escrow logika užtikrina:

- skaidrumą,  
- saugumą,  
- decentralizuotą sprendimų priėmimą,  
- aiškiai apibrėžtas roles,  
- patikimą lėšų laikymą iki užduoties įvykdymo.

DApp suteikia patogią vartotojo sąsają visam procesui išbandyti Ethereum Sepolia testiniame tinkle.

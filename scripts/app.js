// szelektáljuk a html elemeket
const newGameButton = document.querySelector('.js-new-game-button');
const playerCardsContainer = document.querySelector('.js-player-cards-container');
const chipCountContainer = document.querySelector('.js-chip-count-container');
const potContainer = document.querySelector('.js-pot-container');
const betArea = document.querySelector('.js-bet-area');
const betSlider = document.querySelector('#bet-amount');
const betSliderValue = document.querySelector('.js-slider-value');
const betButton = document.querySelector('.js-bet-button');

//* program állapota
let {
    deckId,   // Létrehozunk egy globális változót a deck id tárolására. Tudatosan nem adunk neki értéket (null).
    playerCards,   // játékos lapjai
    playerChips,   // játékos zsetonjai
    computerCards,  // számítógép lapjai
    computerChips,  // számítógép zsetonjai
    playerBetPlaced, // játékos már licitált
    pot   // kassza értéke
} = getinitalState();


function getinitalState() {
    return {
        deckId: null,
        playerCards: [],
        playerChips: 100,
        computerChips: 100,
        playerBetPlaced: false,
        pot: 0
    };
}

function initialize() {
    ({
        deckId,
        playerCards,
        playerChips,
        computerChips,
        playerBetPlaced,
        pot
    } = getinitalState());
}




// tud e licitálni
function canBet() {
    return playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false;
};

//slider renderelése
function renderSlider() {
    if (canBet()) {
        betArea.classList.remove('invisible');
        betSlider.setAttribute('max', playerChips);
        betSliderValue.innerText = betSlider.value;
    } else {
        betArea.classList.add('invisible')
    }
};


function shouldComputerCall() {
    if (computerCards.length !== 2) return false; // extra védelem ha több kártya lánne mint kettő
    const card1Code = computerCards[0].code;
    const card2Code = computerCards[1].code;
    const card1Value = card1Code[0];
    const card2Value = card2Code[0];
    const card1Suit = card1Code[1];
    const card2Suit = card2Code[1];

    return card1Value === card2Value ||
        ['0', 'J', 'Q', 'K', 'A'].includes(card1Value) ||
        ['0', 'J', 'Q', 'K', 'A'].includes(card2Value) ||
        (
            card1Suit === card2Suit &&
            Math.abs(Number(card1Value) - Number(card2Value)) <= 2
        );
};

function computerMoveAfterBet() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(data => data.json()) // kapott adatot json formára alakítjuk. 
        .then(response => {
            computerCards = response.cards;  // a kapott kártyákat elmentjük a változóba (tömb)
            alert(shouldComputerCall() ? 'Call' : 'Fold');
            console.log(computerCards);
            // render()
        });
};


const bet = () => {
    const betValue = Number(betSlider.value);
    pot += betValue;  // pothoz adjuk a bet értékét
    playerChips -= betValue;  // levonjuk a játékos zsetonjaiból a bet értékét
    playerBetPlaced = true;   // játékos licitált 

    // újrarenderelés
    render();

    // ellenfél reakciója
    computerMoveAfterBet();
};



// játékos lapjainak renderelése
function renderPlayerCards() {
    let html = ""; // üres változó létrehozása

    // végig megyünk a tömb elemein
    for (let card of playerCards) {
        // hozzáadjuk a változóhoz a template literallal előállított tartalmat. 
        html += `<img src="${card.image}" alt="${card.code}" />`
    };

    // rendereljük 
    playerCardsContainer.innerHTML = html;
};


// Zsetonok renderelése
function renderChips() {
    chipCountContainer.innerHTML = `
        <div class="chip-count">Player: ${playerChips}</div>
        <div class="chip-count">Computer: ${computerChips}</div>
    `;
};


// kassza renderelése
function renderPot() {
    potContainer.innerHTML = `
        <div class="chip-count">Pot: ${pot}</div>
`
};



// Fő renderelés
function render() {
    renderPlayerCards();
    renderChips();
    renderPot();
    renderSlider();
};




function drawAndRenderPlayersCard() {
    if (deckId === null) return; // ha null akkor kilépünk a függvényből

    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(data => data.json()) // kapott adatot json formára alakítjuk. 
        .then(response => {
            playerCards = response.cards;  // a kapott kártyákat elmentjük a változóba (tömb)
            render()
        });
};


function postBlinds() {
    playerChips -= 1;
    computerChips -= 2;
    pot += 3;
    render(); // frissítés
};



//leosztás indítása
function startHand() {
    postBlinds(); // vak tétek adminisztrálása
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then(data => data.json()) // kapott adatot json formára alakítjuk. 
        .then(response => {
            deckId = response.deck_id; // elmentjük az id-t
            drawAndRenderPlayersCard();
        })
};







// Küldünk egy kérést az API-nak ahol keverünk egy paklit és megkapjuk a deck Id-t és elmentkük a deckId változóba
function startGame() {
    initialize();  // alapállapotba hozás
    startHand();  // leosztás
};







// Esemenyfigyelőt adunk a gombra, klikk eseményre lefut a  startGame függvény
newGameButton.addEventListener('click', startGame);
betSlider.addEventListener('change', render);
betButton.addEventListener('click', bet);
initialize();
render();



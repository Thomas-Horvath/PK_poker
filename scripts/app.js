// szelektáljuk a html elemeket
const newGameButton = document.querySelector('.js-new-game-button');
const playerCardsContainer = document.querySelector('.js-player-cards-container');
const chipCountContainer = document.querySelector('.js-chip-count-container');
const potContainer = document.querySelector('.js-pot-container');
const betArea = document.querySelector('.js-bet-area');
const betSlider = document.querySelector('#bet-amount');


//* program állapota
let {
    deckId,   // Létrehozunk egy globális változót a deck id tárolására. Tudatosan nem adunk neki értéket (null).
    playerCards,   // kártya változó létrehozása.
    playerChips,   // játékos zsetonjai
    computerChips,  // számítógép zsetonjai
    pot   // kassza értéke
} = getinitalState();


function getinitalState() {
    return {
        deckId: null,
        playerCards: [],
        playerChips: 100,
        computerChips: 100,
        pot: 0
    };
}

function initialize() {
    deckId = null;
    playerCards = [];
    playerChips = 100;
    computerChips = 100;
    pot = 0;
}

// tud e licitálni
function canBet() {
    return playerCards.length === 2 && playerChips > 0 && pot === 0;
}

//slider renderelése
function renderSlider() {
    if (canBet()) {
        betArea.classList.remove('invisible')
    } else {
        betArea.classList.add('invisible')
    }
}


// Esemenyfigyelőt adunk a gombra, klikk eseményre lefut a  startGame függvény
newGameButton.addEventListener('click', startGame);
render();


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
}


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
}


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
        }
        )
};



// Küldünk egy kérést az API-nak ahol keverünk egy paklit és megkapjuk a deck Id-t és elmentkük a deckId változóba
function startGame() {
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then(data => data.json()) // kapott adatot json formára alakítjuk. 
        .then(response => {
            deckId = response.deck_id; // elmentjük az id-t
            drawAndRenderPlayersCard();
        })
};
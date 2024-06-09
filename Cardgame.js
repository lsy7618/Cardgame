
const CARD_IMG = ['number-1', 'number-2', 'number-3', 'number-4', 'number-5', 'number-6', 'number-7', 'number-8', 'number-9', 'number-10', 'number-11', 'number-12', 'number-13', 'number-14', 'number-15', 'number-16'];
const MAX_BOARD_SIZE = 15; //최대 카드수
let boardSize = 5; // 처음 스테이지의 카드 수
let stage = 1; // 게임 스테이지
let time = 60; // 남은 시간
let timer = null; // 타이머 변수 초기화
let isFlip = false; // 카드 뒤집기 가능 여부
let currentCardIndex = 0; // 카드 인덱스
let life = 3; // 게임 목숨
let cardDeck = [];

// 게임 시작
function startGame() {
    // 스테이지에 따라 카드 수 설정
    boardSize = stage == 1 ? 5 : (stage == 2 ? 10 : 15);

    // 카드 덱 생성
    makeCardDeck();

    // 카드 화면에 세팅
    settingCardDeck();

    // 최초 1회 전체 카드 보여줌
    showCardDeck();
}

// 게임 재시작
function restartGame() {
    initGame();
    initScreen();
    startGame();
}

// 게임 종료
function stopGame() {
    clearInterval(timer); // 타이머 중지
    showGameResult();
}

// 게임 설정 초기화
function initGame() {
    stage = 1;
    time = 60;
    isFlip = false;
    currentCardIndex = 0;
    cardDeck = [];
    life = 3;
}

// 게임 화면 초기화
function initScreen() {
    gameBoard.classList.remove('stage-1', 'stage-2', 'stage-3');
    gameBoard.innerHTML = '';
    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;
    playerlife.innerHTML = life;
    playerTime.classList.remove("blink");
    void playerTime.offsetWidth;
    playerTime.classList.add("blink");
}

// 스테이지 클리어
const board = document.getElementsByClassName("board")[0];
const stageClearImg = document.getElementsByClassName("stage-clear")[0];

function clearStage() {
    clearInterval(timer); // 타이머 중지
    stage++; // 스테이지 값 1 추가
    life = 3;
    time = 60;
    cardDeck = [];
    currentCardIndex = 0; // 다음 스테이지를 위해 인덱스 초기화

    stageClearImg.classList.add("show");

    // 2초 후 다음 스테이지 시작
    setTimeout(() => {
        stageClearImg.classList.remove("show");
        initScreen();
        startGame();
    }, 2000);
}

// 게임 타이머 시작
function startTimer() {
    clearInterval(timer); // 기존 타이머 정리
    timer = setInterval(() => {
        playerTime.innerHTML = --time;

        if (time === 0) {
            clearInterval(timer);
            stopGame();
        }
    }, 1000);
}

// 카드 덱 생성
function makeCardDeck() {
    let randomNumberArr = [];
    let maxNumber = stage == 1 ? 5 : (stage == 2 ? 10 : 15);

    for (let i = 0; i < boardSize; i++) {
        let randomNumber = getRandom(maxNumber, 0);

        if (randomNumberArr.indexOf(randomNumber) === -1) {
            randomNumberArr.push(randomNumber);
        } else {
            i--;
        }
    }

    shuffle(randomNumberArr);

    for (let i = 0; i < boardSize; i++) {
        cardDeck.push({card: CARD_IMG[randomNumberArr[i]], isOpen: false, isMatch: false});
    }

    return cardDeck;
}

// 카드 섞기
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// 난수 생성
function getRandom(max, min) {
    return parseInt(Math.random() * (max - min)) + min;
}

// 카드 화면에 세팅
const gameBoard = document.getElementsByClassName("game__board")[0];
const cardBack = document.getElementsByClassName("card__back");
const cardFront = document.getElementsByClassName("card__front");

function settingCardDeck() {
    gameBoard.innerHTML = ''; // 화면 초기화
    for (let i = 0; i < boardSize; i++) {
        gameBoard.innerHTML +=
        `
            <div class="card" data-id="${i}" data-card="${cardDeck[i].card}">
                <div class="card__back"></div>
                <div class="card__front"></div>
            </div>
        `;
    }

    for (let i = 0; i < boardSize; i++) {
        cardFront[i].style.backgroundImage = `url('Cardimg/${cardDeck[i].card}.png')`;
    }
}

// 전체 카드 보여주는 함수
function showCardDeck() {
    let cnt = 0;
    
    let showCardPromise = new Promise((resolve, reject) => {
        let showCardTimer = setInterval(() => {
            cardBack[cnt].style.transform = "rotateY(180deg)";
            cardFront[cnt++].style.transform = "rotateY(0deg)";

            if (cnt === cardDeck.length) {
                clearInterval(showCardTimer);
                resolve();
            }
        }, 200);
    });

    showCardPromise.then(() => {
        setTimeout(hideCardDeck, 2000);
    });
}

// 전체 카드 숨기는 함수
function hideCardDeck() {
    for (let i = 0; i < cardDeck.length; i++) {
        cardBack[i].style.transform = "rotateY(0deg)";
        cardFront[i].style.transform = "rotateY(-180deg)";
    }
    // 전체 카드 숨기고 0.1초 뒤 isFlip = true, 게임 타이머 시작
    setTimeout(() => {
        isFlip = true;
        startTimer();
    }, 100);
}

// 카드 클릭 이벤트
gameBoard.addEventListener("click", function(e) {
    if (isFlip === false) {
        return;
    }

    if (e.target.parentNode.className === "card") {
        let clickCardId = e.target.parentNode.dataset.id;

        if (cardDeck[clickCardId].isOpen === false) {
            openCard(clickCardId);
        }
    }
});

// 카드 오픈
function openCard(id) {
    cardBack[id].style.transform = "rotateY(180deg)";
    cardFront[id].style.transform = "rotateY(0deg)";
    cardDeck[id].isOpen = true;
    //카드 순서 확인
    if (parseInt(cardDeck[id].card.split('-')[1]) == currentCardIndex + 1) {
        currentCardIndex++;
        //스테이지 클리어 확인
        if (currentCardIndex == boardSize) {
            clearStage();
        }
    } else {
        setTimeout(() => {
            cardBack[id].style.transform = "rotateY(0deg)";
            cardFront[id].style.transform = "rotateY(180deg)";
            cardDeck[id].isOpen = false;
        }, 800);
        playerlife.innerHTML = --life;
        if (life === 0) {
            stopGame();
        }
    }
}

// 게임 종료 시 출력 문구
const modal = document.getElementsByClassName("modal")[0];

function showGameResult() {
    let resultText = "";

    if (stage > 0 && stage <= 3) {
        resultText = "한 번 더 해볼까요?";
    } 
    modalTitle.innerHTML = `
    <h1 class="modal__content-title--result color-red">
        게임 종료!
    </h1>
    <span class="modal__content-title--stage">
        기록 : <strong>STAGE ${stage}</strong>
    </span>
    <p class="modal__content-title--desc">
        ${resultText}
    </p>
    `;

    modal.classList.add("show");
}

// 모달창 닫으면 게임 재시작
const modalTitle = document.getElementsByClassName("modal__content-title")[0];
const modalCloseButton = document.getElementsByClassName("modal__content-close-button")[0];

modal.addEventListener('click', function(e) {
    if (e.target === modal || e.target === modalCloseButton) {
        modal.classList.remove("show");
        restartGame();
    }
});

const playerTime = document.getElementById("player-time");
const playerStage = document.getElementById("player-stage");
const playerlife = document.getElementById("player-life");

window.onload = function() {
    playerTime.innerHTML = time;
    playerStage.innerHTML = stage;
    playerlife.innerHTML = life;
    startGame();
}
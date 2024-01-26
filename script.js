const turnWaitTime = 750;

var cards;
var selectedCards;
var waiting = false;
var menuShowing = true;

var matches;
var timed;
var countMismatch;
var mismatches;

var inputTimer;
var checkboxTimed;

var timer;
var currentTimer;
var completeTimer;

$(document).ready(function() {
  inputTimer = $("#timer");
  checkboxTimed = $("#timed");

  timedCheckboxChange();
  checkboxTimed.change(function() {
    timedCheckboxChange();
  });
  
  $("#start").click(function() {
    startGame();
  });
  
  $("#reset").click(function() {
    startGame();
  });
  
  $("#menu-expand").click(function() {
    toggleMenu();
  });
  
});

function startGame() {
  if (timed) {
    completeTimer = +inputTimer.val() * 60;
    currentTimer = 0;
    updateTimer();
    $("#timer-display").css("display", "block");
    timer = setInterval(function() {
      currentTimer++;
      updateTimer();
    }, 1000);
  } else {
    $("#timer-display").css("display", "none");
    
    if (timer !== null)
      clearInterval(timer);
  }
  
  if (menuShowing)
    toggleMenu();
  
  countMismatch = $("#mismatch").is(":checked");
  mismatches = 0;

  matches = +$("#matches").val();
  
  var endScreen = $("#end-game");
  endScreen.css("transform", "translateY(-100%)");
  
  setTimeout(function() {
    endScreen.css("display", "none");
    endScreen.removeClass("end-game--won");
    endScreen.removeClass("end-game--lost");
  }, durationToTime(endScreen.css("transitionDuration")));
  
  var playArea = $("#play-area");
  $("div").remove(".card");
  const count = matches * 2;
  
  const colors = [];
  for (let i = 0; i < matches; i++) {
    colors.push(getRandomColor());
  }
  
  const matchOrder = [];
  for (let i = 0; i < count; i++) {
    let match = Math.floor(Math.random() * matches) + 1;
    
    while (getOccurrence(matchOrder, match) >= 2) {
      match = Math.floor(Math.random() * matches) + 1;
    }
    
    matchOrder.push(match);
  }
  
  cards = [];
  selectedCards = [];
  for (let i = 0; i < count; i++) {
    const match = matchOrder[i];
    const card = { 
      id: "card-" + i,
      index: i,
      backgroundColor: colors[match-1],
      match: match,
      matched: false
    };
    
    cards.push(card);
    playArea.append(createCard(card));  
  }
  
  $(".card").click(function() {
    cardSelect($(this));
  });
  
}

function cardSelect(element) {
  const id = element.attr('id');
  const card = findCard(id);
  
  if (!card.matched && selectedCards.length < 2 && !element.hasClass("front-facing")) {
    element.addClass("front-facing");
    selectedCards.push(card.id);

    if (selectedCards.length >= 2) {
      const card1 = findCard(selectedCards[0]);
      const card2 = findCard(selectedCards[1]);

      if (!waiting) {
        waiting = true;
        setTimeout(function() {
          if (card1.match === card2.match) {
            card1.matched = true;
            card2.matched = true;

            $("#" + card1.id).addClass("correct-match");
            $("#" + card2.id).addClass("correct-match");
          } else {        
            $("#"+selectedCards[0]).removeClass("front-facing");      
            $("#"+selectedCards[1]).removeClass("front-facing");
            mismatches++;
          }

          selectedCards = [];
          waiting = false;
          endTurn();
        }, turnWaitTime);
      }
    }
  }
}

function createCard(card) {
  var cardElement = $("<div></div",{id:card.id});
  cardElement.addClass("card");
  
  var cardBack = $("<div></div>");
  cardBack.addClass("card__back");
  
  var cardFront = $("<div></div>");
  cardFront.addClass("card__front");
  cardFront.css("backgroundColor", card.backgroundColor);
  
  var cardMatch = $("<span></span>").text(card.match);
  cardFront.append(cardMatch);
  
  cardElement.append(cardFront, cardBack);
  
  return cardElement;
}

function updateTimer() {
  const remainder = completeTimer - currentTimer;
  var display;

  if (remainder > 60) {
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;
    
    display = `${padTime(minutes)}:${padTime(seconds)}`;
  } else {
    display = remainder;
  }
  
  $("#timer-display").text(display);
  if (currentTimer === completeTimer)
    endGame(false);
}

function endTurn() {
  const notMatched = cards.find((c) => c.matched === false);
  
  if (!notMatched) {
    setTimeout(function() {
      endGame(true);
    }, turnWaitTime);
  }
}

function endGame(won) {
  if (timed) 
    clearInterval(timer);
  
  var endScreen = $("#end-game");
  
  endScreen.children(".end-game__message").text(won ? "Ajoyib" : "Yana o'ynab ko'ring");
  
  var mismatchesText = endScreen.children(".end-game__mismatches")
  if (countMismatch && won)
    mismatchesText.text(mismatches > 0 ? "mos kelmasligi: " + mismatches : "Mukammal O'yin");
  else
    mismatchesText.css("dislay","none");

  endScreen.css("display", "flex");
  setTimeout(function() {
      endScreen.addClass(won ? "end-game--won" : "end-game--lost");
      endScreen.css("transform", "translateY(0)");
  }, 10);
}

function toggleMenu(open = menuShowing) {
  const settings = $("#settings");
  const icon = $("#menu-expand").children(".fa");

  if (menuShowing) {
    settings.removeClass("settings--expanded");

    icon.removeClass("fa-chevron-up");
    icon.addClass("fa-chevron-down");
  } else {
    settings.addClass("settings--expanded");

    icon.removeClass("fa-chevron-down");
    icon.addClass("fa-chevron-up");
  }

  menuShowing = !menuShowing;
}

function padTime(time) {
  const display = "0" + time;
  return display.substring(display.length - 2);
}

function timedCheckboxChange() {  
  timed = checkboxTimed.is(":checked");
  $("#timer-group").css("display", timed === true ? "flex" : "none");
}

function findCard(id) {
  return cards.find((c) => c.id === id);
}

function getOccurrence(array, value) {
  return array.filter((v) => (v === value)).length;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

function durationToTime(duration) {
  const time = duration.substring(0, duration.length - 1);
  return +time * 1000;
}
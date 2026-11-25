// Syv spørgsmål til et idékort. Alle vises én gang, før bunken blandes igen.
(() => {
  const questions = [
    "Er det realistisk?",
    "Findes der alternative veje til målet?",
    "Kan projektet udføres mere enkelt og med færre midler?",
    "Kan vi reducere kompleksiteten?",
    "Hvad er vores overordnede mål?",
    "Hvad er behovet?",
    "Hvad siger vores data?",
  ];

  const button = document.getElementById("idea-deck-draw");
  const card = document.querySelector(".idea-deck-card");
  const question = document.getElementById("idea-deck-question");
  const counter = document.getElementById("idea-deck-count");

  if (!button || !card || !question || !counter) return;

  function shuffled(indices) {
    const result = [...indices];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  let currentIndex = 0; // Det første spørgsmål står allerede i HTML'en.
  let remaining = shuffled([1, 2, 3, 4, 5, 6]);
  let shownThisRound = 1;

  button.addEventListener("click", () => {
    if (!remaining.length) {
      remaining = shuffled(questions.map((_, index) => index));
      // Undgå det samme spørgsmål to gange lige efter hinanden ved ny blanding.
      if (remaining[remaining.length - 1] === currentIndex) {
        [remaining[0], remaining[remaining.length - 1]] =
          [remaining[remaining.length - 1], remaining[0]];
      }
      shownThisRound = 0;
    }

    const nextIndex = remaining.pop();
    shownThisRound++;
    button.disabled = true;
    card.classList.add("is-changing");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      currentIndex = nextIndex;
      question.textContent = questions[currentIndex];
      counter.textContent = `${String(shownThisRound).padStart(2, "0")} / 07`;
      card.classList.remove("is-changing");
      button.disabled = false;
    }, reduceMotion ? 0 : 180);
  });
})();

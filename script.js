const steps = Array.from(document.querySelectorAll("[data-step]"));
const dots = Array.from(document.querySelectorAll("[data-dot]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  currentStep: "hero",
  meterStarted: false,
  quizIndex: 0,
  resultStarted: false,
  celebrated: false,
};

const quizQuestions = [
  {
    question: "qual o nível de autorização para a nic sair comigo?",
    answers: ["autorizado", "muito autorizado", "autorizado com urgência"],
  },
  {
    question: "o erick merece um date?",
    answers: ["talvez sim", "sim, tadinho", "sim, ele até fez um site"],
  },
  {
    question: "qual o melhor tratamento para saudade acumulada?",
    answers: ["conversar", "sair pra comer alguma coisa", "datezinho fofo"],
  },
  {
    question: "a nic aceita desbloquear a próxima fase?",
    answers: ["sim", "óbvio", "vai, desbloqueia logo"],
  },
];

const meterMessages = [
  { at: 0, text: "tudo normal" },
  { at: 27, text: "pensando nela" },
  { at: 58, text: "situação ficando séria" },
  { at: 87, text: "saudade crítica" },
  { at: 100, text: "emergência de date" },
];

const systemMessages = [
  "analisando respostas...",
  "verificando nível de fofura...",
  "consultando o coração do sistema...",
  "gerando diagnóstico final...",
];

const meterPercent = document.querySelector("#meterPercent");
const meterMessage = document.querySelector("#meterMessage");
const meterFill = document.querySelector("#meterFill");
const meterProgress = document.querySelector("#meterProgress");
const meterResult = document.querySelector("#meterResult");
const diagnosticButton = document.querySelector("[data-action='diagnostic']");
const quizProgress = document.querySelector("#quizProgress");
const quizQuestion = document.querySelector("#quizQuestion");
const answers = document.querySelector("#answers");
const quizCard = document.querySelector("#quizCard");
const resultTitle = document.querySelector("#resultTitle");
const loaderRing = document.querySelector(".loader-ring");
const systemLines = document.querySelector("#systemLines");
const resultGifFrame = document.querySelector("#resultGifFrame");
const compatibilityResult = document.querySelector("#compatibilityResult");
const showInviteButton = document.querySelector("[data-action='showInvite']");
const softMessage = document.querySelector("#softMessage");
const celebrationLayer = document.querySelector("#celebrationLayer");
const ambientParticles = document.querySelector("#ambientParticles");
const ticketWrap = document.querySelector(".ticket-wrap");

function goToStep(stepName) {
  if (stepName === state.currentStep) return;

  const current = document.querySelector(`[data-step="${state.currentStep}"]`);
  const next = document.querySelector(`[data-step="${stepName}"]`);
  if (!next) return;

  if (current) {
    current.classList.add("is-exiting");
    current.classList.remove("is-active");
  }

  window.setTimeout(() => {
    steps.forEach((step) => {
      const isTarget = step.dataset.step === stepName;
      step.classList.toggle("is-active", isTarget);
      step.classList.remove("is-exiting");
      step.setAttribute("aria-hidden", String(!isTarget));
      step.inert = !isTarget;
    });

    dots.forEach((dot) => {
      dot.classList.toggle("is-active", dot.dataset.dot === stepName);
    });

    state.currentStep = stepName;

    if (stepName === "saudade") startSaudadeMeter();
    if (stepName === "quiz") renderQuizQuestion();
    if (stepName === "resultado") showCompatibilityResult();
    if (stepName === "final") acceptInviteEffects();
  }, current ? 220 : 0);
}

function startSaudadeMeter() {
  if (state.meterStarted) return;
  state.meterStarted = true;

  const duration = reducedMotion ? 220 : 2300;
  const started = performance.now();

  const tick = (now) => {
    const elapsed = now - started;
    const progress = Math.min(100, Math.round((elapsed / duration) * 100));
    updateMeter(progress);

    if (progress < 100) {
      requestAnimationFrame(tick);
      return;
    }

    meterResult.hidden = false;
    diagnosticButton.disabled = false;
  };

  requestAnimationFrame(tick);
}

function updateMeter(value) {
  const activeMessage = meterMessages.reduce((latest, item) => {
    return value >= item.at ? item : latest;
  }, meterMessages[0]);

  meterPercent.textContent = `${value}%`;
  meterMessage.textContent = activeMessage.text;
  meterFill.style.width = `${value}%`;
  meterProgress.setAttribute("aria-valuenow", String(value));
}

function renderQuizQuestion() {
  const item = quizQuestions[state.quizIndex];
  if (!item) return;

  quizCard.classList.add("is-swapping");

  window.setTimeout(() => {
    quizProgress.textContent = `${state.quizIndex + 1}/4`;
    quizQuestion.textContent = item.question;
    answers.replaceChildren();

    item.answers.forEach((answer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      button.textContent = answer;
      button.addEventListener("click", () => nextQuizQuestion(button));
      answers.append(button);
    });

    quizCard.classList.remove("is-swapping");
  }, reducedMotion ? 0 : 180);
}

function nextQuizQuestion(selectedButton) {
  selectedButton.classList.add("is-selected");
  answers.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });

  window.setTimeout(() => {
    state.quizIndex += 1;
    if (state.quizIndex >= quizQuestions.length) {
      goToStep("resultado");
      return;
    }

    renderQuizQuestion();
  }, reducedMotion ? 80 : 360);
}

function showCompatibilityResult() {
  if (state.resultStarted) return;
  state.resultStarted = true;
  resultTitle.textContent = "calculando compatibilidade...";
  loaderRing.hidden = false;
  loaderRing.classList.remove("is-complete");
  resultGifFrame.hidden = true;
  systemLines.hidden = false;
  systemLines.replaceChildren();
  compatibilityResult.hidden = true;
  showInviteButton.hidden = true;

  systemMessages.forEach((message, index) => {
    window.setTimeout(() => {
      const line = document.createElement("p");
      line.className = "system-line";
      line.textContent = message;
      systemLines.append(line);
    }, reducedMotion ? index * 20 : index * 420);
  });

  window.setTimeout(() => {
    resultTitle.textContent = "diagnóstico concluído.";
    loaderRing.classList.add("is-complete");
    loaderRing.hidden = true;
    systemLines.hidden = true;
    resultGifFrame.hidden = false;
    compatibilityResult.hidden = false;
    showInviteButton.hidden = false;
  }, reducedMotion ? 160 : 2050);
}

function showInviteSoftMessage() {
  softMessage.hidden = false;
  ticketWrap.classList.add("has-soft-message");
}

function acceptInvite() {
  playAudio();
  goToStep("final");
}

function acceptInviteEffects() {
  if (state.celebrated) return;
  state.celebrated = true;
  createConfetti();
  createBalloons();
  createHearts();
}

function createConfetti() {
  if (reducedMotion) return;

  const colors = ["#ffe08a", "#ff2e8a", "#ffffff", "#ad7cff", "#ff6a75"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    piece.style.setProperty("--duration", `${2.8 + Math.random() * 2.4}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.9}s`);
    piece.style.setProperty("--color", colors[index % colors.length]);
    celebrationLayer.append(piece);
    removeAfterAnimation(piece, 6200);
  }
}

function createBalloons() {
  if (reducedMotion) return;

  const colors = ["#ff2e8a", "#ad7cff", "#ffe08a", "#ff7184"];
  for (let index = 0; index < 10; index += 1) {
    const balloon = document.createElement("span");
    balloon.className = "balloon";
    balloon.style.setProperty("--x", `${6 + Math.random() * 88}%`);
    balloon.style.setProperty("--drift", `${Math.random() * 70 - 35}px`);
    balloon.style.setProperty("--duration", `${4.2 + Math.random() * 2.2}s`);
    balloon.style.setProperty("--delay", `${Math.random() * 1.4}s`);
    balloon.style.setProperty("--color", colors[index % colors.length]);
    celebrationLayer.append(balloon);
    removeAfterAnimation(balloon, 7600);
  }
}

function createHearts() {
  if (reducedMotion) return;

  for (let index = 0; index < 22; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = index % 4 === 0 ? "✦" : "♥";
    heart.style.setProperty("--x", `${Math.random() * 100}%`);
    heart.style.setProperty("--drift", `${Math.random() * 90 - 45}px`);
    heart.style.setProperty("--size", `${18 + Math.random() * 18}px`);
    heart.style.setProperty("--duration", `${3.4 + Math.random() * 2.8}s`);
    heart.style.setProperty("--delay", `${Math.random() * 1.2}s`);
    celebrationLayer.append(heart);
    removeAfterAnimation(heart, 7000);
  }
}

function playAudio() {
  const audio = document.querySelector("#dateAudio");
  if (!audio) return;
  audio.play().catch(() => {});
}

function createAmbientParticles() {
  if (reducedMotion || !ambientParticles) return;

  const shapes = ["''", "'♥'", "'✦'", "'•'"];
  for (let index = 0; index < 26; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.setProperty("--x", `${Math.random() * 100}%`);
    particle.style.setProperty("--y", `${Math.random() * 100}%`);
    particle.style.setProperty("--size", `${3 + Math.random() * 5}px`);
    particle.style.setProperty("--duration", `${5 + Math.random() * 7}s`);
    particle.style.setProperty("--delay", `${Math.random() * -10}s`);
    particle.style.setProperty("--shape", shapes[index % shapes.length]);
    ambientParticles.append(particle);
  }
}

function removeAfterAnimation(element, delay) {
  window.setTimeout(() => {
    element.remove();
  }, delay);
}

function bindTiltCards() {
  if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "start") goToStep("saudade");
  if (action === "diagnostic") goToStep("quiz");
  if (action === "showInvite") goToStep("convite");
  if (action === "softMaybe") showInviteSoftMessage();
  if (action === "acceptInvite") acceptInvite();
});

steps.forEach((step) => {
  const isHero = step.dataset.step === "hero";
  step.setAttribute("aria-hidden", String(!isHero));
  step.inert = !isHero;
});

createAmbientParticles();
bindTiltCards();

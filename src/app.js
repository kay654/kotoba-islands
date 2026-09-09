import {
  ROUND_SIZE,
  ISLANDS,
  readProfile,
  saveProfile,
  validateQuestions,
  createRound,
  nextQuestion,
  answerQuestion,
  finishRound,
} from "./engine.js";
import { icon, island } from "./art.js";
import { sound } from "./sound.js";

const app = document.querySelector("#app");
async function prepareQuestionFont(text = "昭明") {
  // The question screen is rendered dynamically. Loading the Japanese font
  // before its first render prevents a fallback glyph from flashing briefly.
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('600 86px "Klee One"', text),
      document.fonts.load('600 55px "Klee One"', text),
    ]);
  } catch {
    // Keep the system-font fallback usable if a font service is unavailable.
  }
}
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem() {
      throw new Error();
    },
    setItem() {
      throw new Error();
    },
  };
}
const loaded = readProfile(storage);
let profile = loaded.profile,
  questions = [],
  view = "home",
  round,
  result,
  timer,
  advanceAt = 0,
  paused = false,
  remaining = 0,
  saveFailed = false,
  offlineReady = false,
  starting = false,
  advancing = false,
  lastFocus;
let notice = loaded.recovered
  ? "保存を読みこめなかったため、新しくはじめます。"
  : "";
const level = () => Math.min(5, Math.floor(profile.stars / 6));
const weak = () =>
  questions.filter(
    (q) =>
      q.grade === profile.grade &&
      profile.records[q.id]?.wrong > 0 &&
      profile.records[q.id].streak < 2,
  );
function persist() {
  saveFailed = !saveProfile(storage, profile);
}
function header() {
  return `<header class="site-header"><button class="brand" data-action="home" aria-label="ことばの島 ホーム">${icon("leaf")}<span>ことばの島<small>KOTOBA ISLANDS</small></span></button><div class="header-actions"><span class="star-wallet" aria-label="集めた星 ${profile.stars}個">${icon("star")}<b>${profile.stars}</b></span><button class="icon-button" data-action="sound" aria-label="音を${profile.sound ? "オフ" : "オン"}にする" aria-pressed="${profile.sound}">${icon(profile.sound ? "sound" : "mute")}</button><button class="icon-button" data-action="settings" aria-label="設定">${icon("settings")}</button></div></header>`;
}
function render() {
  app.innerHTML = `${header()}<main id="main">${view === "home" ? home() : view === "game" ? game() : view === "result" ? results() : collection()}</main><footer class="site-footer"><span>ひとつのことばが、冒険のはじまり。</span><span>じぶんのペースで、どこまでも。</span></footer><div class="save-notice" role="status">${saveFailed ? "この端末に保存できません。今はこのまま遊べます。" : esc(notice)}</div><dialog id="dialog" aria-labelledby="dialog-title"></dialog>`;
}
function home() {
  const progress = profile.stars % 6;
  return `<section class="home-hero"><div class="hero-copy"><p class="eyebrow"><span></span> 漢字をつなぐ、小さな冒険</p><h1>ことばを集めて、<br>まだ見ぬ<span class="underlined">島へ。</span></h1><p class="hero-description">ぴったりの漢字を、ひとつ。<br>正解するたび、きみの島が育っていく。</p><div class="hero-caption">${icon("flag")}<span>1回10問。きょうは、どこまで行こう？</span></div></div><div class="hero-scene"><div class="scene-orbit"></div><span class="scene-label">ISLAND ${String(level() + 1).padStart(2, "0")}</span>${island(level())}<div class="island-label"><span class="live-dot"></span>${ISLANDS[level()]}<span>発見中</span></div></div></section>
    <section class="launch-area" aria-labelledby="grade-heading"><div class="launch-heading"><div><p class="eyebrow">LET’S EXPLORE</p><h2 id="grade-heading">何年生の漢字で遊ぶ？</h2></div><span class="subtle">いつでも変えられるよ</span></div><div class="grade-grid" role="group" aria-label="学年を選ぶ">${["はじめの一歩", "ぐんぐん広がる", "発見いっぱい", "もっと遠くへ", "ひらめく力", "ことばの達人"].map((label, i) => `<button class="grade-button ${profile.grade === i + 1 ? "selected" : ""}" data-grade="${i + 1}" aria-pressed="${profile.grade === i + 1}"><span class="grade-num">${i + 1}<small>年</small></span><span class="grade-description">${label}</span><span class="grade-mark">${profile.grade === i + 1 ? icon("check") : ""}</span></button>`).join("")}</div><div class="launch-bottom"><p>${icon("spark")}空いているところに、漢字を入れるだけ。</p><button class="primary launch-button" data-action="start">冒険に出発 ${icon("arrow")}</button></div></section>
    <section class="home-bottom"><button class="progress-link" data-action="collection"><span class="round-icon">${icon("book")}</span><span><b>きみのことば図鑑</b><small>${profile.discoveries.length} のことばを発見</small></span>${icon("arrow")}</button><div class="next-island"><div><span>${level() < 5 ? "つぎの島まで" : "すべての島を発見！"}</span><b>${level() < 5 ? `${6 - progress} つの星` : "冒険はつづく"}</b></div><div class="little-stars">${Array.from({ length: 6 }, (_, i) => icon("star", i < progress || level() === 5 ? "filled" : "")).join("")}</div></div>${weak().length ? `<button class="practice-link" data-action="practice">${icon("leaf")}もう一度、出会うことば <b>${weak().length}</b>${icon("arrow")}</button>` : ""}</section>`;
}
function game() {
  const q = round.current;
  return `<section class="play-shell"><p class="screen-reader-status" role="status">${round.index + 1}問目。${esc(q.reading)}。${esc(q.hint)}</p><div class="play-top"><button class="quiet-button" data-action="pause">${icon("pause")}ひとやすみ</button><span class="trip-label">${round.grade}年生の${round.mode === "practice" ? "おさらい" : "冒険"}</span><span id="question-counter" class="question-counter"><b>${round.index + 1}</b> / ${ROUND_SIZE}</span></div><div class="route" aria-label="${round.index}問おわり">${Array.from({ length: ROUND_SIZE }, (_, i) => `<span class="route-stop ${i < round.index ? (round.answers[i].correct ? "done" : "learned") : i === round.index ? "current" : ""}">${i < round.index ? icon(round.answers[i].correct ? "check" : "leaf") : i === ROUND_SIZE - 1 ? icon("flag") : ""}</span>`).join("")}</div>
    <div class="play-meta"><span class="mini-label">${icon("leaf")} ${ISLANDS[level()]}</span><span class="combo ${round.combo >= 3 ? "hot" : ""}" id="combo">${icon("spark")}<b>${round.combo}</b> れんぞく</span></div>
    <div class="question-panel" id="question-panel"><p class="question-instruction">□ に入る漢字は？</p><p class="reading" id="reading">${esc(q.reading)}</p><h1 class="word" id="word" aria-label="${esc(q.reading)}。${[...q.word].map((c, i) => (i === q.blank ? "空欄" : c)).join("、")}">${[...q.word].map((c, i) => (i === q.blank ? '<span class="blank"><span class="blank-character">?</span></span>' : `<span>${esc(c)}</span>`)).join("")}</h1><p class="word-hint">${esc(q.hint)}</p><div class="particles" aria-hidden="true"></div></div>
    <div class="answers" role="group" aria-label="答えを選んでね">${round.options.map((c, i) => `<button class="answer" data-choice="${esc(c)}" aria-label="${esc(c)}"><span>${esc(c)}</span><kbd>${i + 1}</kbd><span class="answer-symbol"></span></button>`).join("")}</div>
    <div class="feedback" id="feedback" role="status" aria-live="polite"><span>あせらず、ぴったりのひと文字を。</span></div><div class="play-foot"><span>星 ${icon("star")} 7問正解で2つ・全問正解で3つ</span><span class="keyboard-tip">1–4 キーでも選べるよ</span></div></section>`;
}
function results() {
  const wrong = [
    ...new Set(round.answers.filter((a) => !a.correct).map((a) => a.id)),
  ].map((id) => questions.find((q) => q.id === id));
  const newWords = profile.discoveries.length - round.discoveryStart;
  return `<section class="result-shell"><p class="eyebrow">${result.correct === 10 ? "PERFECT JOURNEY" : "JOURNEY COMPLETE"}</p><h1>${result.correct === 10 ? "ぜんぶ、できた！" : result.correct >= 7 ? "いい旅だったね！" : "一歩ずつ、前へ。"}</h1><p class="result-intro">${newWords > 0 ? `新しいことばを${newWords}こ、見つけたよ。` : "もう一度出会って、ことばの力が育ったね。"}</p><div class="result-art">${island(level(), true)}<div class="earned-stars" aria-label="星を${result.stars}つ獲得">${[1, 2, 3].map((n) => icon("star", n <= result.stars ? "filled" : "")).join("")}</div></div><div class="result-stats"><div><b>${result.correct}<small> / 10</small></b><span>せいかい</span></div><div><b>${result.best}<small> れんぞく</small></b><span>ベストコンボ</span></div><div><b>+${result.stars}<small> つ</small></b><span>あつめた星</span></div></div><div class="reward-note">${icon("flag")}<span>${round.startLevel < level() ? `新しい島「${ISLANDS[level()]}」を発見！` : level() < 5 ? `あと${6 - (profile.stars % 6)}つの星で「${ISLANDS[level() + 1]}」へ。` : "6つの島を発見！ ことば図鑑を育てよう。"}</span></div>${wrong.length ? `<details class="review"><summary>今日、出会いなおしたことば <span>${wrong.length}こ</span></summary><div>${wrong.map((q) => `<p><ruby>${esc(q.word)}<rt>${esc(q.reading)}</rt></ruby><span>${esc(q.hint)}</span></p>`).join("")}</div><small>このことばは、次の冒険でも出やすくなるよ。</small></details>` : ""}<div class="result-actions"><button class="primary" data-action="start">もう一度、冒険へ ${icon("arrow")}</button><button class="quiet-button" data-action="home">${icon("home")}島にもどる</button></div></section>`;
}
function collection() {
  const found = questions.filter(
    (q) => profile.discoveries.includes(q.id) && q.grade === profile.grade,
  );
  return `<section class="collection-shell"><button class="quiet-button" data-action="home">${icon("back")}島にもどる</button><p class="eyebrow">YOUR WORD COLLECTION</p><h1>きみのことば図鑑</h1><p>正解したことばが、ここに集まるよ。</p><div class="collection-tabs" role="group" aria-label="図鑑の学年">${[1, 2, 3, 4, 5, 6].map((g) => `<button class="${g === profile.grade ? "selected" : ""}" data-grade="${g}" aria-pressed="${g === profile.grade}">${g}年</button>`).join("")}</div><div class="collection-heading"><h2>${profile.grade}年生のことば</h2><span>${found.length} / ${questions.filter((q) => q.grade === profile.grade).length} 発見</span></div>${found.length ? `<div class="word-collection">${found.map((q) => `<article><span class="collection-leaf">${icon("leaf")}</span><ruby>${esc(q.word)}<rt>${esc(q.reading)}</rt></ruby><p>${esc(q.hint)}</p></article>`).join("")}</div>` : `<div class="empty-collection">${icon("book")}<h2>最初のひとことを、見つけよう。</h2><p>冒険で出会ったことばが、この図鑑を彩ります。</p><button class="primary" data-action="start">冒険に出発 ${icon("arrow")}</button></div>`}<div class="island-collection"><h2>見つけた島</h2><div>${ISLANDS.map((s, i) => `<span class="${i <= level() ? "unlocked" : ""}">${icon(i <= level() ? "flag" : "star")}<small>0${i + 1}</small><b>${i <= level() ? s : "まだ見ぬ島"}</b></span>`).join("")}</div></div></section>`;
}
const questionFontText = () =>
  `${round.current.word}${round.options.join("")}`;
async function start(mode = "journey") {
  if (starting) return;
  starting = true;
  clearTimeout(timer);
  paused = false;
  try {
    round = createRound(questions, profile.grade, mode);
  } catch (e) {
    notice = e.message;
    render();
    starting = false;
    return;
  }
  round.discoveryStart = profile.discoveries.length;
  round.startLevel = level();
  nextQuestion(round, profile);
  await prepareQuestionFont(questionFontText());
  view = "game";
  notice = "";
  render();
  window.scrollTo({ top: 0 });
  starting = false;
}
function clearGameFocus() {
  // Mobile browsers can keep the tap focus visible while the next question is
  // rendered. Clearing it before replacement prevents the previous choice
  // from looking selected on the new question.
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}
function schedule(ms) {
  clearTimeout(timer);
  remaining = ms;
  advanceAt = Date.now() + ms;
  if (!paused) timer = setTimeout(advance, ms);
}
async function advance() {
  if (view !== "game" || !round.locked || paused || advancing) return;
  advancing = true;
  clearTimeout(timer);
  if (round.index === ROUND_SIZE) {
    result = finishRound(round, profile);
    persist();
    sound("clear", profile.sound);
    view = "result";
    render();
    const heading = document.querySelector("h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  } else {
    nextQuestion(round, profile);
    await prepareQuestionFont(questionFontText());
    clearGameFocus();
    render();
  }
  advancing = false;
}
function answer(choice) {
  if (paused) return;
  const feedback = answerQuestion(round, profile, choice);
  if (!feedback) return;
  persist();
  sound(
    feedback.correct
      ? feedback.combo >= 3
        ? "combo"
        : feedback.retry
          ? "retry"
          : "correct"
      : "wrong",
    profile.sound,
  );
  document.querySelectorAll(".answer").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.choice === feedback.answer) {
      btn.classList.add("correct");
      btn.querySelector(".answer-symbol").innerHTML = icon("check");
    } else if (btn.dataset.choice === choice) {
      btn.classList.add("incorrect");
      btn.querySelector(".answer-symbol").innerHTML = icon("leaf");
    } else btn.classList.add("dimmed");
  });
  const blank = document.querySelector(".blank");
  blank.querySelector(".blank-character").textContent = feedback.answer;
  blank.classList.add("solved");
  document
    .querySelector("#word")
    .setAttribute("aria-label", round.current.word);
  const panel = document.querySelector("#question-panel");
  panel.classList.add(feedback.correct ? "success" : "learning");
  const stop = document.querySelector(".route-stop.current");
  if (stop) {
    stop.classList.remove("current");
    stop.classList.add(feedback.correct ? "done" : "learned");
    stop.innerHTML = icon(feedback.correct ? "check" : "leaf");
  }
  document
    .querySelector(".route")
    .setAttribute("aria-label", `${round.index}問おわり`);
  document.querySelector("#combo").innerHTML =
    `${icon("spark")}<b>${round.combo}</b> れんぞく`;
  document.querySelector("#combo").classList.toggle("hot", round.combo >= 3);
  if (feedback.correct)
    document.querySelector(".particles").innerHTML = Array.from(
      { length: 9 },
      (_, i) =>
        `<i style="--i:${i};--x:${Math.cos(i * 0.7) * 150}px;--y:${Math.sin(i * 0.7) * 100 - 30}px"></i>`,
    ).join("");
  const line = feedback.correct
    ? feedback.retry
      ? "このことば、できたね！"
      : feedback.combo === 10
        ? "10れんぞく！ パーフェクト！"
        : feedback.combo >= 3
          ? `${feedback.combo}れんぞく！ その調子！`
          : ["ぴったり！", "いいね、そのひと文字！", "見つけたね！"][
              round.index % 3
            ]
    : `「${round.current.word}」だね。もうひとつ、覚えた！`;
  document.querySelector("#feedback").innerHTML =
    `<span class="${feedback.correct ? "positive" : "gentle"}">${icon(feedback.correct ? "check" : "leaf")}${esc(line)}</span><button class="feedback-next" data-action="advance">${round.index === 10 ? "旅のきろくへ" : "つぎへ"} ${icon("arrow")}</button>`;
  if (profile.auto)
    schedule(feedback.correct ? (feedback.combo >= 3 ? 1050 : 850) : 2600);
  if (saveFailed)
    document.querySelector(".save-notice").textContent =
      "この端末に保存できません。今はこのまま遊べます。";
}
function openDialog(kind) {
  lastFocus = document.activeElement;
  if (view === "game") {
    paused = true;
    remaining = Math.max(0, advanceAt - Date.now());
    clearTimeout(timer);
  }
  const dialog = document.querySelector("#dialog");
  dialog.innerHTML =
    kind === "settings"
      ? `<button class="dialog-close icon-button" data-action="resume" aria-label="閉じる">${icon("close")}</button><p class="eyebrow">SETTINGS</p><h2 id="dialog-title">じぶんのペースで</h2><label class="setting-row"><span><b>ゲームの音</b><small>小さな音で、正解をお祝い</small></span><input id="sound-setting" type="checkbox" ${profile.sound ? "checked" : ""}></label><label class="setting-row"><span><b>自動で、つぎの問題へ</b><small>オフにすると、ゆっくり読めます</small></span><input id="auto-setting" type="checkbox" ${profile.auto ? "checked" : ""}></label><p class="settings-note">記録はこのブラウザに保存されます。<br>名前を登録せずに遊べます。<br><span id="offline-status">${offlineReady ? "オフラインで遊ぶ準備ができています。" : "はじめの読みこみには通信が必要です。"}</span></p><button class="primary" data-action="resume">これで遊ぶ ${icon("check")}</button>`
      : `<p class="eyebrow">TAKE A BREATH</p><h2 id="dialog-title">ひとやすみしよう。</h2><p>あせらなくて、大丈夫。<br>つづきは、きみのペースで。</p><button class="primary" data-action="resume">つづきから遊ぶ ${icon("arrow")}</button><button class="quiet-button" data-action="leave">島にもどる</button><small class="settings-note">途中で戻っても、答えたことばは残るよ。<br>星は10問おわるともらえます。</small>`;
  dialog.showModal();
  dialog.addEventListener(
    "cancel",
    (e) => {
      e.preventDefault();
      resume();
    },
    { once: true },
  );
}
function resume() {
  document.querySelector("#dialog").close();
  paused = false;
  lastFocus?.focus({ preventScroll: true });
  if (view === "game" && round.locked && profile.auto)
    schedule(Math.max(remaining, 500));
}
app.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.disabled) return;
  if (btn.dataset.grade) {
    profile.grade = Number(btn.dataset.grade);
    persist();
    render();
    document
      .querySelector(`[data-grade="${profile.grade}"]`)
      ?.focus({ preventScroll: true });
    return;
  }
  if (btn.dataset.choice) {
    answer(btn.dataset.choice);
    return;
  }
  switch (btn.dataset.action) {
    case "start":
      sound("tap", profile.sound);
      start();
      break;
    case "practice":
      start("practice");
      break;
    case "home":
      if (view === "game") openDialog("pause");
      else {
        view = "home";
        render();
      }
      break;
    case "leave":
      clearTimeout(timer);
      paused = false;
      view = "home";
      render();
      break;
    case "collection":
      view = "collection";
      render();
      window.scrollTo({ top: 0 });
      break;
    case "sound":
      profile.sound = !profile.sound;
      persist();
      sound("tap", profile.sound);
      btn.innerHTML = icon(profile.sound ? "sound" : "mute");
      btn.setAttribute("aria-pressed", profile.sound);
      btn.setAttribute(
        "aria-label",
        `音を${profile.sound ? "オフ" : "オン"}にする`,
      );
      break;
    case "advance":
      advance();
      break;
    case "pause":
      openDialog("pause");
      break;
    case "settings":
      openDialog("settings");
      break;
    case "resume":
      resume();
      break;
  }
});
app.addEventListener("change", (e) => {
  if (e.target.id === "sound-setting") {
    profile.sound = e.target.checked;
    sound("tap", profile.sound);
  }
  if (e.target.id === "auto-setting") profile.auto = e.target.checked;
  persist();
  const button = document.querySelector('[data-action="sound"]');
  button.innerHTML = icon(profile.sound ? "sound" : "mute");
  button.setAttribute("aria-pressed", profile.sound);
  button.setAttribute(
    "aria-label",
    `音を${profile.sound ? "オフ" : "オン"}にする`,
  );
});
document.addEventListener("keydown", (e) => {
  if (
    e.repeat ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    paused ||
    view !== "game"
  )
    return;
  if (/^[1-4]$/.test(e.key)) {
    e.preventDefault();
    answer(round.options[Number(e.key) - 1]);
  }
  if (e.key === "Escape") openDialog("pause");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && view === "game" && !paused) openDialog("pause");
});
try {
  const [response] = await Promise.all([
    fetch(new URL("../data/questions.json", import.meta.url)),
    prepareQuestionFont(),
  ]);
  if (!response.ok) throw new Error("問題を読みこめませんでした");
  questions = validateQuestions(await response.json());
  render();
} catch {
  app.innerHTML = `<main class="error-screen">${icon("leaf")}<h1>島への道を、準備中。</h1><p>問題を読みこめませんでした。<br>通信を確認して、もう一度おためしください。</p><button class="primary" id="reload">もう一度読みこむ</button></main>`;
  document.querySelector("#reload").onclick = () => location.reload();
}
if (
  "serviceWorker" in navigator &&
  (!["localhost", "127.0.0.1"].includes(location.hostname) ||
    new URLSearchParams(location.search).get("pwa") === "1")
)
  navigator.serviceWorker
    .register("./sw.js")
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      offlineReady = true;
      const status = document.querySelector("#offline-status");
      if (status) status.textContent = "オフラインで遊ぶ準備ができています。";
    })
    .catch(() => {});

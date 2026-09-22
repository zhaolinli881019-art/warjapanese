const chapters = [...document.querySelectorAll('.chapter')];
const chapterNumber = document.querySelector('#chapterNumber');
const progressBar = document.querySelector('#progressBar');
const menuButton = document.querySelector('#menuButton');
const chapterMenu = document.querySelector('#chapterMenu');
const prevButton = document.querySelector('#prevChapter');
const nextButton = document.querySelector('#nextChapter');
let activeChapter = 0;

const pad = (number) => String(number).padStart(2, '0');

function setActiveChapter(index) {
  activeChapter = Math.max(0, Math.min(index, chapters.length - 1));
  chapterNumber.textContent = pad(activeChapter + 1);
  progressBar.style.width = `${((activeChapter + 1) / chapters.length) * 100}%`;
}

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveChapter(chapters.indexOf(visible.target));
}, { threshold: [0.35, 0.55, 0.75] });

chapters.forEach((chapter) => observer.observe(chapter));

function goToChapter(offset) {
  const target = Math.max(0, Math.min(activeChapter + offset, chapters.length - 1));
  chapters[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

prevButton.addEventListener('click', () => goToChapter(-1));
nextButton.addEventListener('click', () => goToChapter(1));

window.addEventListener('keydown', (event) => {
  if (event.target.matches('button, a, video')) return;
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
    event.preventDefault();
    goToChapter(1);
  }
  if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goToChapter(-1);
  }
});

function toggleMenu(force) {
  const open = force ?? !chapterMenu.classList.contains('open');
  chapterMenu.classList.toggle('open', open);
  chapterMenu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

menuButton.addEventListener('click', () => toggleMenu());
chapterMenu.addEventListener('click', (event) => {
  if (event.target.closest('a')) toggleMenu(false);
});

document.querySelectorAll('.speaker-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.speaker-note').forEach((note) => { note.hidden = true; });
    const note = document.querySelector(`#${button.dataset.note}`);
    note.hidden = false;
    note.querySelector('button').focus();
  });
});

document.querySelectorAll('.speaker-note button').forEach((button) => {
  button.addEventListener('click', () => { button.parentElement.hidden = true; });
});

const quiz = [
  { question: '九一八事变发生在哪一年？', options: ['1931年', '1937年', '1945年'], answer: 0 },
  { question: '南京大屠杀死难者国家公祭日是哪一天？', options: ['7月7日', '9月18日', '12月13日'], answer: 2 },
  { question: '西安事变发生在哪一年？', options: ['1936年', '1938年', '1940年'], answer: 0 },
  { question: '全面抗战爆发的重要事件是什么？', options: ['九一八事变', '七七事变', '西安事变'], answer: 1 },
  { question: '抗日战争胜利是哪一年？', options: ['1941年', '1943年', '1945年'], answer: 2 },
];

const quizQuestion = document.querySelector('#quizQuestion');
const quizOptions = document.querySelector('#quizOptions');
const quizFeedback = document.querySelector('#quizFeedback');
const nextQuestion = document.querySelector('#nextQuestion');
const quizFinish = document.querySelector('#quizFinish');
const quizScore = document.querySelector('#quizScore');
let quizIndex = 0;
let score = 0;

function renderQuestion() {
  const item = quiz[quizIndex];
  quizQuestion.textContent = item.question;
  quizOptions.innerHTML = '';
  quizFeedback.textContent = `第 ${quizIndex + 1} 题 / 共 ${quiz.length} 题`;
  nextQuestion.hidden = true;

  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => answerQuestion(index));
    quizOptions.appendChild(button);
  });
}

function answerQuestion(selected) {
  const item = quiz[quizIndex];
  const buttons = [...quizOptions.querySelectorAll('button')];
  buttons.forEach((button) => { button.disabled = true; });
  buttons[item.answer].classList.add('correct');
  if (selected === item.answer) {
    score += 1;
    quizFeedback.textContent = '答对了！你记得很清楚。';
  } else {
    buttons[selected].classList.add('wrong');
    quizFeedback.textContent = `再记一次：答案是“${item.options[item.answer]}”。`;
  }
  nextQuestion.textContent = quizIndex === quiz.length - 1 ? '查看结果 →' : '下一题 →';
  nextQuestion.hidden = false;
}

nextQuestion.addEventListener('click', () => {
  quizIndex += 1;
  if (quizIndex < quiz.length) {
    renderQuestion();
    return;
  }
  quizQuestion.textContent = '你完成了课堂小问答';
  quizOptions.innerHTML = '';
  quizFeedback.textContent = '';
  nextQuestion.hidden = true;
  quizScore.textContent = `${score} / ${quiz.length}`;
  quizFinish.hidden = false;
});

const miniFilm = document.querySelector('#miniFilm');
const filmPlay = document.querySelector('#filmPlay');
let filmTimer;
if (miniFilm && filmPlay) {
  filmPlay.addEventListener('click', () => {
    clearTimeout(filmTimer);
    miniFilm.classList.remove('playing');
    void miniFilm.offsetWidth;
    miniFilm.classList.add('playing');
    filmTimer = setTimeout(() => miniFilm.classList.remove('playing'), 30000);
  });
}

renderQuestion();
setActiveChapter(0);

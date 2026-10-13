if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const chapterOrder = [
  'cover', 'team', 'timeline', 'mukden', 'xian', 'xian-story', 'lugou', 'nanjing',
  'unity', 'base', 'pillar', 'victory', 'peace', 'quiz', 'anthem',
];
const main = document.querySelector('main');
chapterOrder.forEach((id) => main.appendChild(document.querySelector(`#${id}`)));
const chapters = [...document.querySelectorAll('.chapter')];
const chapterNumber = document.querySelector('#chapterNumber');
const progressBar = document.querySelector('#progressBar');
const menuButton = document.querySelector('#menuButton');
const chapterMenu = document.querySelector('#chapterMenu');
const prevButton = document.querySelector('#prevChapter');
const nextButton = document.querySelector('#nextChapter');
let activeChapter = 0;

if (!window.location.hash) {
  window.addEventListener('load', () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      setActiveChapter(0);
    });
  });
}

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
  if (event.target.matches('button, a, video, audio')) return;
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
  { question: '西安事变和平解决推动了什么？', options: ['共同抗日', '扩大内战', '停止学习'], answer: 0 },
  { question: '中国共产党领导的抗日武装主要开辟了什么战场？', options: ['海上战场', '敌后战场', '空中战场'], answer: 1 },
  { question: '我们学习这段历史最重要的意义是什么？', options: ['延续仇恨', '珍爱和平', '忘记过去'], answer: 1 },
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

const eventViewer = document.querySelector('#eventViewer');
const viewerClose = document.querySelector('#viewerClose');
const eventVideo = document.querySelector('#eventVideo');
const videoLoading = document.querySelector('#videoLoading');
const viewerSource = document.querySelector('#viewerSource');
let hlsPlayer = null;
let clipStart = 0;

function destroyVideoStream() {
  eventVideo.pause();
  if (hlsPlayer) {
    hlsPlayer.destroy();
    hlsPlayer = null;
  }
  eventVideo.removeAttribute('src');
  eventVideo.load();
}

function closeEventViewer() {
  destroyVideoStream();
  eventViewer.hidden = true;
  document.body.style.overflow = '';
}

function playFromClipStart() {
  if (Number.isFinite(clipStart) && clipStart > 0) eventVideo.currentTime = clipStart;
  eventVideo.play().catch(() => {
    videoLoading.textContent = '视频已准备好，请点击播放按钮。';
    videoLoading.hidden = false;
  });
}

function openEventVideo(button) {
  destroyVideoStream();
  clipStart = Number(button.dataset.start || 0);
  document.querySelector('#viewerYear').textContent = button.dataset.year;
  document.querySelector('#viewerTitle').textContent = button.dataset.videoTitle || button.dataset.event;
  document.querySelector('#viewerCopy').textContent = button.dataset.copy;
  viewerSource.href = button.dataset.source;
  eventVideo.poster = button.dataset.poster || '';
  videoLoading.textContent = '视频加载中，请稍候…';
  videoLoading.hidden = false;
  eventViewer.hidden = false;
  document.body.style.overflow = 'hidden';

  const videoUrl = button.dataset.video;
  if (eventVideo.canPlayType('application/vnd.apple.mpegurl')) {
    eventVideo.src = videoUrl;
    eventVideo.addEventListener('loadedmetadata', playFromClipStart, { once: true });
  } else if (window.Hls && window.Hls.isSupported()) {
    hlsPlayer = new window.Hls({ enableWorker: true });
    hlsPlayer.loadSource(videoUrl);
    hlsPlayer.attachMedia(eventVideo);
    hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, playFromClipStart);
    hlsPlayer.on(window.Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;
      videoLoading.innerHTML = '视频暂时无法加载，请点击下方“在央视网观看完整视频”。';
      videoLoading.hidden = false;
    });
  } else {
    videoLoading.innerHTML = '当前浏览器不支持此视频格式，请点击下方“在央视网观看完整视频”。';
  }
}

document.querySelectorAll('.event-video').forEach((button) => {
  button.addEventListener('click', () => {
    openEventVideo(button);
  });
});

eventVideo.addEventListener('playing', () => { videoLoading.hidden = true; });
eventVideo.addEventListener('canplay', () => { videoLoading.hidden = true; });
eventVideo.addEventListener('waiting', () => {
  videoLoading.textContent = '视频加载中，请稍候…';
  videoLoading.hidden = false;
});
viewerClose.addEventListener('click', closeEventViewer);
eventViewer.addEventListener('click', (event) => {
  if (event.target === eventViewer) closeEventViewer();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !eventViewer.hidden) closeEventViewer();
});

const anthemAudio = document.querySelector('#anthemAudio');
const anthemPlay = document.querySelector('#anthemPlay');
const anthemCurrent = document.querySelector('#anthemCurrent');
const anthemDuration = document.querySelector('#anthemDuration');
const anthemProgress = document.querySelector('#anthemProgress');
const lyricsViewport = document.querySelector('#lyricsViewport');
const lyricLines = [...document.querySelectorAll('#anthemLyrics li')];
let activeLyric = -1;

function formatTime(seconds) {
  const safe = Number.isFinite(seconds) ? seconds : 0;
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
}

function updateAnthem() {
  const duration = anthemAudio.duration || 49.7;
  anthemCurrent.textContent = formatTime(anthemAudio.currentTime);
  anthemDuration.textContent = formatTime(duration);
  anthemProgress.style.width = `${Math.min(100, (anthemAudio.currentTime / duration) * 100)}%`;

  const nextLyric = lyricLines.reduce((found, line, index) => (
    anthemAudio.currentTime >= Number(line.dataset.time) ? index : found
  ), 0);
  if (nextLyric !== activeLyric) {
    activeLyric = nextLyric;
    lyricLines.forEach((line, index) => line.classList.toggle('active', index === activeLyric));
    const line = lyricLines[activeLyric];
    lyricsViewport.scrollTo({
      top: line.offsetTop - (lyricsViewport.clientHeight / 2) + (line.clientHeight / 2),
      behavior: 'smooth',
    });
  }
}

anthemPlay.addEventListener('click', () => {
  if (anthemAudio.paused) {
    anthemAudio.play();
  } else {
    anthemAudio.pause();
  }
});

anthemAudio.addEventListener('play', () => {
  anthemPlay.classList.add('playing');
  anthemPlay.querySelector('span').textContent = '暂停播放';
});
anthemAudio.addEventListener('pause', () => {
  anthemPlay.classList.remove('playing');
  anthemPlay.querySelector('span').textContent = anthemAudio.ended ? '重新播放' : '继续播放';
});
anthemAudio.addEventListener('loadedmetadata', updateAnthem);
anthemAudio.addEventListener('timeupdate', updateAnthem);
anthemAudio.addEventListener('ended', () => {
  anthemAudio.currentTime = 0;
  activeLyric = -1;
  updateAnthem();
});

renderQuestion();
setActiveChapter(0);

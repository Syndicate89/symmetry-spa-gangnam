const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const progress = document.querySelector('.scroll-progress');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  mobileMenu.hidden = true;
  header.classList.remove('menu-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  mobileMenu.hidden = !open;
  header.classList.toggle('menu-open', open);
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width:761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
// One timer shared by slide controls, page visibility and motion preferences.
const slides = [...document.querySelectorAll('.hero-slide')];
const triggers = [...document.querySelectorAll('.slide-trigger')];
const pauseButton = document.querySelector('.slide-pause');
const slideDuration = 7000;
let currentSlide = 0, slideTimer = null, slideStartedAt = 0;
let slideRemaining = slideDuration, userPaused = false, heroVisible = true;
function stopSlideshow() {
  if (slideTimer !== null) {
    window.clearTimeout(slideTimer);
    slideTimer = null;
    slideRemaining = Math.max(0, slideRemaining - (performance.now() - slideStartedAt));
  }
  hero.classList.add('is-paused');
}
function runSlideshow() {
  if (userPaused || motionPreference.matches || document.hidden || !heroVisible) { stopSlideshow(); return; }
  if (slideTimer !== null) return;
  hero.classList.remove('is-paused');
  slideStartedAt = performance.now();
  slideTimer = window.setTimeout(() => {
    slideTimer = null;
    showSlide((currentSlide + 1) % slides.length);
  }, slideRemaining);
}
function showSlide(index) {
  if (index === currentSlide) return;
  stopSlideshow();
  slides[currentSlide].classList.remove('is-active');
  slides[currentSlide].setAttribute('aria-hidden', 'true');
  triggers[currentSlide].classList.remove('is-active');
  triggers[currentSlide].setAttribute('aria-pressed', 'false');
  currentSlide = index;
  slides[index].classList.add('is-active');
  slides[index].setAttribute('aria-hidden', 'false');
  triggers[index].classList.add('is-active');
  triggers[index].setAttribute('aria-pressed', 'true');
  slideRemaining = slideDuration;
  runSlideshow();
}
triggers.forEach((button, index) => button.addEventListener('click', () => showSlide(index)));
function updatePauseControl() {
  pauseButton.disabled = motionPreference.matches;
  pauseButton.textContent = motionPreference.matches ? '정지' : userPaused ? '재생' : '일시정지';
  pauseButton.setAttribute('aria-label', motionPreference.matches ? '동작 줄이기 설정으로 자동 전환 꺼짐' : userPaused ? '사진 자동 전환 재생' : '사진 자동 전환 일시정지');
}
pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  updatePauseControl();
  userPaused ? stopSlideshow() : runSlideshow();
});
document.addEventListener('visibilitychange', () => document.hidden ? stopSlideshow() : runSlideshow());
// Keep complete Korean words and an unsplit accessible heading label.
const headingAnimations = new Set();
function prepareTitle(element) {
  element.setAttribute('aria-label', element.innerText.replace(/\n/g, ' '));
  const fragment = document.createDocumentFragment();
  [...element.childNodes].forEach(node => {
    if (node.nodeType !== Node.TEXT_NODE) { fragment.append(node); return; }
    (node.textContent.match(/\S+|\s+/g) || []).forEach(word => {
      if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
      const wordSpan = document.createElement('span');
      wordSpan.className = 'motion-word';
      wordSpan.setAttribute('aria-hidden', 'true');
      [...word].forEach(character => {
        const span = document.createElement('span');
        span.className = 'motion-char';
        span.textContent = character;
        wordSpan.append(span);
      });
      fragment.append(wordSpan);
    });
  });
  element.replaceChildren(fragment);
  element.classList.add('title-ready');
}
function revealTitle(element) {
  if (element.classList.contains('is-visible')) return;
  element.classList.add('is-visible');
  if (motionPreference.matches) return;
  element.querySelectorAll('.motion-char').forEach((character, index) => {
    const animation = character.animate([
      { opacity: 0, transform: 'translateY(90%) rotate(3deg)' },
      { opacity: 1, transform: 'translateY(0) rotate(0deg)' }
    ], { duration: 1100, delay: Math.min(index * 24, 520), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    headingAnimations.add(animation);
    animation.finished.then(() => headingAnimations.delete(animation)).catch(() => headingAnimations.delete(animation));
  });
}
const revealTargets = [...document.querySelectorAll('.section-label,.philosophy-text,.approach-heading>p,.section-heading>p,.approach-steps article,.care-row,.care-note,.space-heading>p,.visit-title>p,.visit-actions,.detail-row,.closing>p,.closing h2,.closing .button')];
revealTargets.forEach(element => element.setAttribute('data-reveal', ''));
document.querySelectorAll('.approach-steps article,.care-row').forEach(element => {
  const index = [...element.parentElement.children].indexOf(element);
  element.style.setProperty('--reveal-delay', String(index * 100) + 'ms');
});
const galleryPhotos = [...document.querySelectorAll('.gallery-photo')];
galleryPhotos.forEach(element => element.classList.add('image-reveal'));
const imageTargets = [...document.querySelectorAll('.image-reveal')];
const titles = [...document.querySelectorAll('[data-split-title]')];
if ('IntersectionObserver' in window) {
  titles.forEach(prepareTitle);
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.matches('[data-split-title]')) revealTitle(entry.target);
      else entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  [...revealTargets, ...imageTargets, ...titles].forEach(element => revealObserver.observe(element));
  document.body.classList.add('motion-ready');
  const heroObserver = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    heroVisible ? runSlideshow() : stopSlideshow();
  }, { threshold: 0.02 });
  heroObserver.observe(hero);
  const navigationObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    document.querySelectorAll('.desktop-nav a').forEach(link => {
      const selected = link.getAttribute('href') === '#' + visible.target.id;
      link.classList.toggle('is-current', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('#philosophy,#care,#space,#visit').forEach(section => navigationObserver.observe(section));
} else {
  [...revealTargets, ...imageTargets].forEach(element => element.classList.add('is-visible'));
}
// Request frames only when the scene changes, rather than rendering continuously.
let frameQueued = false;
function updateScrollScene() {
  frameQueued = false;
  const scrollTop = window.scrollY;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollTop / maxScroll)) + ')';
  header.classList.toggle('is-scrolled', scrollTop > hero.offsetHeight - 110);
  const desktopMotion = !motionPreference.matches && window.innerWidth > 760;
  const heroOffset = Math.min(scrollTop, hero.offsetHeight);
  hero.style.setProperty('--hero-image-shift', desktopMotion ? String(heroOffset * 0.16) + 'px' : '0px');
  hero.style.setProperty('--hero-copy-shift', desktopMotion ? String(heroOffset * 0.23) + 'px' : '0px');
  hero.style.setProperty('--hero-copy-opacity', desktopMotion ? String(Math.max(0, 1 - heroOffset / (hero.offsetHeight * 0.85))) : '1');
  galleryPhotos.forEach((element, index) => {
    const bounds = element.getBoundingClientRect();
    const delta = desktopMotion ? Math.max(-28, Math.min(28, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * (index === 0 ? 0.06 : -0.05))) : 0;
    element.style.setProperty('--gallery-shift', String(delta) + 'px');
  });
}
function queueScrollScene() { if (!frameQueued) { frameQueued = true; window.requestAnimationFrame(updateScrollScene); } }
window.addEventListener('scroll', queueScrollScene, { passive: true });
window.addEventListener('resize', queueScrollScene, { passive: true });
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) {
    headingAnimations.forEach(animation => animation.cancel());
    [...revealTargets, ...imageTargets, ...titles].forEach(element => element.classList.add('is-visible'));
    stopSlideshow();
  } else runSlideshow();
  updatePauseControl();
  queueScrollScene();
});
updatePauseControl();
runSlideshow();
queueScrollScene();
window.requestAnimationFrame(() => hero.classList.add('is-ready'));
if (document.fonts) document.fonts.ready.then(queueScrollScene);
const careVisual = document.querySelector('.care-visual');
document.querySelectorAll('.care-row').forEach(row => {
  row.addEventListener('mouseenter', () => careVisual.classList.add('is-engaged'));
  row.addEventListener('mouseleave', () => careVisual.classList.remove('is-engaged'));
  row.addEventListener('focusin', () => careVisual.classList.add('is-engaged'));
  row.addEventListener('focusout', event => { if (!row.contains(event.relatedTarget)) careVisual.classList.remove('is-engaged'); });
});
const photoDialog = document.querySelector('.photo-dialog');
galleryPhotos.forEach(button => button.addEventListener('click', () => {
  const image = photoDialog.querySelector('img');
  image.src = button.dataset.src;
  image.alt = button.dataset.caption;
  photoDialog.querySelector('p').textContent = button.dataset.caption;
  photoDialog.showModal();
}));
photoDialog.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {
  if (event.target === photoDialog) {
    const rect = photoDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) photoDialog.close();
  }
});
document.getElementById('year').textContent = String(new Date().getFullYear());


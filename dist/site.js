const sectionNames = ["experience", "skills", "gallery", "achievements", "travel", "internship", "contact"];
const pages = new Map(["home", ...sectionNames].map(name => [name, document.querySelector(`[data-view="${name}"]`)]));
const home = pages.get("home");
const reader = document.querySelector("[data-reader]");
const ring = reader.querySelector(".reader-orbit");
const homeButtons = [...document.querySelectorAll(".orbit-button")];
const orbitHintButton = homeButtons.find(button => button.dataset.page === "skills");
const readerNodes = [...reader.querySelectorAll(".reader-node")];
const readerCount = reader.querySelector(".reader-count");
const dialIndex = reader.querySelector(".reader-dial-index strong");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const stepAngle = 360 / sectionNames.length;
const wheelThreshold = 280;
const wheelResistance = .7;
const orbitHintKey = "greenhats-orbit-hint-seen";
const themeKey = "greenhats-theme";
const languageTransitionKey = "greenhats-language-transition";
const currentLocale = document.documentElement.lang === "zh-CN" ? "zh" : "en";
const sectionLabels = {
  experience: "经历", skills: "技能", gallery: "项目", achievements: "荣誉",
  travel: "旅行", internship: "求职", contact: "联系"
};
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const themeControl = document.querySelector(".theme-control");
const themeTrigger = themeControl.querySelector(".theme-trigger");
const themeMenu = themeControl.querySelector(".theme-menu");
const themeChoices = [...themeMenu.querySelectorAll("[data-theme-choice]")];
let themeMode = ["auto", "light", "dark"].includes(document.documentElement.dataset.themeMode)
  ? document.documentElement.dataset.themeMode : "auto";
let themeAnimationTimer = 0;

function themeLabel(mode) {
  const labels = currentLocale === "zh"
    ? { auto: "跟随系统", light: "浅色", dark: "深色" }
    : { auto: "Auto", light: "Light", dark: "Dark" };
  return labels[mode];
}

function setTheme(mode, remember = false, animate = false) {
  themeMode = ["auto", "light", "dark"].includes(mode) ? mode : "auto";
  if (remember) {
    try { localStorage.setItem(themeKey, themeMode); } catch (_) { /* The chosen mode still works for this page. */ }
  }
  if (animate && !reducedMotion.matches) {
    document.documentElement.classList.add("theme-changing");
    void document.body.offsetHeight;
    window.clearTimeout(themeAnimationTimer);
    themeAnimationTimer = window.setTimeout(() => document.documentElement.classList.remove("theme-changing"), 480);
  }
  const dark = themeMode === "dark" || (themeMode === "auto" && systemDark.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themeMode = themeMode;
  document.querySelector('meta[name="theme-color"]').content = dark ? "#171b1e" : "#ffffff";
  themeTrigger.querySelector("use").setAttribute("href", dark ? "#i-theme-moon" : "#i-theme-sun");
  themeTrigger.setAttribute("aria-label", `${currentLocale === "zh" ? "外观" : "Appearance"}: ${themeLabel(themeMode)}`);
  themeChoices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === themeMode)));
}

function closeThemeMenu() {
  themeMenu.hidden = true;
  themeTrigger.setAttribute("aria-expanded", "false");
}

function updateLanguageLinks() {
  const section = pageFromUrl();
  const suffix = section === "home" ? "" : `#${section}`;
  document.querySelector('[data-language="en"]').href = `index.html${suffix}`;
  document.querySelector('[data-language="zh"]').href = `zh.html${suffix}`;
}

let current = "home";
let orbitStep = 0;
let transitioning = false;
let pendingNavigation = null;
let wheelAmount = 0;
let wheelLockedUntil = 0;
let wheelReleaseTimer = 0;
let orbitHintStartTimer = 0;
let orbitHintEndTimer = 0;
let orbitHintPlayed = false;
try { orbitHintPlayed = sessionStorage.getItem(orbitHintKey) === "1"; } catch (_) { /* Keep the hint for this visit. */ }

function dismissOrbitHint(markSeen = true) {
  window.clearTimeout(orbitHintStartTimer);
  window.clearTimeout(orbitHintEndTimer);
  orbitHintButton.classList.remove("is-intro-hint");
  if (!markSeen) return;
  orbitHintPlayed = true;
  try { sessionStorage.setItem(orbitHintKey, "1"); } catch (_) { /* In-memory state still prevents a replay. */ }
}

function canShowOrbitHint() {
  return !document.hidden && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function queueOrbitHint() {
  if (orbitHintPlayed || !canShowOrbitHint()) return;
  window.clearTimeout(orbitHintStartTimer);
  orbitHintStartTimer = window.setTimeout(() => {
    if (current !== "home" || home.hidden || transitioning || !canShowOrbitHint()) return;
    orbitHintButton.classList.add("is-intro-hint");
    orbitHintEndTimer = window.setTimeout(() => dismissOrbitHint(), 1900);
  }, 1450);
}

function clearWheelPreview(immediate = false) {
  window.clearTimeout(wheelReleaseTimer);
  wheelAmount = 0;
  ring.style.setProperty("--wheel-nudge", "0deg");
  if (immediate) reader.classList.remove("is-wheel-interacting");
  else wheelReleaseTimer = window.setTimeout(() => reader.classList.remove("is-wheel-interacting"), 220);
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function pageFromUrl() {
  const name = window.location.hash.slice(1).toLowerCase();
  return pages.has(name) ? name : "home";
}

function setTitle(name) {
  if (currentLocale === "zh") {
    document.title = name === "home" ? "Greenhats · 我的作品集" : `${sectionLabels[name]} · Greenhats`;
  } else {
    document.title = name === "home" ? "Greenhats · My Portfolio" : `${name[0].toUpperCase()}${name.slice(1)} · Greenhats`;
  }
}

function delay(ms) {
  return new Promise(resolve => window.setTimeout(resolve, reducedMotion.matches ? 0 : ms));
}

function focusPage(name) {
  const heading = name === "home" ? home.querySelector("h1") : pages.get(name).querySelector("h2");
  heading.focus({ preventScroll: true });
}

function setRingStep(step) {
  orbitStep = step;
  const angle = -step * stepAngle;
  ring.style.setProperty("--reader-angle", `${angle}deg`);
  ring.style.setProperty("--counter-angle", `${-angle}deg`);
  const activeIndex = modulo(step, sectionNames.length);
  readerNodes.forEach((node, index) => {
    const active = index === activeIndex;
    const adjacent = index === modulo(activeIndex + 1, sectionNames.length);
    const button = node.querySelector("button");
    node.classList.toggle("is-current", active);
    node.classList.toggle("is-adjacent", adjacent);
    button.tabIndex = active || adjacent ? 0 : -1;
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  readerCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / 07`;
  dialIndex.textContent = String(activeIndex + 1).padStart(2, "0");
}

function nearestStep(targetIndex) {
  const currentIndex = modulo(orbitStep, sectionNames.length);
  let distance = targetIndex - currentIndex;
  if (distance > sectionNames.length / 2) distance -= sectionNames.length;
  if (distance < -sectionNames.length / 2) distance += sectionNames.length;
  return orbitStep + distance;
}

async function flyButton(source, target, duration = 580) {
  if (reducedMotion.matches) return null;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const offsetX = to.left - from.left;
  const offsetY = to.top - from.top;
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  const clone = source.cloneNode(true);
  clone.classList.remove("is-selected", "is-landing", "is-flight-target");
  clone.classList.add("portal-button");
  clone.dataset.page = source.dataset.page || source.closest("[data-page]").dataset.page;
  clone.tabIndex = -1;
  clone.setAttribute("aria-hidden", "true");
  clone.style.setProperty("--portal-icon-size", `${target.querySelector(".nav-icon").getBoundingClientRect().width}px`);
  Object.assign(clone.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`
  });
  document.body.append(clone);
  const animation = clone.animate([
    { transform: "translate3d(0,0,0) scale(1,1)", opacity: 1 },
    { transform: `translate3d(${offsetX}px,${offsetY}px,0) scale(${scaleX},${scaleY})`, opacity: 1 }
  ], { duration, easing: "cubic-bezier(.32,.05,.18,1)", fill: "forwards" });
  clone.querySelector(".nav-icon").animate([
    { transform: "scale(1,1)" },
    { transform: `scale(${1 / scaleX},${1 / scaleY})` }
  ], { duration, easing: "cubic-bezier(.32,.05,.18,1)", fill: "forwards" });
  try { await animation.finished; } catch (_) { /* A new navigation may cancel the flight. */ }
  return clone;
}

async function settleFlight(portal, target) {
  target.classList.add("is-landing");
  target.classList.remove("is-flight-target");
  if (!portal) {
    target.classList.remove("is-landing");
    return;
  }
  await new Promise(resolve => requestAnimationFrame(resolve));
  target.classList.remove("is-landing");
  const fade = portal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out", fill: "forwards" });
  try { await fade.finished; } catch (_) { /* Keep the destination visible. */ }
  portal.remove();
}

async function enterReader(name) {
  const chosen = homeButtons.find(button => button.dataset.page === name);
  const targetNode = readerNodes.find(node => node.dataset.page === name);
  chosen.classList.add("is-selected");
  await delay(70);

  reader.classList.add("is-preparing", "no-ring-motion");
  setRingStep(sectionNames.indexOf(name));
  reader.hidden = false;
  const next = pages.get(name);
  next.hidden = false;
  next.classList.add("is-active");
  const targetButton = targetNode.querySelector("button");
  const flight = flyButton(chosen, targetButton);
  chosen.classList.add("is-flight-target");
  targetNode.classList.add("is-flight-target");
  home.classList.add("is-leaving");
  await delay(110);
  reader.classList.remove("is-preparing", "no-ring-motion");
  await delay(220);
  home.hidden = true;
  const portal = await flight;

  chosen.classList.remove("is-selected", "is-flight-target");
  await settleFlight(portal, targetNode);
  home.classList.remove("is-leaving");
  next.classList.remove("is-active");
  current = name;
  setTitle(name);
  focusPage(name);
}

async function changeSection(name) {
  const previous = pages.get(current);
  const next = pages.get(name);
  setRingStep(nearestStep(sectionNames.indexOf(name)));
  previous.classList.add("is-leaving");
  await delay(220);
  previous.hidden = true;
  previous.classList.remove("is-leaving", "is-active");
  next.hidden = false;
  next.scrollTop = 0;
  next.classList.add("is-active");
  current = name;
  setTitle(name);
  focusPage(name);
  await delay(510);
  next.classList.remove("is-active");
}

async function returnHome() {
  const previous = pages.get(current);
  const sourceNode = readerNodes.find(node => node.dataset.page === current);
  const sourceButton = sourceNode.querySelector("button");
  const targetButton = homeButtons.find(button => button.dataset.page === current);
  home.classList.add("has-told-intro");
  home.classList.add("is-returning");
  home.hidden = false;
  targetButton.classList.add("is-flight-target");
  const flight = flyButton(sourceButton, targetButton, 570);
  sourceNode.classList.add("is-flight-target");
  reader.classList.add("is-closing");
  await delay(180);
  home.classList.remove("is-returning");
  const portal = await flight;
  previous.hidden = true;
  previous.classList.remove("is-active", "is-leaving");
  reader.hidden = true;
  reader.classList.remove("is-closing");
  sourceNode.classList.remove("is-flight-target");
  await settleFlight(portal, targetButton);
  current = "home";
  setTitle("home");
  focusPage("home");
  queueOrbitHint();
}

async function navigate(name, updateHistory = true) {
  if (!pages.has(name)) return;
  if (transitioning) {
    pendingNavigation = { name, updateHistory };
    return;
  }
  if (name === current) return;
  if (current === "home") dismissOrbitHint();
  transitioning = true;
  clearWheelPreview(true);
  if (updateHistory) {
    const url = name === "home" ? window.location.pathname + window.location.search : `#${name}`;
    history.pushState({ page: name }, "", url);
    updateLanguageLinks();
  }
  if (current === "home") await enterReader(name);
  else if (name === "home") await returnHome();
  else await changeSection(name);
  transitioning = false;

  const pending = pendingNavigation;
  pendingNavigation = null;
  if (pending && pending.name !== current) return navigate(pending.name, pending.updateHistory);
  const requested = pageFromUrl();
  if (requested !== current) navigate(requested, false);
}

function stepSection(direction) {
  if (current === "home" || transitioning) return;
  const index = sectionNames.indexOf(current);
  navigate(sectionNames[modulo(index + direction, sectionNames.length)]);
}

function showInitial(name) {
  pages.forEach((page, key) => { page.hidden = key !== name; });
  reader.hidden = name === "home";
  if (name !== "home") setRingStep(sectionNames.indexOf(name));
  current = name;
  setTitle(name);
  updateLanguageLinks();
}

readerNodes.forEach((node, index) => {
  const angle = (-45 + index * stepAngle) * Math.PI / 180;
  node.style.left = `${50 + 46.5 * Math.cos(angle)}%`;
  node.style.top = `${50 + 46.5 * Math.sin(angle)}%`;
  node.querySelector("button").addEventListener("click", () => navigate(node.dataset.page));
});
reader.querySelectorAll(".reader-disc i").forEach((tick, index) => {
  const angle = (-45 + (index + .5) * stepAngle) * Math.PI / 180;
  tick.style.left = `${50 + 48.7 * Math.cos(angle)}%`;
  tick.style.top = `${50 + 48.7 * Math.sin(angle)}%`;
});
homeButtons.forEach(button => {
  button.addEventListener("pointerenter", () => { if (current === "home") dismissOrbitHint(); });
  button.addEventListener("click", () => navigate(button.dataset.page));
});
document.addEventListener("pointerdown", () => { if (current === "home") dismissOrbitHint(); }, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) dismissOrbitHint(false);
  else if (current === "home") queueOrbitHint();
});
document.querySelectorAll("[data-go-home]").forEach(button => button.addEventListener("click", () => navigate("home")));
document.querySelectorAll("[data-language]").forEach(link => link.addEventListener("click", event => {
  if (link.dataset.language === currentLocale) { event.preventDefault(); return; }
  event.preventDefault();
  updateLanguageLinks();
  try { sessionStorage.setItem(languageTransitionKey, "1"); } catch (_) { /* Navigation still works. */ }
  document.documentElement.classList.add("locale-leaving");
  window.setTimeout(() => window.location.assign(link.href), reducedMotion.matches ? 0 : 210);
}));
themeTrigger.addEventListener("click", () => {
  const open = themeMenu.hidden;
  themeMenu.hidden = !open;
  themeTrigger.setAttribute("aria-expanded", String(open));
});
themeChoices.forEach(button => button.addEventListener("click", () => {
  setTheme(button.dataset.themeChoice, true, true);
  closeThemeMenu();
  themeTrigger.focus();
}));
document.addEventListener("pointerdown", event => {
  if (!themeControl.contains(event.target)) closeThemeMenu();
}, { passive: true });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !themeMenu.hidden) { event.stopImmediatePropagation(); closeThemeMenu(); themeTrigger.focus(); }
});
systemDark.addEventListener("change", () => { if (themeMode === "auto") setTheme("auto", false, true); });
reader.querySelectorAll("[data-step]").forEach(button => button.addEventListener("click", () => stepSection(Number(button.dataset.step))));
window.addEventListener("popstate", () => { updateLanguageLinks(); navigate(pageFromUrl(), false); });
window.addEventListener("hashchange", () => { updateLanguageLinks(); navigate(pageFromUrl(), false); });

window.addEventListener("wheel", event => {
  if (reader.hidden) return;
  if (transitioning) {
    event.preventDefault();
    return;
  }
  const amount = event.deltaY * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? window.innerHeight : 1);
  if (Math.abs(amount) < .5) return;
  const active = pages.get(current);
  const maxScroll = active.scrollHeight - active.clientHeight;
  const overContent = event.target instanceof Element && event.target.closest(".content-view");
  if (overContent && maxScroll > 4 && ((amount > 0 && active.scrollTop < maxScroll - 2) || (amount < 0 && active.scrollTop > 2))) {
    if (wheelAmount) clearWheelPreview();
    return;
  }
  event.preventDefault();
  const now = performance.now();
  if (now < wheelLockedUntil) return;
  if (wheelAmount && Math.sign(wheelAmount) !== Math.sign(amount)) wheelAmount *= .25;
  const resistedAmount = Math.sign(amount) * Math.min(Math.abs(amount), 110) * wheelResistance;
  wheelAmount = Math.max(-wheelThreshold, Math.min(wheelThreshold, wheelAmount + resistedAmount));
  if (!reducedMotion.matches) {
    reader.classList.add("is-wheel-interacting");
    ring.style.setProperty("--wheel-nudge", `${(-wheelAmount / wheelThreshold * 12).toFixed(2)}deg`);
  }
  window.clearTimeout(wheelReleaseTimer);
  wheelReleaseTimer = window.setTimeout(() => clearWheelPreview(), 1050);
  if (Math.abs(wheelAmount) < wheelThreshold) return;
  const direction = Math.sign(wheelAmount);
  wheelLockedUntil = now + (reducedMotion.matches ? 350 : 900);
  stepSection(direction);
}, { passive: false });

document.addEventListener("keydown", event => {
  if (current === "home") { dismissOrbitHint(); return; }
  if (event.key === "Escape") { event.preventDefault(); navigate("home"); }
  if (["ArrowDown", "PageDown"].includes(event.key)) { event.preventDefault(); stepSection(1); }
  if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); stepSection(-1); }
});

setTheme(themeMode);
if (document.documentElement.classList.contains("locale-arriving")) home.classList.add("has-told-intro");
showInitial(pageFromUrl());
if (current === "home") queueOrbitHint();

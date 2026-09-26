const sectionNames = ["experience", "skills", "gallery", "achievements", "travel", "internship", "contact"];
const pages = new Map(["home", ...sectionNames].map(name => [name, document.querySelector(`[data-view="${name}"]`)]));
const home = pages.get("home");
const reader = document.querySelector("[data-reader]");
const ring = reader.querySelector(".reader-orbit");
const homeButtons = [...document.querySelectorAll(".orbit-button")];
const readerNodes = [...reader.querySelectorAll(".reader-node")];
const readerCount = reader.querySelector(".reader-count");
const dialIndex = reader.querySelector(".reader-dial-index strong");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const stepAngle = 360 / sectionNames.length;
const wheelThreshold = 280;
const wheelResistance = .7;
const languageKey = "greenhats-portfolio-language";
const sectionLabels = {
  experience: "经历", skills: "技能", gallery: "项目", achievements: "荣誉",
  travel: "旅行", internship: "求职", contact: "联系"
};
const shortEnglishLabels = { experience: "Exper.", achievements: "Achiev.", internship: "Intern." };
const copyDefinitions = [
  [".skip-link", "跳转到内容"],
  [".intro-title-text", "你好，我是 Greenhats"],
  [".intro-line:nth-child(1)", "学生"],
  [".intro-line:nth-child(2)", "AI 全栈 / Agent 开发者"],
  [".intro-line:nth-child(3)", "动画爱好者"],
  [".back-button", "返回首页", "lastText"],

  ["[data-view='experience'] .page-heading h2", "经历", "firstText"],
  ["[data-view='experience'] .timeline article:nth-child(1) .eyebrow", "开源贡献"],
  ["[data-view='experience'] .timeline article:nth-child(1) h3", "LoopX 贡献者"],
  ["[data-view='experience'] .timeline article:nth-child(1) p", "为长期运行的 AI Agent 控制平台补充编码回归测试及 Node 26 兼容性测试。"],
  ["[data-view='experience'] .timeline article:nth-child(2) .timeline-date", "个人项目"],
  ["[data-view='experience'] .timeline article:nth-child(2) .eyebrow", "应用开发"],
  ["[data-view='experience'] .timeline article:nth-child(2) p", "开发 AI 营养应用与 RSS 自动化工具，涵盖 Go 后端、AI 服务与测试。"],
  ["[data-view='experience'] .timeline article:nth-child(3) .eyebrow", "教育经历"],
  ["[data-view='experience'] .timeline article:nth-child(3) h3", "软件工程"],
  ["[data-view='experience'] .timeline article:nth-child(3) p", "河北科技大学本科在读，预计 2028 年 6 月毕业。"],

  ["[data-view='skills'] .page-heading h2", "技能", "firstText"],
  ["[data-view='skills'] .detail-row:nth-child(1) h3", "AI 与 Agent"],
  ["[data-view='skills'] .detail-row:nth-child(1) p", "实践 Agent 循环、工具调用、RAG 与向量检索；在 <a href='https://github.com/Green-hats/NutriGo' target='_blank' rel='noopener noreferrer'>NutriGo<span class='external-mark' aria-hidden='true'>↗</span></a> 中结合 LiteLLM、BGE-small-zh 与 ChromaDB 构建五个营养工具。", "html"],
  ["[data-view='skills'] .detail-row:nth-child(2) h3", "后端系统"],
  ["[data-view='skills'] .detail-row:nth-child(2) p", "使用 Go 与 Python 开发 REST API、数据持久化、JWT 认证及服务集成。"],
  ["[data-view='skills'] .detail-row:nth-child(3) h3", "自动化与交付"],
  ["[data-view='skills'] .detail-row:nth-child(3) p", "在 <a href='https://github.com/Green-hats/AniGo' target='_blank' rel='noopener noreferrer'>AniGo<span class='external-mark' aria-hidden='true'>↗</span></a> 中实现 RSS 工作流、LLM 辅助解析与规则筛选；使用 Docker Compose、GitHub Actions、pytest 和 Go test。", "html"],
  ["[data-view='skills'] .detail-row:nth-child(3) .tag-line span:last-child", "测试"],

  ["[data-view='gallery'] .page-heading h2", "项目", "firstText"],
  ["[data-view='gallery'] .project-tile:nth-child(1) .project-type", "AI 应用"],
  ["[data-view='gallery'] .project-tile:nth-child(1) .project-copy p", "结合食物识别、营养分析及具备五个工具的 Agent，并接入 2,277 条知识的 RAG 数据库。"],
  ["[data-view='gallery'] .project-tile:nth-child(1) .project-facts span:nth-child(1)", "5 个 Agent 工具"],
  ["[data-view='gallery'] .project-tile:nth-child(1) .project-facts span:nth-child(2)", "2,277 条 RAG 知识"],
  ["[data-view='gallery'] .project-tile:nth-child(2) .project-type", "自动化"],
  ["[data-view='gallery'] .project-tile:nth-child(2) .project-copy p", "通过 LLM 解析 RSS 发布信息，再用规则选择版本并协调云端任务。"],
  ["[data-view='gallery'] .project-tile:nth-child(2) .project-facts span:nth-child(2)", "LLM 解析"],
  ["[data-view='gallery'] .project-tile:nth-child(2) .project-facts span:nth-child(3)", "规则筛选"],
  ["[data-view='gallery'] .project-copy a", "查看项目 ", "firstText"],

  ["[data-view='achievements'] .page-heading h2", "荣誉", "firstText"],
  ["[data-view='achievements'] .award-list article:nth-child(1) .eyebrow", "编程竞赛"],
  ["[data-view='achievements'] .award-list article:nth-child(1) h3", "蓝桥杯"],
  ["[data-view='achievements'] .award-list article:nth-child(1) p", "全国软件和信息技术专业人才大赛 · 软件赛 Python 组"],
  ["[data-view='achievements'] .award-list article:nth-child(1) strong", "全国总决赛<br>三等奖", "html"],
  ["[data-view='achievements'] .award-list article:nth-child(2) .eyebrow", "数学建模"],
  ["[data-view='achievements'] .award-list article:nth-child(2) p", "美国大学生数学建模竞赛 / 交叉学科建模竞赛"],
  ["[data-view='achievements'] .award-list article:nth-child(2) strong", "S 奖"],

  ["[data-view='travel'] .page-heading h2", "旅行", "firstText"],
  ["[data-view='travel'] .travel-copy .eyebrow", "暂无记录"],
  ["[data-view='travel'] .travel-copy h3", "后续更新。"],

  ["[data-view='internship'] .page-heading h2", "求职", "firstText"],
  ["[data-view='internship'] .internship-focus p", "我正在寻找以下方向的机会"],
  ["[data-view='internship'] .internship-focus h3", "AI Agent <span>/</span><br>AI 全栈开发", "html"],
  ["[data-view='internship'] .internship-focus>a", "联系我 ", "firstText"],

  ["[data-view='contact'] .page-heading h2", "联系", "firstText"],
  ["[data-view='contact'] .contact-primary .eyebrow", "邮箱"],
  ["[data-view='contact'] .contact-secondary .eyebrow", "查看我的作品"],
];
Object.entries(sectionLabels).forEach(([page, label]) => {
  copyDefinitions.push([`.orbit-button[data-page='${page}'] span, .reader-node[data-page='${page}'] .reader-button span`, label]);
});
function readCopy(node, mode) {
  if (mode === "html") return node.innerHTML;
  if (mode === "firstText") return node.firstChild.textContent;
  if (mode === "lastText") return node.lastChild.textContent;
  return node.textContent;
}
function writeCopy(node, mode, value) {
  if (mode === "html") node.innerHTML = value;
  else if (mode === "firstText") node.firstChild.textContent = value;
  else if (mode === "lastText") node.lastChild.textContent = value;
  else node.textContent = value;
}
const copyTargets = copyDefinitions.map(([selector, zh, mode = "text"]) => {
  const nodes = [...document.querySelectorAll(selector)];
  return { nodes, en: nodes.map(node => readCopy(node, mode)), zh, mode };
});
function savedLanguage() {
  try { return localStorage.getItem(languageKey) === "zh" ? "zh" : "en"; }
  catch (_) { return "en"; }
}
let currentLocale = savedLanguage();
function applyLocale(locale, remember = false) {
  currentLocale = locale;
  if (remember) {
    home.classList.add("has-told-intro");
    try { localStorage.setItem(languageKey, locale); } catch (_) { /* Keep the choice for this visit. */ }
  }
  copyTargets.forEach(({ nodes, en, zh, mode }) => nodes.forEach((node, index) => {
    writeCopy(node, mode, locale === "zh" ? zh : en[index]);
  }));
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.querySelector("meta[name='description']").content = locale === "zh"
    ? "Greenhats 的个人作品集：软件工程学生、AI 全栈与 Agent 开发者、动画爱好者。"
    : "A personal portfolio for Greenhats — student, AI full-stack and agent developer, and animation enthusiast.";
  document.querySelector(".brand").setAttribute("aria-label", locale === "zh" ? "Greenhats，返回首页" : "Greenhats — return home");
  home.setAttribute("aria-label", locale === "zh" ? "首页" : "Home");
  document.querySelector(".character").alt = locale === "zh" ? "原始奶油色卡通角色，带深色斑块与温和笑容" : "Original cream-colored cartoon character with a dark patch and a gentle smile";
  document.querySelector(".project-art-nutri img").alt = locale === "zh" ? "NutriGo AI 聊天界面" : "NutriGo AI chat screen";
  document.querySelector(".project-art-anigo img").alt = locale === "zh" ? "AniGo 订阅管理界面" : "AniGo subscription dashboard";
  document.querySelectorAll(".orbit-nav,.reader-nav").forEach(nav => nav.setAttribute("aria-label", locale === "zh" ? "作品集章节" : "Portfolio sections"));
  [...homeButtons, ...readerNodes.map(node => node.querySelector("button"))].forEach(button => {
    const page = button.closest("[data-page]").dataset.page;
    button.setAttribute("aria-label", locale === "zh" ? sectionLabels[page] : page[0].toUpperCase() + page.slice(1));
  });
  reader.querySelector(".reader-controls").setAttribute("aria-label", locale === "zh" ? "章节控制" : "Section controls");
  reader.querySelector("[data-step='-1']").setAttribute("aria-label", locale === "zh" ? "上一章节" : "Previous section");
  reader.querySelector("[data-step='1']").setAttribute("aria-label", locale === "zh" ? "下一章节" : "Next section");
  document.querySelectorAll("[data-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.language === locale)));
  document.querySelector("[data-language='en']").setAttribute("aria-label", "Switch to English");
  document.querySelector("[data-language='zh']").setAttribute("aria-label", "切换到中文");
  document.querySelectorAll(".portal-button[data-page]").forEach(button => {
    button.querySelectorAll("span").forEach(label => {
      label.textContent = locale === "zh" ? sectionLabels[button.dataset.page]
        : label.classList.contains("nav-label-short") ? shortEnglishLabels[button.dataset.page]
          : button.dataset.page[0].toUpperCase() + button.dataset.page.slice(1);
    });
  });
  setTitle(current);
  document.documentElement.classList.remove("locale-pending");
}
let current = "home";
let orbitStep = 0;
let transitioning = false;
let pendingNavigation = null;
let wheelAmount = 0;
let wheelLockedUntil = 0;
let wheelReleaseTimer = 0;

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
}

async function navigate(name, updateHistory = true) {
  if (!pages.has(name)) return;
  if (transitioning) {
    pendingNavigation = { name, updateHistory };
    return;
  }
  if (name === current) return;
  transitioning = true;
  clearWheelPreview(true);
  if (updateHistory) {
    const url = name === "home" ? window.location.pathname + window.location.search : `#${name}`;
    history.pushState({ page: name }, "", url);
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
homeButtons.forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
document.querySelectorAll("[data-go-home]").forEach(button => button.addEventListener("click", () => navigate("home")));
document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => {
  if (button.dataset.language !== currentLocale) applyLocale(button.dataset.language, true);
}));
reader.querySelectorAll("[data-step]").forEach(button => button.addEventListener("click", () => stepSection(Number(button.dataset.step))));
window.addEventListener("popstate", () => navigate(pageFromUrl(), false));
window.addEventListener("hashchange", () => navigate(pageFromUrl(), false));

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
  if (current === "home") return;
  if (event.key === "Escape") { event.preventDefault(); navigate("home"); }
  if (["ArrowDown", "PageDown"].includes(event.key)) { event.preventDefault(); stepSection(1); }
  if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); stepSection(-1); }
});

applyLocale(currentLocale);
showInitial(pageFromUrl());

const names = ["home", "skills", "gallery", "internship", "contact", "travel", "experience", "achievements"];
const pages = new Map(names.map(name => [name, document.querySelector(`[data-view="${name}"]`)]));
const home = pages.get("home");
const navButtons = [...document.querySelectorAll(".orbit-button")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = "home";
let transitioning = false;
let pendingNavigation = null;

function pageFromUrl() {
  const name = window.location.hash.slice(1).toLowerCase();
  return pages.has(name) ? name : "home";
}

function setTitle(name) {
  document.title = name === "home" ? "XXX · My Portfolio" : `${name[0].toUpperCase()}${name.slice(1)} · XXX`;
}

function delay(ms) {
  return new Promise(resolve => window.setTimeout(resolve, reducedMotion.matches ? 0 : ms));
}

function focusPage(name) {
  if (name === "home") {
    home.querySelector("h1").focus({ preventScroll: true });
  } else {
    pages.get(name).querySelector("h2").focus({ preventScroll: true });
  }
}

function showInitial(name) {
  pages.forEach((page, key) => { page.hidden = key !== name; });
  current = name;
  setTitle(name);
}

async function navigate(name, updateHistory = true) {
  if (!pages.has(name)) return;
  if (transitioning) {
    pendingNavigation = { name, updateHistory };
    return;
  }
  if (name === current) return;

  transitioning = true;
  if (updateHistory) {
    const url = name === "home" ? window.location.pathname + window.location.search : `#${name}`;
    history.pushState({ page: name }, "", url);
  }

  const previous = pages.get(current);
  const next = pages.get(name);
  if (current === "home") {
    const chosen = navButtons.find(button => button.dataset.page === name);
    chosen?.classList.add("is-selected");
    await delay(140);
    home.classList.add("is-leaving");
    await delay(280);
    home.hidden = true;
    home.classList.remove("is-leaving");
    chosen?.classList.remove("is-selected");
  } else {
    previous.classList.add("is-leaving");
    await delay(250);
    previous.hidden = true;
    previous.classList.remove("is-leaving", "is-active");
  }

  next.hidden = false;
  next.classList.add(name === "home" ? "is-entering" : "is-active");
  current = name;
  setTitle(name);
  window.scrollTo({ top: 0, behavior: "instant" });
  await delay(50);
  focusPage(name);
  await delay(430);
  next.classList.remove("is-entering", "is-active");
  transitioning = false;

  if (pendingNavigation) {
    const pending = pendingNavigation;
    pendingNavigation = null;
    if (pending.name !== current) {
      navigate(pending.name, pending.updateHistory);
      return;
    }
  }
  const requested = pageFromUrl();
  if (requested !== current) navigate(requested, false);
}

navButtons.forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
document.querySelectorAll("[data-go-home]").forEach(button => button.addEventListener("click", () => navigate("home")));
window.addEventListener("popstate", () => navigate(pageFromUrl(), false));
window.addEventListener("hashchange", () => navigate(pageFromUrl(), false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && current !== "home") navigate("home");
});

showInitial(pageFromUrl());

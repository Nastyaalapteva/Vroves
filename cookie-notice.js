/* Минималистичные куки — автономный скрипт.
   Подключите на каждой странице одной строкой перед </body>:
   <script src="cookie-notice.js"></script>
   Появляется сразу, не блокирует сайт, запоминает закрытие на 30 дней. */
(function () {
  var STORAGE_KEY = "umiCookieNotice";
  var SHOW_DELAY_MS = 0;
  var HIDE_AFTER_ACCEPT_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней
  var excludedPages = ["/privacy-policy/"];

  var CSS = `
.umi-cookie-notice {
  --umi-graphite: #1a1c1e;
  --umi-blue: #0057ff;
  --umi-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --umi-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.umi-cookie-notice[hidden] {
  display: none !important;
}
.umi-cookie-notice {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: clamp(0.75rem, 3vw, 1.25rem);
  padding-bottom: max(clamp(0.75rem, 3vw, 1.25rem), env(safe-area-inset-bottom));
  font-family: var(--umi-font);
  pointer-events: none;
}

.umi-cookie-notice__overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.38s var(--umi-ease);
  cursor: default;
}
.umi-cookie-notice--visible .umi-cookie-notice__overlay {
  opacity: 1;
}
.umi-cookie-notice--closing .umi-cookie-notice__overlay {
  opacity: 0;
}
.umi-cookie-notice__bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(calc(100% - 1.5rem), 60rem);
  padding: 0.85rem 0.85rem 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 250, 0.96));
  box-shadow: 0 12px 40px rgba(26, 28, 30, 0.18), 0 0 0 1px rgba(0, 87, 255, 0.06);
  color: var(--umi-graphite);
  opacity: 0;
  transform: translateY(1rem);
  transition: opacity 0.38s var(--umi-ease), transform 0.38s var(--umi-ease);
  pointer-events: auto;
}
.umi-cookie-notice--visible .umi-cookie-notice__bar {
  opacity: 1;
  transform: translateY(0);
}
.umi-cookie-notice--closing .umi-cookie-notice__bar {
  opacity: 0;
  transform: translateY(0.5rem);
}
.umi-cookie-notice__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgba(0, 87, 255, 0.1);
  color: var(--umi-blue);
}
.umi-cookie-notice__text {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: clamp(0.8125rem, 2vw, 0.875rem);
  line-height: 1.5;
  color: rgba(26, 28, 30, 0.78);
}
.umi-cookie-notice__link {
  color: var(--umi-blue);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.15em;
  text-decoration-color: rgba(0, 87, 255, 0.35);
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}
.umi-cookie-notice__link:hover,
.umi-cookie-notice__link:focus-visible {
  color: #003dcc;
  text-decoration-color: currentColor;
  outline: none;
}
.umi-cookie-notice__link:focus-visible {
  outline: 2px solid var(--umi-blue);
  outline-offset: 2px;
  border-radius: 2px;
}
.umi-cookie-notice__ok {
  flex-shrink: 0;
  min-height: 2.35rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: linear-gradient(115deg, #003dcc, var(--umi-blue) 45%, #1a74ff);
  box-shadow: 0 6px 20px rgba(0, 87, 255, 0.28);
  color: #fff;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: transform 0.3s var(--umi-ease), box-shadow 0.3s var(--umi-ease), filter 0.3s var(--umi-ease);
}
.umi-cookie-notice__ok:hover,
.umi-cookie-notice__ok:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 8px 26px rgba(0, 87, 255, 0.38);
  filter: brightness(1.05);
  outline: none;
}
.umi-cookie-notice__ok:focus-visible {
  outline: 2px solid var(--umi-graphite);
  outline-offset: 3px;
}
.umi-cookie-notice__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  color: rgba(26, 28, 30, 0.4);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: background 0.2s ease, color 0.2s ease;
  padding: 0;
}
.umi-cookie-notice__close:hover,
.umi-cookie-notice__close:focus-visible {
  background: rgba(26, 28, 30, 0.08);
  color: rgba(26, 28, 30, 0.85);
  outline: none;
}
.umi-cookie-notice__close:focus-visible {
  outline: 2px solid var(--umi-blue);
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .umi-cookie-notice__bar {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.65rem 0.75rem;
    width: 100%;
    padding: 0.9rem 1rem;
    border-radius: 1.1rem;
  }
  .umi-cookie-notice__ok {
    width: 100%;
    min-height: 2.5rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .umi-cookie-notice__overlay,
  .umi-cookie-notice__bar {
    transition: opacity 0.2s ease;
  }
  .umi-cookie-notice__ok:hover,
  .umi-cookie-notice__ok:focus-visible {
    transform: none;
  }
}
`;

  var HTML = `
<div
  class="umi-cookie-notice"
  id="umiCookieNotice"
  hidden
  role="dialog"
  aria-modal="true"
  aria-label="Cookie notice"
>
  <div class="umi-cookie-notice__overlay" data-umi-cookie-overlay aria-hidden="true"></div>
  <div class="umi-cookie-notice__bar">
    <span class="umi-cookie-notice__icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 8v5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        <circle cx="12" cy="16.25" r="1.1" fill="currentColor"/>
      </svg>
    </span>
    <p class="umi-cookie-notice__text">
     This website uses cookies to improve your user experience. Parts of this website may not work as expected without cookies. Learn more about our cookies policy - <a class="umi-cookie-notice__link" href="Privacy_Policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
    </p>
    <button type="button" class="umi-cookie-notice__ok" id="umiCookieAcceptBtn">Ok</button>
    <button type="button" class="umi-cookie-notice__close" id="umiCookieCloseBtn" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</div>
`;

  function readAcceptance() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data.acceptedAt !== "number") return null;
      return data.acceptedAt;
    } catch (e) {
      return null;
    }
  }

  function saveAcceptance() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ acceptedAt: Date.now() }));
    } catch (e) {}
  }

  function isAcceptedRecently() {
    var acceptedAt = readAcceptance();
    return acceptedAt && Date.now() - acceptedAt < HIDE_AFTER_ACCEPT_MS;
  }

  function injectStyles() {
    if (document.getElementById("umiCookieNoticeStyles")) return;
    var style = document.createElement("style");
    style.id = "umiCookieNoticeStyles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function injectHTML() {
    document.body.insertAdjacentHTML("beforeend", HTML);
  }

  function initCookieNotice() {
    var path = window.location.pathname.replace(/\/+$/, "/") || "/";
    if (excludedPages.indexOf(path) !== -1) return;
    if (isAcceptedRecently()) return;

    injectStyles();
    injectHTML();

    var root = document.getElementById("umiCookieNotice");
    if (!root) return;

    var acceptBtn = document.getElementById("umiCookieAcceptBtn");
    var closeBtn  = document.getElementById("umiCookieCloseBtn");
    var overlay   = root.querySelector("[data-umi-cookie-overlay]");
    var showTimer = null;
    var hasBeenShown = false;

    function lockPage() {
      document.documentElement.classList.add("umi-cookie-notice-open");
    }
    function unlockPage() {
      document.documentElement.classList.remove("umi-cookie-notice-open");
    }

    function hideNotice() {
      root.classList.remove("umi-cookie-notice--visible");
      root.classList.add("umi-cookie-notice--closing");
      unlockPage();
      window.setTimeout(function () {
        root.setAttribute("hidden", "");
        root.remove();
      }, 320);
    }

    function showNotice() {
      if (hasBeenShown) return;
      hasBeenShown = true;
      root.removeAttribute("hidden");
      lockPage();
      window.requestAnimationFrame(function () {
        root.classList.add("umi-cookie-notice--visible");
      });
      window.setTimeout(function () {
        if (acceptBtn) acceptBtn.focus({ preventScroll: true });
      }, 420);
    }

    showTimer = window.setTimeout(showNotice, SHOW_DELAY_MS);

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        saveAcceptance();
        window.clearTimeout(showTimer);
        hideNotice();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        window.clearTimeout(showTimer);
        hideNotice();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    root.addEventListener("click", function (e) {
      if (e.target === root || e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    document.addEventListener(
      "touchmove",
      function (e) {
        if (!root.classList.contains("umi-cookie-notice--visible")) return;
        if (root.contains(e.target)) return;
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("umi-cookie-notice--visible")) {
        if (acceptBtn) acceptBtn.focus({ preventScroll: true });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCookieNotice);
  } else {
    initCookieNotice();
  }
})();

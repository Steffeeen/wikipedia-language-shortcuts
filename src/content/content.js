(() => {
  const NAMESPACE_PREFIXES = [
    "Special:",
    "Talk:",
    "User:",
    "Wikipedia:",
    "File:",
    "MediaWiki:",
    "Template:",
    "Help:",
    "Category:",
    "Portal:",
    "Draft:",
    "TimedText:",
    "Module:",
    "Gadget:",
    "Gadget_definition:",
    "Topic:"
  ];

  const MANUAL_BYPASS_PARAM = "wls_manual";
  const SWITCHER_ID = "wls-language-switcher";

  const shared = window.WIKI_LANG_SHORTCUTS;
  if (!shared) {
    return;
  }

  const { LANGUAGE_MAP, DEFAULT_SELECTED_LANGUAGES } = shared;

  const DEFAULT_SETTINGS = {
    selectedLanguages: DEFAULT_SELECTED_LANGUAGES,
    defaultRedirectLanguage: "",
    autoRedirectEnabled: true
  };

  if (!isArticlePage()) {
    return;
  }

  init().catch(() => {
    renderSwitcher({});
  });

  async function init() {
    const settings = await getSettings();
    const pageInfo = getPageInfo();
    if (!pageInfo) {
      return;
    }

    const langLinks = await fetchLanguageLinks(pageInfo.langCode, pageInfo.title);
    const languageMap = Object.assign({}, langLinks);
    languageMap[pageInfo.langCode] = {
      url: window.location.href,
      title: pageInfo.title
    };

    maybeRedirect(settings, pageInfo, languageMap);
    renderSwitcher(languageMap, settings, pageInfo.langCode);
  }

  function isArticlePage() {
    if (!window.location.pathname.startsWith("/wiki/")) {
      return false;
    }

    const titlePart = decodeURIComponent(window.location.pathname.replace("/wiki/", ""));
    if (!titlePart || titlePart === "Main_Page") {
      return true;
    }

    return !NAMESPACE_PREFIXES.some((prefix) => titlePart.startsWith(prefix));
  }

  function getPageInfo() {
    const hostMatch = window.location.hostname.match(/^([a-z-]+)\.wikipedia\.org$/i);
    if (!hostMatch) {
      return null;
    }

    const rawTitle = window.location.pathname.replace("/wiki/", "");
    if (!rawTitle) {
      return null;
    }

    return {
      langCode: hostMatch[1].toLowerCase(),
      title: rawTitle
    };
  }

  function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        const selected = Array.isArray(stored.selectedLanguages) && stored.selectedLanguages.length
          ? stored.selectedLanguages
          : DEFAULT_SELECTED_LANGUAGES;

        resolve({
          selectedLanguages: selected,
          defaultRedirectLanguage: typeof stored.defaultRedirectLanguage === "string"
            ? stored.defaultRedirectLanguage
            : "",
          autoRedirectEnabled: stored.autoRedirectEnabled !== false
        });
      });
    });
  }

  async function fetchLanguageLinks(originLang, title) {
    const url = new URL(`https://${originLang}.wikipedia.org/w/api.php`);
    url.searchParams.set("origin", "*");
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", "langlinks");
    url.searchParams.set("titles", title);
    url.searchParams.set("lllimit", "500");
    url.searchParams.set("redirects", "1");

    const response = await fetch(url.toString(), { credentials: "omit" });
    if (!response.ok) {
      return {};
    }

    const payload = await response.json();
    const pages = payload?.query?.pages;
    if (!pages) {
      return {};
    }

    const page = Object.values(pages)[0];
    const langlinks = page?.langlinks || [];

    return langlinks.reduce((acc, item) => {
      const code = String(item.lang || "").toLowerCase();
      const translatedTitle = item["*"];
      if (!code || !translatedTitle) {
        return acc;
      }

      const translatedPath = String(translatedTitle).replace(/ /g, "_");
      acc[code] = {
        title: translatedPath,
        url: `https://${code}.wikipedia.org/wiki/${encodeURIComponent(translatedPath)}`
      };
      return acc;
    }, {});
  }

  function maybeRedirect(settings, pageInfo, languageMap) {
    if (!settings.autoRedirectEnabled) {
      return;
    }

    const targetLang = settings.defaultRedirectLanguage;
    if (!targetLang || targetLang === pageInfo.langCode) {
      cleanupManualBypass();
      return;
    }

    const url = new URL(window.location.href);
    const hasManualBypass = url.searchParams.get(MANUAL_BYPASS_PARAM) === "1";
    if (hasManualBypass) {
      cleanupManualBypass();
      return;
    }

    const target = languageMap[targetLang];
    if (!target?.url) {
      return;
    }

    window.location.replace(target.url);
  }

  function cleanupManualBypass() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(MANUAL_BYPASS_PARAM)) {
      return;
    }

    url.searchParams.delete(MANUAL_BYPASS_PARAM);
    window.history.replaceState({}, "", url.toString());
  }

  function renderSwitcher(languageMap, settings = DEFAULT_SETTINGS, currentLang = "") {
    const heading = document.querySelector("#firstHeading");
    if (!heading || document.getElementById(SWITCHER_ID)) {
      return;
    }

    const selectedLanguages = settings.selectedLanguages || DEFAULT_SELECTED_LANGUAGES;
    const available = selectedLanguages
      .map((code) => {
        const lang = LANGUAGE_MAP[code];
        const target = languageMap[code];
        if (!lang || !target?.url) {
          return null;
        }
        return {
          code,
          name: lang.name,
          flag: lang.flag,
          url: target.url,
          isCurrent: code === currentLang
        };
      })
      .filter(Boolean);

    if (!available.length) {
      return;
    }

    const container = document.createElement("span");
    container.id = SWITCHER_ID;
    container.className = "wls-container";

    for (const item of available) {
      const link = document.createElement("a");
      link.className = `wls-chip${item.isCurrent ? " is-current" : ""}`;
      link.href = item.url;
      link.title = `${item.name} (${item.code})`;
      link.setAttribute("aria-label", `${item.name} Wikipedia`);

      if (!item.isCurrent) {
        const targetUrl = new URL(item.url);
        targetUrl.searchParams.set(MANUAL_BYPASS_PARAM, "1");
        link.href = targetUrl.toString();
      }

      const flag = document.createElement("span");
      flag.textContent = item.flag;
      flag.setAttribute("aria-hidden", "true");

      link.appendChild(flag);
      container.appendChild(link);
    }

    heading.appendChild(container);
  }
})();

(() => {
  const shared = window.WIKI_LANG_SHORTCUTS;
  if (!shared) {
    return;
  }

  const { LANGUAGE_LIST, DEFAULT_SELECTED_LANGUAGES } = shared;

  const DEFAULT_SETTINGS = {
    selectedLanguages: DEFAULT_SELECTED_LANGUAGES,
    defaultRedirectLanguage: "",
    autoRedirectEnabled: true
  };

  const languageListEl = document.getElementById("language-list");
  const searchEl = document.getElementById("language-search");
  const defaultLanguageEl = document.getElementById("default-language");
  const autoRedirectEl = document.getElementById("auto-redirect-enabled");
  const saveButtonEl = document.getElementById("save-button");
  const statusEl = document.getElementById("status");
  let selectedLanguagesState = new Set(DEFAULT_SELECTED_LANGUAGES);

  init().catch(() => {
    setStatus("Failed to load settings.", true);
  });

  async function init() {
    const settings = await getSettings();
    selectedLanguagesState = new Set(settings.selectedLanguages);
    renderLanguageList(settings.selectedLanguages);
    renderDefaultLanguageSelect(settings.defaultRedirectLanguage);
    autoRedirectEl.checked = settings.autoRedirectEnabled;

    searchEl.addEventListener("input", () => {
      renderLanguageList(Array.from(selectedLanguagesState), searchEl.value);
    });

    saveButtonEl.addEventListener("click", saveSettings);
  }

  function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        resolve({
          selectedLanguages: Array.isArray(stored.selectedLanguages) && stored.selectedLanguages.length
            ? stored.selectedLanguages
            : DEFAULT_SELECTED_LANGUAGES,
          defaultRedirectLanguage: typeof stored.defaultRedirectLanguage === "string"
            ? stored.defaultRedirectLanguage
            : "",
          autoRedirectEnabled: stored.autoRedirectEnabled !== false
        });
      });
    });
  }

  function renderLanguageList(selectedLanguages, query = "") {
    const selectedSet = new Set(selectedLanguages);
    const normalized = query.trim().toLowerCase();

    languageListEl.textContent = "";

    LANGUAGE_LIST
      .filter((lang) => {
        if (!normalized) {
          return true;
        }

        return lang.name.toLowerCase().includes(normalized) || lang.code.includes(normalized);
      })
      .forEach((lang) => {
        const wrapper = document.createElement("label");
        wrapper.className = "lang-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = lang.code;
        checkbox.checked = selectedSet.has(lang.code);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedLanguagesState.add(lang.code);
          } else {
            selectedLanguagesState.delete(lang.code);
          }
        });

        const text = document.createElement("span");
        text.textContent = `${lang.flag} ${lang.name} (${lang.code})`;

        wrapper.append(checkbox, text);
        languageListEl.appendChild(wrapper);
      });
  }

  function renderDefaultLanguageSelect(currentValue) {
    defaultLanguageEl.textContent = "";

    const disabledOption = document.createElement("option");
    disabledOption.value = "";
    disabledOption.textContent = "No default redirect";
    defaultLanguageEl.appendChild(disabledOption);

    for (const lang of LANGUAGE_LIST) {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = `${lang.flag} ${lang.name} (${lang.code})`;
      defaultLanguageEl.appendChild(option);
    }

    defaultLanguageEl.value = currentValue || "";
  }

  function getSelectedLanguages() {
    return Array.from(selectedLanguagesState);
  }

  async function saveSettings() {
    const selectedLanguages = getSelectedLanguages();
    if (!selectedLanguages.length) {
      setStatus("Select at least one language.", true);
      return;
    }

    const payload = {
      selectedLanguages,
      defaultRedirectLanguage: defaultLanguageEl.value,
      autoRedirectEnabled: autoRedirectEl.checked
    };

    await new Promise((resolve) => {
      chrome.storage.sync.set(payload, resolve);
    });

    setStatus("Settings saved.");
  }

  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? "var(--error)" : "var(--success)";

    if (!isError) {
      window.setTimeout(() => {
        if (statusEl.textContent === message) {
          statusEl.textContent = "";
        }
      }, 1800);
    }
  }
})();

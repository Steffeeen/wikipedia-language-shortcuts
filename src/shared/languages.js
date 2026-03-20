(() => {
  const LANGUAGE_LIST = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
    { code: "sv", name: "Swedish", flag: "🇸🇪" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "da", name: "Danish", flag: "🇩🇰" },
    { code: "fi", name: "Finnish", flag: "🇫🇮" },
    { code: "pl", name: "Polish", flag: "🇵🇱" },
    { code: "cs", name: "Czech", flag: "🇨🇿" },
    { code: "sk", name: "Slovak", flag: "🇸🇰" },
    { code: "hu", name: "Hungarian", flag: "🇭🇺" },
    { code: "ro", name: "Romanian", flag: "🇷🇴" },
    { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
    { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
    { code: "el", name: "Greek", flag: "🇬🇷" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "he", name: "Hebrew", flag: "🇮🇱" },
    { code: "fa", name: "Persian", flag: "🇮🇷" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", flag: "🇧🇩" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "th", name: "Thai", flag: "🇹🇭" },
    { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "ms", name: "Malay", flag: "🇲🇾" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "zh-hans", name: "Chinese (Simplified)", flag: "🇨🇳" },
    { code: "zh-hant", name: "Chinese (Traditional)", flag: "🇹🇼" },
    { code: "ca", name: "Catalan", flag: "🇪🇸" },
    { code: "eu", name: "Basque", flag: "🇪🇸" },
    { code: "gl", name: "Galician", flag: "🇪🇸" },
    { code: "sr", name: "Serbian", flag: "🇷🇸" },
    { code: "hr", name: "Croatian", flag: "🇭🇷" },
    { code: "sl", name: "Slovenian", flag: "🇸🇮" },
    { code: "lt", name: "Lithuanian", flag: "🇱🇹" },
    { code: "lv", name: "Latvian", flag: "🇱🇻" },
    { code: "et", name: "Estonian", flag: "🇪🇪" }
  ];

  const DEFAULT_SELECTED_LANGUAGES = ["en", "de", "fr", "es", "it"];

  const LANGUAGE_MAP = LANGUAGE_LIST.reduce((acc, language) => {
    acc[language.code] = language;
    return acc;
  }, {});

  const globalObject = typeof window !== "undefined" ? window : globalThis;
  globalObject.WIKI_LANG_SHORTCUTS = {
    LANGUAGE_LIST,
    LANGUAGE_MAP,
    DEFAULT_SELECTED_LANGUAGES
  };
})();

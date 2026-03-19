import { createI18n } from "vue-i18n";
import zhTW from "./locales/zh-TW";
import en from "./locales/en";
import ja from "./locales/ja";

const savedLocale = localStorage.getItem("account-tracker-lang");
const defaultLocale = savedLocale || (navigator.language.startsWith("zh") ? "zh-TW" : "en");

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: "en",
  messages: {
    "zh-TW": zhTW,
    en,
    ja,
  },
});

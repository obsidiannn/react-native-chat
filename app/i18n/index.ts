import i18n from "i18next";
import { initReactI18next } from 'react-i18next';
import zhHans from "./zh-Hans";
import zhHant from "./zh-Hant";
import ja from "./ja";
import en from "./en/index";
import ko from "./ko";
import pt from "./pt";
import es from "./es";
import fr from "./fr";
import de from "./de";
import it from "./it";
import ru from "./ru";
import tr from "./tr";

export const supportedLanguages = [
    { label: '繁體中文', value: 'zh-Hant' },
    { label: '简体中文', value: 'zh-Hans' },
    { label: 'English', value: 'en' },
    { label: '日本語', value: 'ja' },
    { label: '한국어', value: 'ko' },
    { label: 'Português', value: 'pt' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Italiano', value: 'it' },
    { label: 'Русский', value: 'ru' },
    { label: 'Türkçe', value: 'tr' },
]
const resources = {
    'zh-Hant': zhHant,
    'zh-Hans': zhHans,
    'en': en,
    'ja': ja,
    'pt': pt,
    'es': es,
    'fr': fr,
    'de': de,
    'it': it,
    'ru': ru,
    'tr': tr,
    'ko': ko,
}

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources,
        lng: 'ja',
        supportedLngs: ['zh','ja','ko','pt','es','fr','de','it','ru','tr','zh-Hant', 'zh-Hans', 'en'],
        fallbackLng: 'ja',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
    })
export default i18n
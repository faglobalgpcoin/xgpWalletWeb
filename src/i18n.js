import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from './lang/en';
import ko from './lang/ko';
import jp from './lang/jp';
import zh from './lang/zh';
import th from './lang/th';
import {getCookie} from './utils/auth';

// the translations
const resources = {
    en,
    ko,
    jp,
    zh,
    th
};

const localeCookie = getCookie('locale');

if (localeCookie) {
    i18n
        .use(initReactI18next) // passes i18n down to react-i18next
        .init({
            resources,
            lng: localeCookie,

            keySeparator: false, // we do not use keys in form messages.welcome

            interpolation: {
                escapeValue: false, // react already safes from xss
            },
        });
} else {
    i18n
        .use(initReactI18next) // passes i18n down to react-i18next
        .init({
            resources,
            lng: 'en',

            keySeparator: false, // we do not use keys in form messages.welcome

            interpolation: {
                escapeValue: false, // react already safes from xss
            },
        });
}

export default i18n;

import landingPageEn from "@/messages/en/landingPage.json";

import landingPageBn from "@/messages/bn/landingPage.json";

export const messages = {
    en: {
        landingPage: landingPageEn,
    },
    bn: {
        landingPage: landingPageBn,
    },
};

export const supportedLocales = Object.keys(messages);

export default messages;

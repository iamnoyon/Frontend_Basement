import enLandingPage from "./en/landingPage.json";
import bnLandingPage from "./bn/landingPage.json";

export const messages = {
    en: {
        landingPage: enLandingPage,
    },
    bn: {
        landingPage: bnLandingPage,
    },
};

export const supportedLocales = Object.keys(messages);

export default messages;
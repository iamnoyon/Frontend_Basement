import enDashboard from "./en/dashboard.json";
import bnDashboard from "./bn/dashboard.json";

export const messages = {
    en: {
        dashboard: enDashboard,
    },
    bn: {
        dashboard: bnDashboard,
    },
};

export const supportedLocales = Object.keys(messages);

export default messages;
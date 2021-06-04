import { runYehat } from "./yehat.js";
console.log("Run Yehat!", runYehat);

const mode = 
    process.env.NODE_ENV == 'development' || location.hostname == "app.investormelon.com" ? "development" : (
      ~[ 'd33ta46tk31g3.cloudfront.net', 'app.listability.com' ].indexOf(location.hostname) ? "listability" :
      "production"
    );

const yehat = (typeof core != 'undefined' && core.yehat ) ? core.yehat : runYehat({ appMode: mode });

export default yehat;
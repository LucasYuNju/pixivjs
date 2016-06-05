const config = require("./config/config");
const API = require("./src/api");

const api = new API(config);

api
    .login(config.username, config.password)
    .then(result => {
        // console.log(api);
        api
            .ranking()
            .then(console.log)
            .catch("ranking failed:", console.error);
    })
    .catch(reason => console.log("login failed:", reason));

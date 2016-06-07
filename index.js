const config = require("./config/config");
const API = require("./src/api");

config.verbose = true;
const api = new API(config);

api
    .login(config.username, config.password)
    .then(result => {

        api
            .ranking()
            .catch(console.error);

        api
            .meFeeds()
            .catch(console.error);

        api
            .userWorks(1184799)
            .catch(console.error);

        api
            .users(1184799)
            .catch(console.error);

        api
            .works(46363414)
            .catch(console.error);

        // favorite

        api
            .meFavoriteWorks()
            .then(response => {
            })
            .catch(console.error);

        api
            .meFavoriteWorksDelete(["46363414"])
            .then(response => {
                // console.log(response);
            })
            .catch(console.error);

        api
            .meFavoriteWorksAdd("46363414")
            .then(response => {
                // console.log(response);
            })
            .catch(console.error);
    })
    .catch(reason => console.log("login failed:", reason));

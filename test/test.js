const config = require("../config/account");
const API = require("../api");

config.debug = true;
const api = new API(config);

api
    .login(config.username, config.password)
    .then(result => {
        // console.log(result);
        api
            .ranking()
            .then(response => {
            //   console.log(JSON.stringify(response).substr(0, 100));
            })
            .catch(console.error);

        api
            .meFeeds()
            .then(response => {
            //   console.log(response);
            })
            .catch(console.error);

        api
            .userWorks(1184799)
            .then(response => {
            //   console.log(response);
            })
            .catch(console.error);

        api
            .users(1184799)
            .then(response => {
            //   console.log(response);
            })
            .catch(console.error);

        api
            .works(46363414)
            .then(response => {
            //   console.log(reponse);
            })
            .catch(console.error);

        api
            .meFavoriteWorks()
            .then(response => {
            //   console.log(response);
            })
            .catch(console.error);

        api
            .meFavoriteWorksDelete(["46363414"])
            .catch(console.error);

        api
            .meFavoriteWorksAdd("46363414")
            .catch(console.error);
    })
    .catch(reason => console.log("login failed:", reason));

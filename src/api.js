const cookie = require("cookie");
const fetch = require("isomorphic-fetch");
const querystring = require("querystring");
const request = require("request");
const utils = require("./utils");

class API {
    constructor (props) {
        this.client_id = props.client_id;
        this.client_secret = props.client_secret;
        this.cookieJar = request.jar();
        this.verbose = true;
    }

    _request (method = "GET", url, { params = {}, headers = {}, body = {} }) {
        headers["Refer"] = this.URL_REFER;
        headers["User-Agent"] = "PixivIOSApp/5.8.3";
        const options = {
            url,
            method,
            headers,
            form: body,
            jar: this.cookieJar,
            qs: params,
        };

        return new Promise((resolve, reject) => {

            request(options, (error, response, body) => {
                if(error) {
                    reject(error);
                }
                if(this.verbose) {
                    console.log(method, " ", url);
                    console.log("==>", body.substr(0, 400), "\n");
                }
                if(response.headers["content-type"] !== "application/json") {
                    console.error(`Error, response is not applicaiton/json, status: ${response.status}`);
                    resolve(response);
                }
                else {
                    const json = JSON.parse(body);
                    resolve(json);
                }
            });
        });
    }

    /**
     * @params: query parameter
     * @headers: http header
     * @body: http payload
     */
    _authRequest (method, url, { params = {}, headers = {}, body = {} }) {
        if(this.access_token === undefined) {
            throw new Error("User need to be authorized");
        }
        headers['Authorization'] = `Bearer ${this.access_token}`;
        return this._request(method, url, { params, headers, body });
    }

    login (username, password) {
        const body = {
            "client_id": this.client_id,
            "client_secret": this.client_secret,
            username,
            password,
            grant_type: "password",
        }
        const url = this.URL_AUTH_TOKEN;
        const result = this._request("POST", url, { body });
        result.then(json => {
            this.access_token = json.response.access_token;
            this.refresh_token = json.response.refresh_token;
        });
        return result;
    }

    /**
     * FIXME: some parameters are not supported by pixiv
     * image_sizes = ['px_128x128', 'px_240mw', 'px_480mw', 'px_600mw', 'large']
     */
    ranking (ranking_type = 'all', mode = 'daily', page = 1, per_page = 50, date = null,
        image_sizes = ['px_128x128', 'px_480mw', 'large'],
        profile_image_sizes = ['px_170x170', 'px_50x50'],
        include_stats = true, include_sanity_level = true) {

        const url = `${this.URL_RANKING}/${ranking_type}.json`;
        const params = {
            mode,
            page,
            per_page,
            include_stats,
            include_sanity_level,
            image_sizes: image_sizes.join(","),
            profile_image_sizes: profile_image_sizes.join(","),
        };
        if(date !== null) {
            params['date'] = date;
        }
        return this._authRequest('GET', url, { params });
    }

    // work infomartion
    works (illust_id) {
        const url = `${this.URL_WORKS}/${illust_id}.json`;
        const params = {
            'image_sizes': 'px_128x128,small,medium,large,px_480mw',
            'include_stats': 'true',
        };
        return this._authRequest('GET', url, { params });
    }

    // user information
    users (user_id) {
        const url = `${this.URL_USERS}/${user_id}.json`;
        const params = {
            'profile_image_sizes': 'px_170x170,px_50x50',
            'image_sizes': 'px_128x128,small,medium,large,px_480mw',
            'include_stats': 1,
            'include_profile': 1,
            'include_workspace': 1,
            'include_contacts': 1,
        };
        return this._authRequest('GET', url, { params });
    }

    // get works per user
    userWorks (user_id, page = 1, per_page = 30,
        image_sizes = ['px_128x128', 'px_480mw', 'large'],
        include_stats = true, include_sanity_level = true) {
        const url = `${this.URL_USERS}/${user_id}/works.json`;
        const params = {
            'page': page,
            'per_page': per_page,
            'include_stats': include_stats,
            'include_sanity_level': include_sanity_level,
            'image_sizes': image_sizes.join(","),
        };
        return this._authRequest('GET', url, { params });
    }

    // my subscription
    meFeeds (show_r18 = 1, max_id = null) {
        const params = {
            'relation': 'all',
            'type': 'touch_nottext',
            show_r18,
        }
        if(max_id !== null) {
            params['max_id'] = max_id;
        }
        return this._authRequest("GET", this.URL_ME_FEEDS, { params });
    }

    // my favorite works
    meFavoriteWorks (page = 1, per_page = 50,
        image_sizes = ['px_128x128', 'px_480mw', 'large'], publicity = 'public') {
        const params = {
            page,
            per_page,
            publicity,
            image_sizes: image_sizes.join(","),
        }
        return this._authRequest('GET', this.URL_ME_FAVORITE_WORKS, { params });
    }

    // If user already favorited this work, server responds with a 400 error.
    meFavoriteWorksAdd (work_id, publicity = "public") {
        const params = {
            publicity,
            work_id,
        };
        return this._authRequest("POST", this.URL_ME_FAVORITE_WORKS, { params });
    }

    /**
     * @work_id, can be obtained by calling meFavoriteWorks(),
     * not the id of the work itself.
     */
    meFavoriteWorksDelete (work_ids, publicity = "public") {
        const params = {
            publicity,
            ids: work_ids.join(","),
        }
        return this._authRequest("DELETE", this.URL_ME_FAVORITE_WORKS, { params });
    }
}

API.prototype.URL_REFER = "http://spapi.pixiv.net/";
API.prototype.URL_AUTH_TOKEN = "https://oauth.secure.pixiv.net/auth/token";
API.prototype.URL_WORKS = "https://public-api.secure.pixiv.net/v1/works";
API.prototype.URL_USERS = "https://public-api.secure.pixiv.net/v1/users";
API.prototype.URL_RANKING = "https://public-api.secure.pixiv.net/v1/ranking";
API.prototype.URL_ME_FEEDS = "https://public-api.secure.pixiv.net/v1/me/feeds.json";
API.prototype.URL_ME_FAVORITE_WORKS = "https://public-api.secure.pixiv.net/v1/me/favorite_works.json";
API.prototype.IMAGE_SIZES = ["px_128x128", "small", "medium", "large", "px_480mw"];

module.exports = API;

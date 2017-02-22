'use strict';
const userModel = require('models/UserModel');
const Config = require('config/server');

class CookieHelper {

  constructor(userModel) {
    this.userModel = userModel;
  }

  setCookie(request, user) {
    let sid = user.userID + new Date().getTime();
    request.cookieAuth.set({ sid });
    request.cookieAuth.ttl(Config.cookieTTL);
    return this.userModel.updateUser(user.userID, { sid });
  }

  deleteCookie(request, user) {
    request.cookieAuth.clear();
    return this.userModel.updateUser(user.userID, { sid: '' });
  }

  refreshCookie(request, sid) {
    request.cookieAuth.set({ sid });
    request.cookieAuth.ttl(Config.cookieTTL);
  }

}

module.exports = new CookieHelper(userModel);
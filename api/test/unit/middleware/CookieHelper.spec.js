'use strict';

let CookieHelper = require('middleware/CookieHelper');
let userModel = require('models/UserModel');

describe('Cookie helper', () => {

  var request = {
    cookieAuth: {
      clear: new Function(),
      set: new Function(),
      ttl: new Function(),
    },
  };

  it('should save cookie in database when cookie is set', () => {
    let cookieHelper = new CookieHelper.constructor(userModel);
    spyOn(userModel, 'updateUser');
    spyOn(request.cookieAuth,'set');
    spyOn(request.cookieAuth,'ttl');

    let user = {
      userID: '1',
    };

    cookieHelper.setCookie(request, user);

    expect(userModel.updateUser).toHaveBeenCalledWith(user.userID, jasmine.anything());
    expect(request.cookieAuth.set).toHaveBeenCalledWith(jasmine.any(Object));
    expect(request.cookieAuth.ttl).toHaveBeenCalledWith(jasmine.any(Number));
  });

  it('should remove the cookie from database when cookie is unset', () => {
    let cookieHelper = new CookieHelper.constructor(userModel);
    spyOn(userModel, 'updateUser');
    spyOn(request.cookieAuth,'clear');

    let user = {
      userID: '1',
    };


    cookieHelper.deleteCookie(request, user);

    expect(userModel.updateUser).toHaveBeenCalledWith(user.userID, jasmine.anything());
    expect(request.cookieAuth.clear).toHaveBeenCalled();
  });


  it('should renew the cookie TTL', () => {
    let cookieHelper = new CookieHelper.constructor(userModel);
    spyOn(request.cookieAuth,'ttl');
    spyOn(request.cookieAuth,'set');


    cookieHelper.refreshCookie(request, 123);

    expect(request.cookieAuth.ttl).toHaveBeenCalledWith(jasmine.any(Number));
    expect(request.cookieAuth.set).toHaveBeenCalledWith(jasmine.any(Object));
  });
});
/*
  Currently it is not possible to test classes which are annotated with @Page.
  https://github.com/lathonez/clicker/issues/41 looks promising and should be revisited.
*/

/*
'use strict';

import {Injector, provide} from '@angular/core';
import {BaseRequestOptions, Response, ResponseOptions, Http} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {it, inject, beforeEachProviders} from '@angular/testing';
import {NavController} from 'ionic-angular';
import {AuthPage} from './auth';

describe('Auth Page', () => {
  var http, nav, injector, mockBackend;

  beforeEach(() => {
    injector = Injector.resolveAndCreate([
      BaseRequestOptions,
      MockBackend,
      provide(Http, {
        useFactory: (backend, options) => {
          return new Http(backend, options);
        }, deps: [MockBackend, BaseRequestOptions]
      })
    ]);

    nav = jasmine.createSpyObj('NavController', ['popToRoot']);

    http = injector.get(Http);
    mockBackend = injector.get(MockBackend);
  });


  it('go back button', () => {
    var authPage = new AuthPage(nav, http);

    authPage.goBack();

    expect(nav.popToRoot).toHaveBeenCalled();
  });
});
*/

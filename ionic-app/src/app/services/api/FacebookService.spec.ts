import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {FacebookService} from './FacebookService'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('FacebookService', () => {
  let facebookService:FacebookService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(FacebookService, (Instance, Mock, Http) => {
    facebookService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  describe('checkToken method', () => {
    it('should call /facebook/check to verify token', () => {
      let token = 'someToken9238742814'

      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Get)
        expect(c.request.url).toEqual(createUrl(`/api/facebook/check?token=${token}`));
      })

      facebookService.checkToken(token)
    })
  })

  describe('findFriends method', () => {
    it('should call /facebook/link to find Facebook friends', () => {
      let token = 'someToken9238742814'

      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Get)
        expect(c.request.url).toEqual(createUrl(`/api/facebook/link?token=${token}`));
      })

      facebookService.findFriends(token)
    })
  })

})

import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {AuthService} from './AuthService'
import {FeedService} from './FeedService'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('FeedService', () => {
  let feedService:FeedService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(FeedService, (Instance, Mock, Http) => {
    feedService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  it('should GET from /api/feed', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(createUrl('/api/feed'))
      expect(c.request.method).toEqual(RequestMethod.Get)
    })

    feedService.getFeed()
  })

})

import {addProviders} from '@angular/core/testing'
import {RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {ProfileService} from './ProfileService'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('ProfileService', () => {
  let profileService:ProfileService
  let http, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(ProfileService, (Instance, Mock, Http) => {
    profileService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  it('should GET from api/profile/{userID}', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(createUrl('/api/profile/goingDownForReal'))
      expect(c.request.method).toEqual(RequestMethod.Get)
    })

    profileService.getProfile('goingDownForReal')
  })

  it('should PUT to api/profile/{userID}/follow', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(createUrl('/api/profile/userID/follow'))
      expect(c.request.method).toEqual(RequestMethod.Put)
    })

    profileService.follow('userID')
  })

  it('should DELETE from api/profile/{userID}/follow', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(createUrl('/api/profile/userID/follow'))
      expect(c.request.method).toEqual(RequestMethod.Delete)
    })

    profileService.unfollow('userID')
  })
})

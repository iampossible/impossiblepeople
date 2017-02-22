import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {InterestService} from './InterestService'

function createUrl(endpoint: string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('InterestService', () => {
  let interestService:InterestService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(InterestService, (Instance, Mock, Http) => {
    interestService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  describe('getFeaturedInterests method', () => {
    it('should GET from /api/interest', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual(createUrl('/api/interest?featured=true'))
        expect(c.request.method).toEqual(RequestMethod.Get)
        done()
      })

      interestService.getFeaturedInterests()
    })

    it('should call the success callback on success', () => {
      let mockSuccess = jasmine.createSpy('success')
      mockBackend.connections.subscribe(c => c.mockRespond())

      interestService.getFeaturedInterests(mockSuccess)

      expect(mockSuccess).toHaveBeenCalled()
    })

    xit('should call the failure callback on failure', () => {
      let mockFailure = jasmine.createSpy('failure')
      mockBackend.connections.subscribe(c => c.mockError())

      interestService.getFeaturedInterests(null, mockFailure)

      expect(mockFailure).toHaveBeenCalled()
    })
  })

  describe('suggestInterest method', () => {
    it('should post to the backend', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Post)
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/interest/suggestion'
        )
        expect(c.request._body).toEqual('{"suggestion":"Waterboarding"}')
        done()
      })

      interestService.suggestInterest('Waterboarding')
    })
  })
})

import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {UserService} from './UserService'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('UserService', () => {
  let userService:UserService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(UserService, (Instance, Mock, Http) => {
    userService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  it('should get user data', (done) => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(
        Environment.HOST + '/api/user'
      )
      expect(c.request.method).toEqual(RequestMethod.Get)
      done()
    })

    userService.getCurrentUser()
  })

  //TODO: test create user method

  it('should update user data', (done) => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(
        Environment.HOST + '/api/user'
      )
      expect(c.request.method).toEqual(RequestMethod.Post)
      expect(c.request._body).toEqual('{"updated":"user"}')
      done()
    })

    userService.updateUser({updated: 'user'})
  })

  it('should provide user activities', (done) => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(
        Environment.HOST + '/api/user/activity'
      )
      expect(c.request.method).toEqual(RequestMethod.Get)
      done()
    })

    userService.getActivities()
  })

  describe('getCurrentUserInterests method', () => {
    it('should get from the backend', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/user/interest'
        )
        expect(c.request.method).toEqual(RequestMethod.Get)
        done()
      })

      userService.getCurrentUserInterests()
    })
  })

  describe('setSelectedInterests', () => {
    it('should post to the backend', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Post)
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/user/interest'
        )
        expect(c.request._body).toEqual('{"interests":"[]"}')
        done()
      })

      userService.setSelectedInterests([])
    })

    it('passes a successful response to the success function', () => {
      var response = new Response(new ResponseOptions())
      mockBackend.connections.subscribe(c => c.mockRespond(response))
      var fakeSuccess = jasmine.createSpy('success')

      userService.setSelectedInterests([], fakeSuccess)

      expect(fakeSuccess).toHaveBeenCalledWith(jasmine.any(Response))
    })

    xit('passes a failed response to the failure function', () => {
      let response = new Response(new ResponseOptions({status: 302}))
      mockBackend.connections.subscribe(c => c.mockError(response))
      var fakeFailure = jasmine.createSpy('failure')

      userService.setSelectedInterests([], null, fakeFailure)

      expect(fakeFailure).toHaveBeenCalledWith(jasmine.any(Response))
    })
  })

  describe('updateSelectedInterests', () => {
    it('should post to the backend', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Put)
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/user/interest'
        );
        expect(c.request._body).toEqual('{"interests":"[]"}')
        done()
      });

      userService.updateSelectedInterests([])
    })
  })

  describe('getCurrentUserPosts', () => {
    it('should get logged user`s posts', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Get)
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/user/post'
        );
        done()
      });

      userService.getCurrentUserPosts()
    })
  })

  //TODO:get friendly location test

})

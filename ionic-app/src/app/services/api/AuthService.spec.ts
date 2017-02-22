import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {AuthService} from './AuthService'

function createUrl(endpoint: string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('AuthServicet', () => {
  let authService: AuthService
  let http, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(AuthService, (Instance, Mock, Http) => {
    authService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  describe('.authenticate()', () => {

    it('calls localhost', () => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual(createUrl('/api/auth/login'))
        let body = JSON.parse(c.request._body)
        expect(body.email).toEqual('foo')
        expect(body.password).toEqual('bar')
      })

      authService.authenticate('foo', 'bar')
    })

    it('should invoke success function if request succeeded', (done) => {
      let response = new Response(new ResponseOptions({ body: '{}' }))
      mockBackend.connections.subscribe(c => {
        c.mockRespond(response)
      })

      authService.authenticate('', '').subscribe(() => {
        done();
      })
    })

    xit('should invoke error function if request fails', (done) => {
      let response = new Response(new ResponseOptions({ body: '{}' }))
      mockBackend.connections.subscribe(c => {
        c.mockError(response)
      })

      authService.authenticate('', '').subscribe(() => {
      }, () => {
        done();
      })
    })

  })

  describe('inviteContacts()', () => {
    it('should call invite endpoint', (done) => {
      let emails = ['foo', 'bar', 'baz']
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Post)
        expect(c.request.url).toEqual(createUrl('/api/user/invite'))
        let body = JSON.parse(c.request._body)
        expect(body.emails).toEqual(JSON.stringify(emails))
        done()
      })

      authService.inviteContacts(emails)
    })
  })

  describe('.recoverPassword()', () => {

    it('calls localhost', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toEqual(createUrl('/api/auth/recover'))
        let body = JSON.parse(c.request._body)
        expect(body.email).toEqual('foo')
        done()
      })

      authService.recoverPassword('foo')
    })

    it('should invoke success function if request succeeded', (done) => {
      let response = new Response(new ResponseOptions({ body: '{}' }))
      mockBackend.connections.subscribe(c => {
        c.mockRespond(response)
      })

      authService.recoverPassword('').subscribe(() => {
        done();
      })
    })

    xit('should invoke error function if request fails', (done) => {
      let response = new Response(new ResponseOptions({ body: '{}' }))
      mockBackend.connections.subscribe(c => {
        c.mockError(response)
      })

      authService.recoverPassword('').subscribe(() => {
      }, () => {
        done();
      })
    })

  })

})

import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {AuthService} from './AuthService'
import {InterceptedHttp} from './InterceptedHttp'
import {Events} from 'ionic-angular'


let testProviders: Array<any> = [];

describe('InterceptedHttp', () => {

  let events:Events,
    http:InterceptedHttp,
    mockBackend,
    authService:AuthService

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(null, (ev, Mock, Http) => {
    mockBackend = Mock;
    http = Http;
    events = ev;
  }));

  xit('should emit unauthorised event when response code is 401', (done) => {
    //TODO: CANT SPY EVENT YET

    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual('/going/down/for/real')
      expect(c.request.method).toEqual(RequestMethod.Get)

      c.mockError(new Response(new ResponseOptions({status: 401})))
    })

    spyOn(events, 'publish')

    http.get('/going/down/for/real')

    expect(events.publish).toHaveBeenCalledWith('unauthorised')
  })

  it('should not emit unauthorised event when user is logging in', () => {
    mockBackend.connections.subscribe(c => {
      c.mockError(new Response(new ResponseOptions({url: c.request.url, status: 401})))
    })
    spyOn(events, 'publish')

    http.get('/api/auth/login').subscribe(() => {}, (err) => {
      expect(err.status).toEqual(401)
    })

    expect(events.publish).not.toHaveBeenCalled()
  })

  it('should add headers to a GET request', () => {
    mockBackend.connections.subscribe(c => {
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.get('/going/down/for/real')
  })

  it('should add headers to a GET request', () => {
    mockBackend.connections.subscribe(c => {
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.get('/going/down/for/real')
  })

  it('should add headers to a GET request', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.method).toEqual(RequestMethod.Get)
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.get('/going/down/for/real')
  })

  it('should add headers to a PUT request', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.method).toEqual(RequestMethod.Put)
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.put('/going/down/for/real', '{}')
  })

  it('should add headers to a POST request', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.method).toEqual(RequestMethod.Post)
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.post('/going/down/for/real', '{}')
  })

  it('should add headers to a DELETE request', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.method).toEqual(RequestMethod.Delete)
      let headers = c.request.headers

      expect(headers.get('Content-Type')).toContain('application/json')
      expect(headers.get('Access-Control-Allow-Credentials')).toEqual('true')
    })

    http.delete('/going/down/for/real')
  })
})

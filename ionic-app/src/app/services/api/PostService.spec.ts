import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {PostService} from './PostService'
import {Observable} from 'rxjs/Observable'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}

let testProviders: Array<any> = [];

describe('PostService', () => {
  let postService:PostService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(PostService, (Instance, Mock, Http) => {
    postService = Instance;
    mockBackend = Mock;
    http = Http;
  }));

  it('passes a successful response to the success function', () => {
    let response = new Response(new ResponseOptions({body: '{}'}))
    mockBackend.connections.subscribe(c => {
      c.mockRespond(response)
    })
    var fakeSuccess = jasmine.createSpy('success')

    postService.createPost({}, fakeSuccess, null)

    expect(fakeSuccess).toHaveBeenCalledWith(jasmine.any(Response))
  })

  xit('passes an error to the error function', () => {
    let response = new Response(new ResponseOptions({status: 302}))
    mockBackend.connections.subscribe(c => c.mockError(response))
    var fakeError = jasmine.createSpy('error')

    postService.createPost({}, null, fakeError)

    expect(fakeError).toHaveBeenCalledWith(jasmine.any(Response))
  })

  it('calls localhost', () => {
    mockBackend.connections.subscribe(c => {
      expect(c.request.url).toEqual(createUrl('/api/post/create'))
      expect(c.request.text()).toEqual('{}')
    })

    postService.createPost({}, null, null)
  })

  it('should fire DELETE when deleting a post', () => {
    mockBackend.connections.subscribe((connection) => {
      expect(connection.request.url).toEqual(createUrl('/api/post/somePost123'))
      expect(connection.request.method).toEqual(RequestMethod.Delete)
    })

    let observable = postService.deletePost('somePost123')
    expect(observable).isPrototypeOf(Observable)
  })

  it('should fire GET /report when reporting a post', () => {
    mockBackend.connections.subscribe((connection) => {
      expect(connection.request.url).toEqual(createUrl('/api/post/somePost123/report'))
      expect(connection.request.method).toEqual(RequestMethod.Get)
    })

    let observable = postService.reportPost('somePost123')
    expect(observable).isPrototypeOf(Observable)
  })

  it('should fire GET /resolve when resolving a post', () => {
    mockBackend.connections.subscribe((connection) => {
      expect(connection.request.url).toEqual(createUrl('/api/post/somePost123/resolve'))
      expect(connection.request.method).toEqual(RequestMethod.Get)
    })

    let observable = postService.resolvePost('somePost123')
    expect(observable).isPrototypeOf(Observable)
  })

  //TODO: test getPost and createComment
})


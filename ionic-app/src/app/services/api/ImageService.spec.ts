import {addProviders} from '@angular/core/testing'
import {Response, ResponseOptions, RequestMethod} from '@angular/http'
import {injectService, defaultProviders} from '../../../testing/Utils'
import {Environment} from '../../Environment'
import {ImageService} from './ImageService'

function createUrl(endpoint:string) {
  return Environment.HOST + endpoint
}


let testProviders: Array<any> = [];

describe('ImageService', () => {
  let imageService:ImageService
  let http, injector, mockBackend

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectService(ImageService, (Instance, Mock, Http) => {
    imageService = Instance;
    mockBackend = Mock;
    http = Http;
  }));
  
  describe('addImage method', () => {
    it('should post to the backend', (done) => {
      mockBackend.connections.subscribe(c => {
        expect(c.request.method).toEqual(RequestMethod.Post)
        expect(c.request.url).toEqual(
          Environment.HOST + '/api/user/image'
        )
        expect(c.request._body).toEqual('{"imageData":"imagedata"}')
        done()
      })
  
      imageService.addImage('imagedata')
    })
  })
})

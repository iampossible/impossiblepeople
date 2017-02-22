import {Response, ResponseOptions} from '@angular/http'
import {ApiService} from './ApiService'

describe('ApiService', () => {

  beforeEach(() => {
    localStorage.clear()
    spyOn(localStorage, 'setItem')
  })

  it('should persist user ID', () => {
    ApiService.extractID(new Response(new ResponseOptions({body: '{"userID":"something"}'})))
    expect(localStorage.setItem).toHaveBeenCalledWith('USER_ID', 'something')
  })

})

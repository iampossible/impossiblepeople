export {UserService} from './UserService'
export {AuthService} from './AuthService'
export {FeedService} from './FeedService'
export {InterestService} from './InterestService'
export {PostService} from './PostService'
export {ImageService} from './ImageService'
export {ProfileService} from './ProfileService'
export {FacebookService} from './FacebookService'

import {Response} from '@angular/http'
import {Environment} from '../../Environment'

declare const heap: any

export class ApiService {

  public static getUrl(endpoint: string, params?: Object): string {
    let formatted: string = ApiService.formatQueryParams(params)
    return `${Environment.HOST}/api/${endpoint}${formatted}`
  }

  public static extractID(response: Response) {
    let body = response.json()
    if (body) {
      if (body.userID) {
        localStorage.setItem('USER_ID', body.userID)
        if (Environment.HEAP && 'heap' in window) {
          heap.identify(body.userID)
        }
      }
    }
  }

  public static formatQueryParams(queryParams: Object) {
    let params: string = ''
    let keys: Array<string> = Object.keys(queryParams || {})

    if (keys.length) {
      params = '?' + keys.map((key) => [key, queryParams[key]].map(encodeURIComponent).join('=')).join('&')
    }
    return params
  }

}

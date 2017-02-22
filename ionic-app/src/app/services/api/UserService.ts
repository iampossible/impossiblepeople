import {Injectable} from '@angular/core'
import {Response} from '@angular/http'
import {Observable} from 'rxjs/Observable'
import {ApiService} from './ApiService'
import {InterceptedHttp} from './InterceptedHttp';
import {Environment} from '../../Environment'
import {Platform} from 'ionic-angular';

declare const heap: any

@Injectable()
export class UserService {

  constructor(private http: InterceptedHttp, private platform: Platform) {
    if (http._backend._browserXHR) {
      let _build = http._backend._browserXHR.build;
      this.http._backend._browserXHR.build = () => {
        let _xhr = _build();
        _xhr.withCredentials = true;
        return _xhr;
      };
    }
  }

  getCurrentUser(): Observable<Response> {
    return this.http.get(ApiService.getUrl('user'))
  }

  createUser(user: Object, success: Function, failure: (Response) => void) {
    const url: string = ApiService.getUrl('user/create')

    this.http.post(url, JSON.stringify(user)).subscribe((response: Response) => {
      ApiService.extractID(response)
      if (Environment.HEAP && 'heap' in window) {
        heap.track('SIGNUP_EMAIL')
      }
      success(response)
    }, failure)
  }

  registerNotifications(deviceToken: String): Observable<Response> {
    let url: string = ApiService.getUrl('notification/register')
    let deviceType: string = this.platform.is('android') ? 'android' : 'apple';
    return this.http.post(url, JSON.stringify({ deviceToken, deviceType }))
  }

  updateUser(user: Object): Observable<Response> {
    let url: string = ApiService.getUrl('user')
    return this.http.post(url, JSON.stringify(user))
  }

  getActivities(): Observable<Response> {
    return this.http.get(ApiService.getUrl('user/activity'))
  }

  getActivityCount(): Observable<Response> {
    return this.http.get(ApiService.getUrl('user/activity/count'))
  }

  markActivityAsSeen(): void {
    this.http.post(ApiService.getUrl('user/activity/seen'), '').subscribe(() => true)
  }

  markActivityAsRead(activityID: string): void {
    this.http.post(ApiService.getUrl(`user/activity/read`), JSON.stringify({ activityID })).subscribe(() => true)
  }

  // TODO extract into separate service
  getFriendlyLocation(latitude: number, longitude: number, accuracy: number): Observable<Response> {
    return this.http.post(
      ApiService.getUrl('location'),
      JSON.stringify({ latitude, longitude, accuracy })
    )
  }

  getCurrentUserInterests(): Observable<Response> {
    return this.http.get(ApiService.getUrl('user/interest'))
  }

  setSelectedInterests(interests: Array<Object>, success?: (Response) => void, failure?: (Response) => void): void {
    const url: string = ApiService.getUrl('user/interest')
    // TODO why do we have to post stringified stringified data?!
    this.http.post(url, JSON.stringify({ interests: JSON.stringify(interests) })).subscribe(success, failure)
  }

  updateSelectedInterests(interests: Array<Object>, success?: (Response) => void, failure?: (Response) => void): void {
    const url: string = ApiService.getUrl('user/interest')
    // TODO why do we have to post stringified stringified data?!
    this.http.put(url, JSON.stringify({ interests: JSON.stringify(interests) })).subscribe(success, failure)
  }

  getCurrentUserPosts(): Observable<Response> {
    return this.http.get(ApiService.getUrl('user/post'))
  }
}

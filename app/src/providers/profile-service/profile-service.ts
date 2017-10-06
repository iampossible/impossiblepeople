import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';

import { InterceptedHttp } from '../intercepted-http/intercepted-http';
import { ApiService } from '../api-service/api-service';

@Injectable()
export class ProfileService {

  constructor(private http: InterceptedHttp) {
    if (http._backend._browserXHR) {
      let _build = http._backend._browserXHR.build;
      this.http._backend._browserXHR.build = () => {
        let _xhr = _build();
        _xhr.withCredentials = true;
        return _xhr;
      };
    }
  }

  getProfile(userID: string): Observable<Response> {
    return this.http.get(ApiService.getUrl(`profile/${userID}`));
  }

  follow(userID: string): Observable<Response> {
    return this.http.put(ApiService.getUrl(`profile/${userID}/follow`), '');
  }

  unfollow(userID: string): Observable<Response> {
    return this.http.delete(ApiService.getUrl(`profile/${userID}/follow`));
  }

  report(userID: string): Observable<Response> {
    return this.http.get(ApiService.getUrl(`profile/${userID}/report`));
  }

  block(userID: string): Observable<Response> {
    return this.http.get(ApiService.getUrl(`profile/${userID}/block`));
  }
}

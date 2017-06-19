import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../api-service/api-service';
import { InterceptedHttp } from '../intercepted-http/intercepted-http';
import { NotificationService } from '../notification-service/notification-service';
import { Environment } from '../../Environment';
import 'rxjs/add/operator/map';

declare const heap: any;

@Injectable()
export class AuthService {

  constructor(private http: InterceptedHttp,
    private notificationService: NotificationService) {
    if (http._backend._browserXHR) {
      let _build = http._backend._browserXHR.build;
      this.http._backend._browserXHR.build = () => {
        let _xhr = _build();
        _xhr.withCredentials = true;
        return _xhr;
      };
    }
  }

  public authenticate(email: string, password: string): Observable<Response> {
    let credentials: Object = { email, password };
    let url: string = ApiService.getUrl('auth/login');

    return this.http.post(url, JSON.stringify(credentials));
  }

  public recoverPassword(email: string): Observable<Response> {
    let credentials: Object = { email };
    let url: string = ApiService.getUrl('auth/recover');

    return this.http.post(url, JSON.stringify(credentials));
  }

  public inviteContacts(emails: Array<string>): Observable<Response> {
    let contacts: Object = { emails: JSON.stringify(emails) };
    let url: string = ApiService.getUrl('user/invite');

    return this.http.post(url, JSON.stringify(contacts));
  }

  logOut() {
    // TODO: clear the whole storage, send local variables (dismiss notices) to database.
    // localStorage.clear()
    localStorage.removeItem('USER_ID');
    this.notificationService.unregister();

    if (Environment.HEAP && 'heap' in window) {
      heap.track('LOGOUT');
      heap.identify('ANONYMOUS');
    }
    let url: string = ApiService.getUrl('auth/logout');
    return this.http.get(url);
  }
}

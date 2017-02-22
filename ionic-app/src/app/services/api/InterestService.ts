import {Injectable} from '@angular/core'
import {ApiService} from './ApiService'
import {InterceptedHttp} from './InterceptedHttp';

@Injectable()
export class InterestService {

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

  getFeaturedInterests(success?: (Response) => void, failure?: (Response) => void): void {
    this.http.get(ApiService.getUrl('interest', { featured: true })).subscribe(success, failure)
  }

  suggestInterest(suggestion: String, success?: (Response) => void, failure?: (Response) => void): void {
    this.http.post(ApiService.getUrl('interest/suggestion'), JSON.stringify({ suggestion }))
      .subscribe(success, failure)
  }
}

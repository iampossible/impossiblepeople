import { Injectable } from '@angular/core';

import { InterceptedHttp } from '../intercepted-http/intercepted-http';
import { ApiService } from '../api-service/api-service';
import 'rxjs/add/operator/map';

@Injectable()
export class ExploreService {

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

  public getExploreFeed(interest, success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl('explore/' + interest);
    this.http.get(url).subscribe(success, failure);
  }

  public getExploreNearMeFeed(interest, success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl('explore/' + interest + '/nearme');
    this.http.get(url).subscribe(success, failure);
  }

  public getInterests(success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl('interest');
    this.http.get(url).subscribe(success, failure);
  }

  public getExploreSearch(interest, search, success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl('explore/' + interest + '/search/' + search);
    this.http.get(url).subscribe(success, failure);
  }
}

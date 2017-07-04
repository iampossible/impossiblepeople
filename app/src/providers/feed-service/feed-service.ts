import { Injectable } from '@angular/core';

import { InterceptedHttp } from '../intercepted-http/intercepted-http';
import { ApiService } from '../api-service/api-service';
import 'rxjs/add/operator/map';

@Injectable()
export class FeedService {

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

  public getFeed(success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl('feed');
    this.http.get(url).subscribe(success, failure);
  }
}

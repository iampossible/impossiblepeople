import {Injectable} from '@angular/core'
import {Response} from '@angular/http'
import {Observable} from 'rxjs/Observable'
import {ApiService} from './ApiService'
import {InterceptedHttp} from './InterceptedHttp';

@Injectable()
export class ImageService {
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

  addImage(imageData: String): Observable<Response> {
    let url: string = ApiService.getUrl('user/image')
    return this.http.post(url, JSON.stringify({ imageData }))
  }
}

import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { InterceptedHttp } from '../intercepted-http/intercepted-http';
import { ApiService } from '../api-service/api-service';

import 'rxjs/add/operator/map';


@Injectable()
export class PostService {
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

  getPost(postID: string, success?: (Response) => void, failure?: (Response) => void): void {
    let url: string = ApiService.getUrl(`post/${postID}`);
    this.http.get(url).subscribe(success, failure);
  }

  createPost(postData: Object, success: (Response) => void, failure: (Response) => void): void {
    let url: string = ApiService.getUrl('post/create');
    this.http.post(url, JSON.stringify(postData)).subscribe(success, failure);
  }

  createComment(postID: string, postData: Object): Observable<Response> {
    let url: string = ApiService.getUrl(`post/${postID}/comment`);
    return this.http.post(url, JSON.stringify(postData));
  }

  reportComment(commentID: string): Observable<Response> {
    let url: string = ApiService.getUrl(`post/comment/${commentID}/report`);
    return this.http.get(url);
  }

  deletePost(postID: string) {
    let deleteEndpoint: string = ApiService.getUrl(`post/${postID}`);
    return this.http.delete(deleteEndpoint);
  }

  reportPost(postID: string) {
    let reportEndpoint: string = ApiService.getUrl(`post/${postID}/report`);
    return this.http.get(reportEndpoint);
  }

  resolvePost(postID: string) {
    let resolveEndpoint: string = ApiService.getUrl(`post/${postID}/resolve`);
    return this.http.get(resolveEndpoint);
  }
}

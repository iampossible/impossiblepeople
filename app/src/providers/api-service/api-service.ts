import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Environment } from '../../Environment';

declare const heap: any;

@Injectable()
export class ApiService {
  public static getUrl(endpoint: string, params?: Object): string {
    let formatted: string = ApiService.formatQueryParams(params);
    return `${Environment.HOST}/api/${endpoint}${formatted}`;
  }

  public static extractID(response: Response) {
    const body = response.json();
    if (body) {
      if (body.userID) {
        localStorage.setItem('USER_ID', body.userID);
        if (Environment.HEAP && 'heap' in window) {
          heap.identify(body.userID);
        }
      }
    }
  }

  public static formatQueryParams(queryParams: Object) {
    let params: string = '';
    let keys: Array<string> = Object.keys(queryParams || {});

    if (keys.length) {
      params = '?' + keys.map((key) => [key, queryParams[key]].map(encodeURIComponent).join('=')).join('&');
    }
    return params;
  }

}

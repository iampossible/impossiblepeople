import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Environment } from '../../Environment';
import { InterceptedHttp } from '../intercepted-http/intercepted-http';


@Injectable()
export class GoogleMapsProvider {

  private static autocompleteEndpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${Environment.GOOGLEAPIKEY}&input=`;
  private static detailsEndpoint = `https://maps.googleapis.com/maps/api/place/details/json?key=${Environment.GOOGLEAPIKEY}&place_id=`;

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

  placeSearch(input: string): Observable<Response> {
    console.debug('placeSearch', input, GoogleMapsProvider.autocompleteEndpoint + encodeURIComponent(input));
    return this.http.get(GoogleMapsProvider.autocompleteEndpoint + encodeURIComponent(input));
  }

  placeDetails(placeID: string): Observable<Response> {
    console.debug('placeDetails', placeID, GoogleMapsProvider.detailsEndpoint + placeID);
    return this.http.get(GoogleMapsProvider.detailsEndpoint + placeID);
  }

}

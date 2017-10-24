import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';

import { Environment } from '../../Environment';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class GoogleMapsProvider {

  private static autocompleteEndpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${Environment.GOOGLEAPIKEY}&input=`;
  private static detailsEndpoint = `https://maps.googleapis.com/maps/api/place/details/json?key=${Environment.GOOGLEAPIKEY}&place_id=`;

  constructor(private http: Http) {
    console.debug('Hello GoogleMapsProvider Provider');
  }

  placeSearch(input: string): Observable<Response> {
    return this.http.get(GoogleMapsProvider.autocompleteEndpoint + encodeURIComponent(input));
  }

  placeDetails(placeID: string): Observable<Response> {
    return this.http.get(GoogleMapsProvider.detailsEndpoint + placeID);
  }

}

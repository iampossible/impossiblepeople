import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Response } from '@angular/http';
import { UserService } from '../../providers/user-service/user-service';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface SearchResult {
  friendlyName: string;
  placeID: string;
}

interface MyLocation {
  location: string;
  latitude: number;
  longitude: number;
}

// @IonicPage()
@Component({
  selector: 'page-add-location-modal',
  templateUrl: 'add-location-modal.html',
})
export class AddLocationModalPage {

  private searchString: string = '';
  private searchResults: SearchResult[] = [];
  private myLocation: MyLocation;
  private myLocationAvailable: boolean = false;

  constructor(
    private viewCtrl: ViewController,
    private userService: UserService,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic,
    private mapsProvider: GoogleMapsProvider) {
  }

  ionViewWillEnter() {
    this.updateLocation();
  }

  updateLocation() {
    this.checkDeviceSettings().subscribe((result: boolean) => {
      this.myLocationAvailable = result;
      if (result) {
        setTimeout(() => this.getCurrentLocation(), 300);
      }
    });
  }

  onSearch() {
    console.debug('onSearch', this.searchString);
    if (!this.searchString) {
      this.searchResults = [];
    } else {
      this.mapsProvider.placeSearch(this.searchString)
        .subscribe((response: Response) => {
          if (response.ok) {
            this.searchResults = this.parseMapsResult(response.json());
          } else {
            console.warn('NOK ', response);
            this.searchResults = [];
          }
        }, (response: Response) => {
          this.searchResults = [];
          console.warn(response);
        });
    }
  }

  private parseMapsResult(result) {
    if (result.status === 'OK') {
      return result.predictions.map(
        pred => ({ friendlyName: pred.description, placeID: pred.place_id })
      ).slice(0, 5);
    }
    return [];
  }

  private parseLatLong(result): [number, number] {
    // if (result.status === "OK") // MUST CHECK result.status in an upper level
    return [result.geometry.location.lat, result.geometry.location.lng];
  }

  checkDeviceSettings(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.diagnostic.isLocationEnabled().then((resp: boolean) => {
        if (!resp) {
          console.warn('Location services are disabled on the device');
        }
        observer.next(resp);
      }).catch((error) => {
        console.error('diagnostic.isLocationEnabled', error);
        observer.error(error);
      });
    });
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition()
      .then((resp: Position) => {
        this.userService
          .getFriendlyLocation(resp.coords.latitude, resp.coords.longitude, resp.coords.accuracy)
          .subscribe(
          (response: Response) => {
            this.myLocation = {
              location: response.json().friendlyName,
              latitude: resp.coords.latitude,
              longitude: resp.coords.longitude,
            };
          },
          (response: Response) => {
            console.error('userService.getFriendlyLocation', response);
            let errorMsg = response.statusText;
            try {
              errorMsg = JSON.stringify(response.json());
            } catch (error) {
              console.warn(error);
            }
            this.myLocationAvailable = false;
          });
      })
      .catch((error) => {
        console.error('geolocation.getCurrentPosition', error);
        this.myLocationAvailable = false;
      });
  }

  sendMyLocation() {
    this.viewCtrl.dismiss({ state: 'success', data: this.myLocation });
  }

  sendLocation(res: SearchResult) {
    console.debug('sendLocation', res);
    this.mapsProvider.placeDetails(res.placeID).subscribe(
      (response: Response) => {
        if (response.ok) {
          const responseJSON = response.json();
          if (responseJSON.status === 'OK') {
            const [lat, long] = this.parseLatLong(responseJSON.result);
            this.userService
              .getFriendlyLocation(lat, long, 0)
              .subscribe(
              (response: Response) => {
                const newLocation = {
                  location: response.json().friendlyName,
                  latitude: lat,
                  longitude: long,
                };
                this.viewCtrl.dismiss({ state: 'success', data: newLocation });
              },
              (response: Response) => {
                console.error('userService.getFriendlyLocation', response);
                let errorMsg = response.statusText;
                try {
                  errorMsg = JSON.stringify(response.json());
                } catch (error) {
                  console.warn(error);
                }
                this.viewCtrl.dismiss({
                  state: 'error',
                  code: response.status,
                  message: errorMsg,
                });
              });
          } else {
            console.error('mapsProvider.placeDetails status nok', response);
            this.viewCtrl.dismiss({ state: 'error' });
          }
        } else {
          console.error('mapsProvider.placeDetails response nok', response);
          this.viewCtrl.dismiss({ state: 'error' });
        }
      }, (response: Response) => {
        console.error('mapsProvider.placeDetails request nok', response);
        let errorMsg = response.statusText;
        try {
          errorMsg = JSON.stringify(response.json());
        } catch (error) {
          console.warn(error);
        }
        this.viewCtrl.dismiss({
          state: 'error',
          code: response.status,
          message: errorMsg,
        });
      });
  }

  dismissModal() {
    // Nothing to be done
    this.viewCtrl.dismiss({ state: 'noop' });
  }
}

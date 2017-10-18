import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { Response } from '@angular/http';
import { UserService } from '../../providers/user-service/user-service';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';

// @IonicPage()
@Component({
  selector: 'page-add-location-modal',
  templateUrl: 'add-location-modal.html',
})
export class AddLocationModalPage {


  constructor(
    private nav: NavController,
    private viewCtrl: ViewController,
    private userService: UserService,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic) {

    this.checkDeviceSettings();

  }

  checkDeviceSettings() {

    this.diagnostic.isLocationEnabled().then((resp) => {
      if (resp !== false) {
        this.getCurrentLocation();
      } else {
        console.log('Location services are disabled on the device');
        this.dismissModal();
      }
    }).catch((error) => {
      console.error('diagnostic.isLocationEnabled', error);
      this.viewCtrl.dismiss({ state: 'error' });
    }),
      { timeout: 3000 };
  }

  getCurrentLocation() {
    this.geolocation.getCurrentPosition()
      .then((resp: Position) => {
        this.userService
          .getFriendlyLocation(resp.coords.latitude, resp.coords.longitude, resp.coords.accuracy)
          .subscribe(
          (response: Response) => {
            let data = {
              location: response.json().friendlyName,
              latitude: resp.coords.latitude,
              longitude: resp.coords.longitude,
            };
            this.viewCtrl.dismiss({ state: 'success', data });
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
      })
      .catch((error) => {
        console.log('geolocation.getCurrentPosition', error);
        this.viewCtrl.dismiss({ state: 'error', code: error.code, message: error.message });
      }),
      { timeout: 3000 };

  }

  dismissModal() {
    this.viewCtrl.dismiss({ state: 'error' });
  }
}

import {NavController, ViewController, } from 'ionic-angular/index';
import {Geolocation, Diagnostic} from 'ionic-native';
import {Component} from '@angular/core';
import {Response} from '@angular/http';

import {UserService} from '../../services/api/ApiService';

@Component({
  templateUrl: 'build/modals/AddLocationModal/AddLocationModal.html',
})

export class AddLocationModal {

  constructor(
    private nav:NavController,
    private viewCtrl:ViewController,
    private userService:UserService) {

      this.checkDeviceSettings()

  }

  checkDeviceSettings() {

    Diagnostic.isLocationEnabled().then((resp) => {
      if(resp !== false)  {
        this.getCurrentLocation()
      } else {
        console.log('Location services are disabled on the device')
        this.dismissModal()
      }
    }).catch((error) => {
      console.log(error)
      this.viewCtrl.dismiss({ state: 'error'})
    }),
    { timeout: 3000 }
  }

  getCurrentLocation() {
    Geolocation.getCurrentPosition()
    .then((resp) => {
      this.userService
      .getFriendlyLocation(resp.coords.latitude, resp.coords.longitude, resp.coords.accuracy)
      .subscribe(
        (response:Response) => {
          let data = {
            location: response.json().friendlyName,
            latitude: resp.coords.latitude,
            longitude: resp.coords.longitude,
          }
          this.viewCtrl.dismiss({ state: 'success', data })
        },
        (response:Response) => {
          console.log(response)
          this.viewCtrl.dismiss({
            state: 'error',
            code: response.status,
            message: JSON.stringify(response.json()),
          })
        }
        )
    })
    .catch((error) => {
      console.log(Geolocation)
      this.viewCtrl.dismiss({ state: 'error', code: error.code, message: error.message })
    }),
    { timeout: 3000 }

  }
  
  dismissModal() {
    this.viewCtrl.dismiss({ state: 'error' })
  }
}

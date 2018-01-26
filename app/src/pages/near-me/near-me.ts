import { Component } from '@angular/core';
import { NavController, NavParams, Events, Platform } from 'ionic-angular';
import { Response } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

import { ExploreService } from '../../providers/explore-service/explore-service';
import { UserService } from '../../providers/user-service/user-service';

// @IonicPage()
@Component({
  selector: 'page-near-me',
  templateUrl: 'near-me.html',
})
export class NearMePage {
  public loadingLocation: Boolean = false;
  public loading = false;
  public feed: Array<Object> = [];
  public isAndroid: Boolean = false;

  constructor(
    private exploreService: ExploreService,
    private userService: UserService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private events: Events,
    private geolocation: Geolocation,
    private diagnostic: Diagnostic) {
    this.isAndroid = platform.is('android');
  }

  ionViewWillEnter() {
    console.debug('ionViewWillEnter NearMePage');
    this.updateLocation();
  }

  ionViewWillLeave() {
    if (!this.navCtrl.isTransitioning() && this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    }
  }

  private getNearMeFeed() {
    this.loading = true;
    console.debug('getNearMeFeed');
    this.exploreService.getExploreNearMeFeed('_', (response: Response) => {
      if (JSON.stringify(this.feed) !== response.text()) {
        this.feed = response.json();
        this.loading = false;
        console.debug('we has explore near me feed', this.feed);
      }
    }, (failureResponse: Response) => {
      console.warn(failureResponse.statusText, failureResponse);
      this.loading = false;
    });
  }

  public updateLocation() {
    this.loadingLocation = true;
    this.diagnostic.isLocationEnabled().then((resp) => {
      if (resp !== false) {
        this.geolocation.getCurrentPosition()
          .then((resp: Position) => {
            this.userService
              .getFriendlyLocation(resp.coords.latitude, resp.coords.longitude, resp.coords.accuracy)
              .subscribe(
              (response: Response) => {
                const friendlyName = response.json().friendlyName;
                let data = {
                  location: friendlyName,
                  latitude: resp.coords.latitude,
                  longitude: resp.coords.longitude,
                };
                this.userService.updateUser(data).subscribe((response) => {
                  this.events.publish('user:updated', response.json());
                  this.events.publish('feedback:show', { msg: 'Location set to ' + friendlyName + '!', icon: 'checkmark' }); this.loadingLocation = false;
                  this.getNearMeFeed();
                }, (response: Response) => {
                  console.warn('userService.updateUser', response);
                  this.events.publish('feedback:show', { msg: 'Couldn\'t update location', icon: 'alert' });
                  this.loadingLocation = false;
                });
              },
              (response: Response) => {
                console.warn('userService.getFriendlyLocation', response);
                this.events.publish('feedback:show', { msg: 'Couldn\'t find location', icon: 'alert' });
                this.loadingLocation = false;
              });
          })
          .catch((error) => {
            console.warn('geolocation.getCurrentPosition', error);
            this.events.publish('feedback:show', { msg: error.message, icon: 'alert' });
            this.loadingLocation = false;
          });
      } else {
        console.debug('Location services are disabled on the device');
        this.events.publish('feedback:show', { msg: 'Location services are disabled on the device', icon: 'alert' });
        this.loadingLocation = false;
      }
    }).catch((error) => {
      console.debug('diagnostic.isLocationEnabled', error);
      this.events.publish('feedback:show', { msg: 'Couldn\'t find location', icon: 'alert' });
      this.loadingLocation = false;
    });
  }
}

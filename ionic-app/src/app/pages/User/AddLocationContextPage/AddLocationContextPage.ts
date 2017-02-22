import {AlertController, Events, NavController, ModalController} from 'ionic-angular'
import {Component} from '@angular/core'
import {Response} from '@angular/http'

import {AddLocationModal} from '../../../modals/AddLocationModal/AddLocationModal'
import {MainPage} from '../../MainPage/MainPage'
import {NavigationService} from '../../../services/navigation/NavigationService'
import {UserService} from '../../../services/api/ApiService'

@Component({
  templateUrl: 'build/pages/User/AddLocationContextPage/AddLocationContextPage.html',
})
export class AddLocationContextPage {

  constructor(private nav: NavController,
              private userService: UserService,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private events: Events) {
  }

  skipLocation() {
    this.nav.setRoot(MainPage)
  }

  shareLocation() {
    var modal = this.modalCtrl.create(AddLocationModal)
    modal.onDidDismiss((result) => {
      if (result.state == 'success') {
        this.continueOnboarding(result.data)
      } else {
        let failAlert = this.alertCtrl.create({
          title: 'Failed to update location',
          subTitle: 'Please go to your settings and allow Impossible to access your location.',
          buttons: ['OK'],
        })
        failAlert.present()
      }
    })
    modal.present()
  }

  continueOnboarding(data) {
    this.userService.updateUser(data).subscribe(
      (response: Response) => {
        let user = response.json()
        this.events.publish('user:updated', user)
        this.nav.setRoot(NavigationService.nextOnboardingPage(user))
      },
      (response: Response) => {
        let failModal = this.modalCtrl.create({
          title: 'Oops!',
          subTitle: 'Something went wrong',
          buttons: ['OK']
        })
        failModal.present()
      })
  }
}

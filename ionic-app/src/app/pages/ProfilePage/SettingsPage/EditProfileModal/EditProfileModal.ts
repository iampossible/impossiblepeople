import {
  AlertController,
  ModalController,
  NavController,
  NavParams,
  ViewController,
  Events
} from 'ionic-angular'
import { Component } from '@angular/core'
import { Response } from '@angular/http'
import { UserService, ImageService } from '../../../../services/api/ApiService'
import { AddLocationModal } from '../../../../modals/AddLocationModal/AddLocationModal'
import { Camera } from 'ionic-native'
import { DomSanitizationService } from '@angular/platform-browser'

@Component({
  templateUrl: 'build/pages/ProfilePage/SettingsPage/EditProfileModal/EditProfileModal.html',
})
export class EditProfileModal {
  private FORM_FIELDS: Array<string> = ['firstName', 'lastName', 'biography', 'location', 'longitude', 'latitude', 'url']

  private imageChanged: boolean
  private user: any
  private profilePicture: any

  constructor(private nav: NavController,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private userService: UserService,
    private params: NavParams,
    private events: Events,
    private imageService: ImageService,
    private domSanitizationService: DomSanitizationService) {
    this.imageChanged = false
    this.user = Object.assign({}, params.data)
    if (this.user.imageSource) {
      this.profilePicture = this.user.imageSource
    } else {
      this.profilePicture = 'build/images/green-bean.png'
    }
  }

  public dismissModal() {
    this.viewCtrl.dismiss()
  }

  private hasProfileChanges() {
    return !!Object.keys(this.detectProfileChanges()).length || this.imageChanged
  }

  private detectProfileChanges() {
    let updateData = {}

    this.FORM_FIELDS.map((key) => {
      if ((this.user[key] || '') != (this.params.get(key) || '')) {
        updateData[key] = this.user[key]
      }
    })

    return updateData
  }

  updateProfile = () => {
    if (this.imageChanged) {
      this.updateProfilePicture()
    }
    this.userService.updateUser(this.detectProfileChanges()).subscribe((response) => {
      this.events.publish('user:updated', response.json())
      this.viewCtrl.dismiss()
    },
      (error) => {
        let msg = 'Failed to update profile';
        if ('validation' in error) {
          if (error.validation.keys.pop() === 'url') {
            msg = 'weblink must be a valid URL. ie: http://twitter.com/impossible'
          }
        }

        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: msg,
          buttons: ['OK']
        })
        failAlert.present()
      })
  }

  updateProfilePicture = () => {
    this.imageService
      .addImage(this.user.imageSource)
      .subscribe((response: Response) => {
        this.events.publish('user:updated', response.json())
        this.imageChanged = false
      }, (response: Response) => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Failed to update image',
          buttons: ['OK']
        })
        failAlert.present()
      })
  }

  addLocation = (ev) => {
    let modal = this.modalCtrl.create(AddLocationModal)
    modal.onDidDismiss((result) => {
      if (result.state == 'success') {
        Object.assign(this.user, result.data)
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

  changeProfilePicture() {
    let CAMERA = 1
    let PHOTOLIBRARY = 0

    let cameraAlert = this.alertCtrl.create({
      title: 'Choose an image',
      buttons: [
        { text: 'Camera', handler: () => this._getPicture(CAMERA), role: null },
        { text: 'Photo Library', handler: () => this._getPicture(PHOTOLIBRARY), role: null },
        { text: 'Cancel', role: 'cancel' },
      ],
      cssClass: 'equal-weight secondary',
    })
    cameraAlert.present()

  }

  _getPicture(source) {
    let DATA_URL = 0
    let FRONT = 1
    let IMAGE_URI = 1
    let JPG = 0
    let PNG = 1
    Camera
      .getPicture({
        allowEdit: true,
        cameraDirection: FRONT,
        destinationType: DATA_URL,
        encodingType: JPG,
        saveToPhotoAlbum: true,
        sourceType: source,
      })
      .then((result) => {
        this.imageChanged = true
        this.user.imageSource = 'data:image/jpeg;base64,' + result
        this.profilePicture = 'data:image/jpeg;base64,' + result
      })
      .catch((err) => {
        if (err === 'no image selected') {
          //  user cancelled selection
          return
        } else {
          // something went wrong
          let failAlert = this.alertCtrl.create({
            title: 'Update failed',
            subTitle: 'Apologies, but something went wrong',
            buttons: ['OK']
          })
          failAlert.present()
        }
      })
  }
}

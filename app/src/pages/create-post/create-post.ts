import { Component } from '@angular/core';
import { Events, ModalController, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Response } from '@angular/http';
import { AppConstants } from '../../AppConstants';
import { PostService } from '../../providers/post-service/post-service';
import { ProfileService } from '../../providers/profile-service/profile-service';
import { AddLocationModalPage } from '../add-location-modal/add-location-modal';
import { Environment } from '../../Environment';
import { TagInterestPage } from '../tag-interest/tag-interest';

declare const heap: any;

// @IonicPage()
@Component({
  selector: 'page-create-post',
  templateUrl: 'create-post.html',
})
export class CreatePostPage {

  public createPostForm: FormGroup;
  public textArea: any;
  private AppConstants: AppConstants;
  private dropdownData: any;
  private selectedOption = { optionValue: 0 };
  private currentLocation: any = {};
  private userIcon: any;
  private selectedCategory: any = false;
  private processing = false;

  constructor(
    private postService: PostService,
    private formBuilder: FormBuilder,
    private events: Events,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private profileService: ProfileService) {
    this.AppConstants = AppConstants;
    this.createPostForm = this.formBuilder.group({
      postType: AppConstants.OFFER,
      content: ['', Validators.required],
      interestID: ['', Validators.required],
    });

    this.dropdownData = AppConstants.REQUIRED_TIME_OPTIONS;
    try {
      const user = JSON.parse(window.localStorage.getItem('profileUserCache') || 'boom');
      this.userIcon = user.imageSource;
      this.currentLocation = {
        latitude: user.latitude,
        longitude: user.longitude,
        location: user.location,
      };
    } catch (_) {
      // not cached
    }
    this.profileService
      .getProfile(localStorage.getItem('USER_ID'))
      .subscribe((response: Response) => {
        if (window.localStorage.getItem('profileUserCache') !== response.text()) {
          let user = response.json();
          window.localStorage.setItem('profileUserCache', JSON.stringify(user));
          this.userIcon = user.imageSource;
          this.currentLocation = {
            latitude: user.latitude,
            longitude: user.longitude,
            location: user.location,
          };
        }
      });
  }

  addLocation = (ev) => {
    var modal = this.modalCtrl.create(AddLocationModalPage);
    modal.onDidDismiss((result) => {
      if (result.state === 'success') {
        this.currentLocation = result.data;
      } else if (result.state === 'noop') {
        // do nothing, the user "skipped"
      } else if (result.state === 'error') {
        let locationAlert = this.alertCtrl.create({
          title: 'Post location required',
          subTitle: 'Please go to your settings and allow Impossible to access your location.',
          buttons: ['OK'],
        });
        locationAlert.present();
      }
    });
    modal.present();
  }

  createPost = (event) => {
    if (this.processing === true) {
      return;
    }
    if (this.processing === false) {
      this.processing = true;

      event.preventDefault();
      event.stopPropagation();
      let postData = {
        content: this.createPostForm.value.content,
        postType: this.createPostForm.value.postType,
        timeRequired: this.selectedOption.optionValue,
        interestID: this.createPostForm.value.interestID,
      };

      if (this.currentLocation.location) {
        postData = Object.assign(postData, {
          location: this.currentLocation.location,
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude,
        });
      }
      this.postService.createPost(postData, this.onCreateSuccess, this.onCreateFailure);
    }
    return;
  }

  selectCategory(event) {
    let interestID = this.selectedCategory.interestID;
    let params = {};
    if (interestID) {
      params = { defaultInterests: [interestID] };
    }

    let modal = this.modalCtrl.create(TagInterestPage, params);
    modal.onDidDismiss((data) => {
      if (data.length) {
        this.selectedCategory = data.pop();
        var control: AbstractControl = <AbstractControl>this.createPostForm.controls['interestID'];
        control.setValue(this.selectedCategory.interestID);
      }
    });
    modal.present();
  }

  onCreateSuccess = () => {
    this.processing = false;

    if (Environment.HEAP && 'heap' in window) {
      heap.track('POST_CREATE');
    }
    this.events.publish('feedback:show', { msg: 'Posted!', icon: 'checkmark' });
    this.events.publish('notifications:activate');
    this.events.publish('CreatePostTab:close');
    this.resetForm();
  }

  resetForm() {
    let control: AbstractControl = <AbstractControl>this.createPostForm.controls['postType'];
    control.setValue(AppConstants.OFFER);
    control = <AbstractControl>this.createPostForm.controls['content'];
    control.setValue('');
    control = <AbstractControl>this.createPostForm.controls['interestID'];
    control.setValue('');
    this.selectedCategory = false;
    this.selectedOption = { optionValue: 0 };
    this.dropdownData = AppConstants.REQUIRED_TIME_OPTIONS;
    this.currentLocation = {};
  }

  onCreateFailure = (response: Response) => {
    this.processing = false;
    let failAlert = this.alertCtrl.create({
      title: 'Could not create your post',
      subTitle: 'Post creation failed, please try again',
      buttons: ['OK']
    });
    failAlert.present();
  }

  onSelect(option) {
    this.selectedOption = option;
  }

  onPostTypeChanged(event) {
    if (event.value === AppConstants.ASK) {
      this.dropdownData.label = AppConstants.REQUIRED_TIME_ASK_LABEL;
    } else {
      this.dropdownData.label = AppConstants.REQUIRED_TIME_OFFER_LABEL;
    }
  }

  /************************************* textarea behaviour work arounds
  ionViewWillEnter() {
    Keyboard.disableScroll(true)
  }

  ionViewWillLeave() {
    Keyboard.disableScroll(false)
  }
  /************************************* textarea behaviour work arounds */


}

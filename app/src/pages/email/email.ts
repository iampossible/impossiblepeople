import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {Response} from '@angular/http';
import { UserService } from '../../providers/user-service/user-service';
import { Environment } from '../../Environment';

declare const heap: any;

//@IonicPage()
@Component({
  selector: 'page-email',
  templateUrl: 'email.html',
})
export class EmailPage {

  private user: any;
  private emailForm: FormGroup;

  constructor(private params: NavParams,
              private form: FormBuilder,
              private events: Events,
              private alertCtrl: AlertController,
              private userService: UserService,
              private nav: NavController) {
    this.user = params.data;
    this.emailForm = form.group({
      email: ['', Validators.required],
    });
  }

  saveEmail(event) {
    if (this.emailForm.valid) {
      let userUpdate = { email: this.emailForm.value.email };
      this.userService.updateUser(userUpdate).subscribe((response: Response) => {
        if (Environment.HEAP && 'heap' in window) {
          heap.track('CHANGE_EMAIL');
        }
        this.events.publish('user:updated', response.json());
        this.nav.pop();
      }, (response: Response) => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: `Something went wrong: ${JSON.stringify(response.json())}`,
          buttons: ['OK']
        });
        failAlert.present();
      });
    }
  }

/*
  onPageWillEnter() {
    Keyboard.disableScroll(true);
  }

  onPageWillLeave() {
    Keyboard.disableScroll(false);
  }
*/
}

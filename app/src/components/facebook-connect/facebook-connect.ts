import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';

@Component({
  selector: 'facebook-connect',
  templateUrl: 'facebook-connect.html'
})
export class FacebookConnectComponent {
  private fbPermissions: Array<string> = ['friend_list', 'email'];


  constructor(private fb: Facebook) {
  }

  @Input() buttonText: string;

  @Output() onConnect = new EventEmitter();
  @Output() onError = new EventEmitter();

  private onFacebookOk = (auth) => {
    this.onConnect.emit(auth);
  }

  private throwErrorMsg(msg: string) {
    this.onError.emit(msg);
  }

  private onFacebookError = (msg) => {
    console.error('onFacebookError', msg);
    this.throwErrorMsg(msg);
  }

  private onFacebookCancel = (msg) => {
    console.error('onFacebookCancel', msg);
    this.throwErrorMsg(msg);
  }

  public fbConnect() {
    this.fb
      .getLoginStatus()
      .then((response) => {
        if (response.status === 'connected') {
          return this.onFacebookOk(response);
        }
        return this.fbLogin();
      })
      .catch(this.onFacebookError);
  }

  private fbLogin() {
    this.fb
      .login(this.fbPermissions)
      .then(this.onFacebookOk)
      .catch(this.onFacebookCancel);
  }


}

import {Component, EventEmitter, Input, Output} from '@angular/core'
import {Facebook} from 'ionic-native'
import {Button, Icon} from 'ionic-angular';

@Component({
  templateUrl: 'build/components/FacebookConnect/FacebookConnect.html',
  selector: 'facebook-connect',
  inputs: [],
  directives: [Button, Icon],
})
export class FacebookConnect {
  private fbPermissions: Array<string> = ['friend_list', 'email']

  @Input() buttonText: string;

  @Output() onConnect = new EventEmitter();
  @Output() onError = new EventEmitter();

  private onFacebookOk = (auth) => {
    this.onConnect.emit(auth)
  }

  private throwErrorMsg(msg: string) {
    this.onError.emit(msg)
  }

  private onFacebookError = (msg) => {
    console.error('onFacebookError', msg)
    this.throwErrorMsg(msg)
  }

  private onFacebookCancel = (msg) => {
    console.error('onFacebookCancel', msg)
    this.throwErrorMsg(msg)
  }

  public fbConnect() {
    Facebook
      .getLoginStatus()
      .then((response) => {
        if (response.status === 'connected') {
          return this.onFacebookOk(response)
        }
        return this.fbLogin()
      })
      .catch(this.onFacebookError)
  }

  private fbLogin() {
    Facebook
      .login(this.fbPermissions)
      .then(this.onFacebookOk)
      .catch(this.onFacebookCancel)
  }

}

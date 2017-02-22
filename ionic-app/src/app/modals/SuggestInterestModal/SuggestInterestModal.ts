import {NavController, ViewController, AlertController} from 'ionic-angular/index'
import {ControlGroup, Validators, FormBuilder} from '@angular/common'
import {InterestService} from '../../services/api/ApiService'
import {Component} from '@angular/core'
import {Response} from '@angular/http'

@Component({
  templateUrl: 'build/modals/SuggestInterestModal/SuggestInterestModal.html',
})
export class SuggestInterestModal {
  private suggestInterestForm:ControlGroup

  constructor(private nav:NavController,
              private interestService:InterestService,
              private form:FormBuilder,
              private viewCtrl:ViewController,
              private alertCtrl:AlertController) {
    this.suggestInterestForm = form.group({
      suggestion: ['', Validators.required],
    })
  }

  submitSuggestion() {
    this.interestService.suggestInterest(
      this.suggestInterestForm.value.suggestion,
      this.onSubmitSuccess,
      this.onSubmitFailure
    )
  }

  onSubmitSuccess = (response:Response) => {
    let okAlert = this.alertCtrl.create({
      title: 'Thanks!',
      subTitle: `We'll consider your suggestion.`,
      buttons: [
        {text: 'OK', handler: () => {
          okAlert.dismiss().then(this.dismissModal)
        }}
      ],
    })

    okAlert.present()
  }

  onSubmitFailure = (response:Response) => {
    let failAlert = this.alertCtrl.create({
      title: 'Could not create your suggestion',
      subTitle: 'something failed, please try again',
      buttons: ['OK']
    })

    failAlert.present()
  }

  dismissModal = () => {
    this.viewCtrl.dismiss()
  }
}

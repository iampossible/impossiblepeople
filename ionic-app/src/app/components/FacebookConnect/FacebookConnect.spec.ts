import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {FacebookConnect} from './FacebookConnect'
import {Facebook} from 'ionic-native'

let testProviders: Array<any> = [
  //custom providers
];

describe('FacebookConnect component', () => {
  let facebookButton: HTMLElement;

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(FacebookConnect, this, true, () => {

    facebookButton = this.element.querySelector('button.facebook-connect');

    /**
     * we need to call expect() after a next tick because all the spies return promises
     */
    this.clickButton = (): Promise<HTMLElement> => {
      facebookButton.click()
      return new Promise((accept) => {
        process.nextTick(() => {
          accept(facebookButton)
        })
      })
    }
  })));

  it('should contain a button', () => {
    expect(facebookButton.innerText.trim()).toBe('Continue with Facebook')
  })

  it('should call the facebook plugin on click', (done) => {
    spyOn(this.instance, 'fbConnect').and.callThrough()

    this.clickButton().then(() => {
      expect(this.instance.fbConnect).toHaveBeenCalled()
      done()
    })
  })

  it('should return a promise resolving a user object when user is already connected', (done) => {
    spyOn(this.instance, 'onFacebookOk').and.callThrough()
    spyOn(Facebook, 'getLoginStatus').and.returnValue(Promise.resolve({ test: 'hello', status: 'connected' }))

    this.instance.onConnect.subscribe((ev) => {
      expect(this.instance.onFacebookOk).toHaveBeenCalledWith({ test: 'hello', status: 'connected' })
      expect(ev.status).toBe('connected')
      done()
    })

    this.clickButton()
  })

  it('should login when user is not yet connected', (done) => {
    spyOn(this.instance, 'fbLogin').and.callThrough()
    spyOn(this.instance, 'onFacebookOk')
    spyOn(Facebook, 'getLoginStatus').and.returnValue(Promise.resolve({ test: 'hello', status: 'not-connected' }))
    spyOn(Facebook, 'login').and.returnValue(Promise.resolve({ test: 'hello', status: 'connected' }))

    this.clickButton().then(() => {
      expect(this.instance.fbLogin).toHaveBeenCalledTimes(1)
      expect(Facebook.login).toHaveBeenCalledWith(['friend_list', 'email'])
      expect(this.instance.onFacebookOk).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('should call error method in case getLoginStatus() fails', (done) => {
    spyOn(this.instance, 'onFacebookError').and.callThrough()
    spyOn(Facebook, 'getLoginStatus').and.returnValue(Promise.reject('this is terrible'))

    this.instance.onError.subscribe((ev) => {
      expect(this.instance.onFacebookError).toHaveBeenCalledTimes(1)
      done()
    })

    this.clickButton()
  })

  it('should call error method in case login() fails', (done) => {
    spyOn(this.instance, 'onFacebookCancel').and.callThrough()
    spyOn(Facebook, 'getLoginStatus').and.returnValue(Promise.resolve({ test: 'hello', status: 'not-connected' }))
    spyOn(Facebook, 'login').and.returnValue(Promise.reject('ups!'))

    this.instance.onError.subscribe((ev) => {
      expect(Facebook.login).toHaveBeenCalledTimes(1)
      expect(this.instance.onFacebookCancel).toHaveBeenCalledTimes(1)
      done()
    })

    this.clickButton()
  })

})

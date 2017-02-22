import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {InviteContacts} from './InviteContacts'
import {Contacts} from 'ionic-native'

let testProviders: Array<any> = [
  { provide: Contacts, useClass: Contacts },
];

describe('InviteContacts component', () => {

  let inviteButton: HTMLElement

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(InviteContacts, this, true, () => {

    inviteButton = this.element.querySelector('button.invite-contacts');

    this.clickButton = (): Promise<HTMLElement> => {
      inviteButton.click()
      return new Promise((accept) => {
        process.nextTick(() => {
          accept(inviteButton)
        })
      })
    }
  })));

  it('should contain a button', () => {
    expect(inviteButton.innerText.trim()).toBe('Find friends')
  })

  it('should call the accessContacts method on click', (done) => {
    spyOn(this.instance, 'accessContacts')

    this.clickButton().then(() => {
      expect(this.instance.accessContacts).toHaveBeenCalled()
      done()
    })
  })

  it('should call the contacts plugin on click', (done) => {
    spyOn(Contacts, 'find').and.returnValue(Promise.resolve([]))

    this.clickButton().then(() => {
      expect(Contacts.find).toHaveBeenCalledWith(jasmine.any(Array), jasmine.any(Object))
      done()
    })
  })

  it('should return a promise resolving a list of contacts', (done) => {
    spyOn(this.instance, 'onInviteOk').and.callThrough()
    spyOn(Contacts, 'find').and.returnValue(Promise.resolve([
      {},
      { emails: [] },
      { emails: [{ type: 'home', value: 'foo' }], name: { formatted: 'Hans Muster' } },
    ]))

    this.instance.onConnect.subscribe((contacts) => {
      expect(this.instance.onInviteOk).toHaveBeenCalled()
      expect(contacts[0]).toEqual({ name: 'Hans Muster', email: 'foo' })
      done()
    })

    this.clickButton()
  })

  it('should return order the contacts alphabetically', (done) => {
    spyOn(this.instance, 'onInviteOk').and.callThrough()
    spyOn(Contacts, 'find').and.returnValue(Promise.resolve([
      { emails: [{ type: 'home', value: 'foo' }], name: { formatted: 'DDD Forth' } },
      { emails: [{ type: 'home', value: 'aaa@aasdasd.com' }] },
      { emails: [{ type: 'home', value: 'foo' }], name: { formatted: 'BBB Second' } },
      { emails: [{ type: 'home', value: 'foo' }] },
      { emails: [{ type: 'home', value: 'foo' }] },
      { emails: [{ type: 'home', value: 'foo' }], name: { formatted: 'AAA First' } },
      { emails: [{ type: 'home', value: 'foo' }], name: { formatted: 'CCC Third' } },
      { emails: [{ type: 'home', value: 'foo' }] },
      { emails: [{ type: 'home', value: 'foo' }] },
    ]))

    this.instance.onConnect.subscribe((contacts) => {
      expect(contacts[0].name).toEqual('AAA First')
      expect(contacts[1].name).toEqual('aaa@aasdasd.com')
      expect(contacts[2].name).toEqual('BBB Second')
      expect(contacts[3].name).toEqual('CCC Third')
      expect(contacts[4].name).toEqual('DDD Forth')
      expect(contacts[5].name).toEqual('foo')
      done()
    })

    this.clickButton()
  })

  it('should call error method in case find() fails', (done) => {
    spyOn(this.instance, 'onInviteError').and.callThrough()
    spyOn(Contacts, 'find').and.returnValue(Promise.reject('this is terrible'))

    this.instance.onError.subscribe((msg) => {
      expect(this.instance.onInviteError).toHaveBeenCalledTimes(1)
      expect(msg).toEqual('this is terrible')
      done()
    })

    this.clickButton()
  })
})

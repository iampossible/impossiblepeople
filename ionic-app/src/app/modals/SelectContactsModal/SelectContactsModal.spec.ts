// import {
//   it,
//   beforeEachProviders,
//   beforeEach,
//   ComponentFixture,
//   TestComponentBuilder,
//   injectAsync
// } from '@angular/common'
// import {provide} from '@angular/core'
// import {IonicApp, Platform, Keyboard, Config, NavController, NavParams, ViewController} from 'ionic-angular'
// import {MockIonic, MockNavController} from '../../../testing/mocks/Mocks'
// import {SelectContactsModal} from './SelectContactsModal'
//
// describe('Select contacts modal', () => {
//   let selectModal:SelectContactsModal
//   let selectModalFixture:ComponentFixture = null
//   let selectModalTemplate
//   let mockNavController
//   let viewController = new MockIonic()
//
//   beforeEachProviders(() => {
//     mockNavController = new MockNavController()
//
//     return [
//       provide(NavController, {useValue: mockNavController}),
//       provide(NavParams, {useValue: { data: { contacts: [{ name: 'Hans Muster', email: 'hey@you.org' }] } }}),
//       provide(ViewController, {useValue: viewController}),
//       provide(IonicApp, {useClass: MockIonic}),
//       provide(Config, {useClass: MockIonic}),
//       provide(Platform, {useClass: MockIonic}),
//       provide(Keyboard, {useClass: MockIonic}),
//     ]
//   })
//
//   beforeEach(injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
//     return tcb
//       .createAsync(SelectContactsModal)
//       .then((componentFixture:ComponentFixture) => {
//         selectModalFixture = componentFixture
//         selectModal = componentFixture.componentInstance
//         selectModalTemplate = componentFixture.nativeElement
//         selectModalFixture.detectChanges()
//       })
//       .catch((e) => {
//         console.error('Error fetching artifacts', e)
//       })
//   }))
//
//   it('should display a contact', () => {
//     expect(selectModalTemplate.querySelector('.contact').innerText).toBe('Hans Muster')
//   })
//
//   it('should display multiple contacts', () => {
//     selectModal.contacts = [{}, {}, {}]
//     selectModalFixture.detectChanges()
//     expect(selectModalTemplate.querySelectorAll('.contact').length).toBe(3)
//   })
//
//   it('should update contact selection', () => {
//     spyOn(selectModal, 'selectedContact')
//     selectModalTemplate.querySelector('.contact ion-checkbox').click()
//     expect(selectModal.selectedContact).toHaveBeenCalled()
//   })
//
//   it('should prepare an array of contacts on submit', () => {
//     spyOn(viewController, 'dismiss')
//
//     selectModalTemplate.querySelector('.contact ion-checkbox').click()
//     selectModal.submitContacts()
//
//     expect(viewController.dismiss).toHaveBeenCalledWith(['hey@you.org'])
//   })
//
//   it('should dismiss with null when dismissed', () => {
//     spyOn(viewController, 'dismiss')
//
//     selectModalTemplate.querySelector('.contact ion-checkbox').click()
//     selectModal.dismissModal()
//
//     expect(viewController.dismiss).toHaveBeenCalledWith(null)
//   })
//
// })

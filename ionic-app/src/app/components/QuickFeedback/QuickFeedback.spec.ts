import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {QuickFeedback} from './QuickFeedback'
import {Events} from 'ionic-angular'


let testEvents = new Events()
let testProviders: Array<any> = [
  { provide: Events, useValue: testEvents },
];

describe('Button Dropdown component', () => {

  //custom vars here

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(QuickFeedback, this, true, () => {

    this.something = () => {} //custom helper method
  })));

  it('should show notification msg when show event was triggered', (done) => {

    testEvents.publish('feedback:show', { icon: 'checkmark', msg:'success' })

    this.fixture.detectChanges()

    expect(this.instance.isVisible).toBe(true)
    expect(this.instance.notification.msg).toBe('success')
    expect(this.instance.notification.icon).toBe('checkmark')

    expect(this.element.querySelector('.msg').innerHTML.trim()).toBe('success')

    setTimeout(() => {
      expect(this.instance.isVisible).toBe(false)
      done();
    }, this.instance.durationTimeout*1.2)
  })
})

//
// import {
//   describe,
//   beforeEach,
//   beforeEachProviders,
//   ComponentFixture,
//   TestComponentBuilder,
//   injectAsync
// } from '@angular/testing'
// import {provide} from '@angular/core'
// import {Config, Icon, Item, Button, NavController, Events} from 'ionic-angular'
// import {MockIonic, MockComponent} from '../../../testing/mocks/Mocks'
// import {QuickFeedback} from './QuickFeedback'
// import {MockNavController} from '../../../testing/mocks/MockNavController'
//
// describe('QuickFeedback component', () => {
//
//   let quickFeedbackFixture, quickFeedbackTemplate, quickFeedbackInstance
//   let injectedEvents = new Events()
//
//   beforeEachProviders(() => [
//     provide(Config, {useClass: MockIonic}),
//     provide(Events, {useValue: injectedEvents})
//   ])
//
//   beforeEach(injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
//     return tcb
//       .overrideDirective(QuickFeedback, Icon, MockComponent)
//       .createAsync(QuickFeedback)
//       .then((componentFixture:ComponentFixture) => {
//         quickFeedbackFixture = componentFixture
//         quickFeedbackTemplate = componentFixture.nativeElement
//         quickFeedbackInstance = componentFixture.componentInstance
//
//         quickFeedbackFixture.detectChanges()
//       })
//       .catch((e) => {
//         console.error('Error fetching artifacts', e)
//       })
//   }))
//
//   it('should show notification msg when show event was triggered', (done) => {
//
//     injectedEvents.publish('feedback:show', { icon: 'checkmark', msg:'success' })
//
//     quickFeedbackFixture.detectChanges()
//
//     expect(quickFeedbackInstance.isVisible).toBe(true)
//     expect(quickFeedbackInstance.notification.msg).toBe('success')
//     expect(quickFeedbackInstance.notification.icon).toBe('checkmark')
//
//     expect(quickFeedbackTemplate.querySelector('.msg').innerHTML.trim()).toBe('success')
//
//     setTimeout(() => {
//       expect(quickFeedbackInstance.isVisible).toBe(false)
//       done();
//     }, quickFeedbackInstance.durationTimeout*1.2)
//   })
// })

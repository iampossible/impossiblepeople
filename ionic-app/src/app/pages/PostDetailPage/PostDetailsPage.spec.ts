// import {
//   describe,
//   it,
//   beforeEachProviders,
//   beforeEach,
//   ComponentFixture,
//   TestComponentBuilder,
//   injectAsync
// } from '@angular/common'
// import {provide, Component} from '@angular/core'
// import {FormBuilder} from '@angular/common'
// import {
//   IonicApp,
//   Platform,
//   Keyboard,
//   Config,
//   NavController,
//   NavParams,
//   Form,
//   Icon,
//   Events
// } from 'ionic-angular'
// import {MockIonic, MockNavController} from '../../../testing/mocks/Mocks'
// import {PostDetailPage} from './PostDetailPage'
// import {PostService} from '../../services/api/ApiService'
// import {AppConstants} from '../../AppConstants'
//
//
// // TODO: This test does not run, fix ngControl
// xdescribe('Post Details Page', () => {
//
//   let postDetails:PostDetailPage;
//   let postDetailsFixture:ComponentFixture = null;
//   let noop = () => {
//   }
//
//   beforeEachProviders(() => [
//     provide(PostService, {
//       useValue: {
//         getPost: noop
//       }
//     }),
//     Form,
//     FormBuilder,
//     Events,
//     provide(NavParams, {useClass: MockIonic}),
//     provide(NavController, {useClass: MockNavController}),
//     provide(IonicApp, {useClass: MockIonic}),
//     provide(Config, {useClass: MockIonic}),
//     provide(Platform, {useClass: MockIonic}),
//     provide(Keyboard, {useClass: MockIonic}),
//   ]);
//
//   @Component({template: ''})
//   class EmptyComponent {
//   }
//
//   beforeEach(injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
//     return tcb
//       .overrideDirective(PostDetailPage, Icon, EmptyComponent)
//       .createAsync(PostDetailPage)
//       .then((componentFixture:ComponentFixture) => {
//         postDetailsFixture = componentFixture;
//         postDetails = componentFixture.componentInstance;
//
//         postDetailsFixture.detectChanges();
//       })
//       .catch((e) => {
//         // TODO: fix artifact errors
//        // console.error('Error fetching artifacts', e)
//       });
//   }))
//
//   it('should map seconds to the time required options', () => {
//     let val1Hour = postDetails.formatTimeRequired(3600);
//     expect(val1Hour).toBe("Would like 1 hour");
//
//     let valHalfday = postDetails.formatTimeRequired(43200);
//     expect(valHalfday).toBe("Would like half a day");
//
//     let valTobeDetermined = postDetails.formatTimeRequired(0);
//     expect(valTobeDetermined).toBe("To be determined");
//   })
//
//   it('should default to "To be determined"', () => {
//     let valTobeDeterminedIfnotFound = postDetails.formatTimeRequired(123);
//     expect(valTobeDeterminedIfnotFound).toBe("To be determined");
//   })
//
//   it('should format time required for asks', () => {
//     expect(postDetails.formatTimeRequired(43200)).toBe('Would like half a day')
//   })
//
//   it('should format time required for offers', () => {
//     postDetails.post = {
//       postType: AppConstants.OFFER,
//     }
//
//     expect(postDetails.formatTimeRequired(43200)).toBe('Offering half a day')
//   })
// })

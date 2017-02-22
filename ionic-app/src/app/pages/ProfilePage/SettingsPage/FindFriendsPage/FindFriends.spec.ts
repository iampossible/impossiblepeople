// import {beforeEachProviders, beforeEach, ComponentFixture, TestComponentBuilder, injectAsync} from '@angular/testing'
// import {MockBackend} from '@angular/http/testing'
// import {provide} from '@angular/core'
// import {BaseRequestOptions, Response, ResponseOptions, ResponseOptionsArgs} from '@angular/http'
// import {IonicApp, Platform, Keyboard, Config, NavController, Events} from 'ionic-angular'
// import {FindFriendsPage} from './FindFriendsPage'
// import {MockIonic} from '../../../../../testing/mocks/MockIonic'
// import {MockNavController} from '../../../../../testing/mocks/MockNavController'
// import {FacebookService} from '../../../../services/api/FacebookService'
// import {AuthService} from '../../../../services/api/AuthService'
// import {InterceptedHttp} from '../../../../services/api/InterceptedHttp'
//
//
// /**
//  * These tests are border-line useless, we kept them for reference how to inject a service with http
//  */
// describe('Find Friends Page', () => {
//   let findFriends:FindFriendsPage
//   let findFriendsFixture:ComponentFixture = null
//   let findFriendsTemplate
//   let viewController = new MockIonic()
//   let mockNavController:MockNavController
//   let mockBackend:MockBackend
//
//   beforeEachProviders(() => {
//     mockNavController = new MockNavController()
//
//     return [
//       Events,
//       MockBackend,
//       BaseRequestOptions,
//       Events,
//       provide(AuthService, {
//         useFactory: (backend, options, events) => {
//           mockBackend = backend
//           let http = new InterceptedHttp(mockBackend, options, events)
//           return new AuthService(http)
//         }, deps: [MockBackend, BaseRequestOptions, Events]
//       }),
//       provide(FacebookService, {useValue: {}}),
//       provide(NavController, {useValue: mockNavController}),
//       provide(IonicApp, {useClass: MockIonic}),
//       provide(Config, {useClass: MockIonic}),
//       provide(Platform, {useClass: MockIonic}),
//       provide(Keyboard, {useClass: MockIonic}),
//     ]
//   })
//
//   beforeEach(injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
//     return tcb
//       .createAsync(FindFriendsPage)
//       .then((componentFixture:ComponentFixture) => {
//         findFriendsFixture = componentFixture
//         findFriends = componentFixture.componentInstance
//         findFriendsTemplate = componentFixture.nativeElement
//         findFriendsFixture.detectChanges()
//       })
//       .catch((e) => {
//         console.error('Error fetching artifacts', e)
//       })
//   }))
//
//   it('should open modal when cordova returns contacts', () => {
//     spyOn(mockNavController, 'present')
//
//     findFriends.inviteSuccess(['test@example.com'])
//
//     expect(mockNavController.present).toHaveBeenCalled()
//   })
//
// })

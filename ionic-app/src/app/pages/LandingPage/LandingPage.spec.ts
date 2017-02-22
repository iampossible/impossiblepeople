// import {
//   describe,
//   it,
//   beforeEachProviders,
//   beforeEach,
//   setBaseTestProviders,
//   ComponentFixture,
//   TestComponentBuilder,
//   injectAsync
// } from '@angular/testing'
// import {provide} from '@angular/core'
// import {Response, ResponseOptions} from '@angular/http'
// import {IonicApp, Platform, Keyboard, Config, NavController} from 'ionic-angular'
// import {TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS} from '@angular/platform/testing/browser'
// import {SignUpPage, LandingPage, AuthPage, MainPage, InterestsPage} from '../Pages'
// import {MockIonic, MockNavController} from '../../../testing/mocks/Mocks'
// import {FacebookService} from '../../services/api/ApiService'
// import {Observable} from 'rxjs'
// import {InterceptedHttp} from '../../services/api/InterceptedHttp';
//
// // Doing this just once for everybody... you're welcome
// setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS, TEST_BROWSER_APPLICATION_PROVIDERS)
//
// describe('Landing Page', () => {
//   let landingPage:LandingPage
//   let landingPageFixture:ComponentFixture = null
//   let mockNavController
//   let facebookService
//
//   beforeEachProviders(() => {
//     mockNavController = new MockNavController()
//     facebookService = { checkToken:()=>{}, }
//
//     return [
//       provide(FacebookService, {useValue: facebookService}),
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
//       .createAsync(LandingPage)
//       .then((componentFixture:ComponentFixture) => {
//         landingPageFixture = componentFixture
//         landingPage = componentFixture.componentInstance
//         landingPageFixture.detectChanges()
//       })
//       .catch((e) => {
//         console.error('Error fetching artifacts', e)
//       })
//   }))
//
//   it('goToAuthPage() loads AuthPage', () => {
//     spyOn(mockNavController.rootNav, 'push')
//     landingPage.goToAuthPage({})
//     expect(mockNavController.rootNav.push).toHaveBeenCalledWith(AuthPage)
//   })
//
//   it('goToSignUpPage() propagates to NavController', () => {
//     spyOn(mockNavController.rootNav, 'push')
//     landingPage.goToSignUpPage({})
//
//     expect(mockNavController.rootNav.push).toHaveBeenCalledWith(SignUpPage)
//   })
//
//   describe('fbConnect()', () => {
//     var auth = {
//       authResponse: {
//         accessToken: '128934jhkdsafkhjasdfk'
//       }
//     }
//
//     it('should navigate to MainPage if user already exists', (done) => {
//       var response = new Response(new ResponseOptions({
//         body: JSON.stringify({interests: [null], location: 'some location'}),
//         status: 200,
//       }))
//       spyOn(facebookService, 'checkToken').and.returnValue(Observable.fromPromise(Promise.resolve(response)))
//       spyOn(mockNavController.rootNav, 'setRoot')
//
//       landingPage.fbConnect(auth)
//
//       setTimeout(() => {
//         expect(facebookService.checkToken).toHaveBeenCalledWith('128934jhkdsafkhjasdfk')
//         expect(facebookService.checkToken).toHaveBeenCalledTimes(1)
//         expect(mockNavController.rootNav.setRoot).toHaveBeenCalledWith(MainPage)
//         done();
//       }, 100)
//     })
//
//     it('should navigate to InterestPage if user does not exist in our system', (done) => {
//       var response = new Response(new ResponseOptions({
//         body: JSON.stringify({}),
//         status: 201,
//       }))
//       spyOn(facebookService, 'checkToken').and.returnValue(Observable.fromPromise(Promise.resolve(response)))
//       spyOn(mockNavController.rootNav, 'setRoot')
//
//       landingPage.fbConnect(auth)
//
//       setTimeout(() => {
//         expect(facebookService.checkToken).toHaveBeenCalledWith('128934jhkdsafkhjasdfk')
//         expect(facebookService.checkToken).toHaveBeenCalledTimes(1)
//         expect(mockNavController.rootNav.setRoot).toHaveBeenCalledWith(InterestsPage)
//         done();
//       }, 100)
//     })
//
//     it('should bring up alert if token is wrong/other problem', (done) => {
//       var response = new Response(new ResponseOptions({status: 400}))
//       spyOn(facebookService, 'checkToken').and.returnValue(Observable.fromPromise(Promise.resolve(response)))
//       spyOn(mockNavController, 'present')
//
//       landingPage.fbConnect(auth)
//
//       setTimeout(() => {
//         expect(mockNavController.present).toHaveBeenCalledTimes(1)
//         done();
//       }, 100)
//     })
//
//     it('should bring up alert if user is not a facebook user', (done) => {
//       var response = new Response(new ResponseOptions({status: 403}))
//       spyOn(facebookService, 'checkToken').and.returnValue(Observable.fromPromise(Promise.resolve(response)))
//       spyOn(mockNavController, 'present')
//
//       landingPage.fbConnect(auth)
//
//       setTimeout(() => {
//         expect(mockNavController.present).toHaveBeenCalledTimes(1)
//         done();
//       }, 100)
//     })
//   })
// })

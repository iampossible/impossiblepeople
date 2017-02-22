import {provide, Type, ReflectiveInjector} from '@angular/core';
import {BaseRequestOptions} from '@angular/http'
import {MockBackend} from '@angular/http/testing'
import {ComponentFixture, TestComponentBuilder} from '@angular/compiler/testing';
import {inject, async, setBaseTestProviders} from '@angular/core/testing';
import {disableDeprecatedForms, provideForms, FormControl} from '@angular/forms';
import {
  App,
  Config,
  Form,
  NavController,
  Platform,
  Icon,
  Button,
  Events,
  ModalController,
  AlertController,
  ActionSheetController
} from 'ionic-angular';
import {InterceptedHttp} from '../app/services/api/InterceptedHttp'
import {MockIonic} from './mocks/MockIonic'
import {MockNavController} from './mocks/MockNavController'
import 'zone.js/dist/async-test';
import {
  TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
} from '@angular/platform-browser-dynamic/testing';
import {MockComponent} from './mocks/MockComponent'
setBaseTestProviders(
  TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
);

export let promiseCatchHandler = (err: Error): void => {
  console.error('ERROR - An error has occurred inside a promise! ' + err);
  setTimeout(function (): void {
    throw err;
  });
}

export class TestUtils {

  // http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
  public static eventFire(el: any, etype: string): void {
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      let evObj: any = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }
}

//TODO: UPDATE CUSTOM PROVIDERS
export let defaultProviders: Array<any> = [
    disableDeprecatedForms(),
    provideForms(),
    Events,
    Form,
    TestComponentBuilder,
    { provide: ActionSheetController, useClass: MockIonic },
    { provide: AlertController, useClass: MockIonic },
    { provide: ModalController, useClass: MockIonic },
    { provide: Icon, useClass: MockComponent },
    { provide: Button, useClass: MockComponent },
    { provide: Config, useClass: MockIonic },
    { provide: App, useClass: MockIonic },
    { provide: NavController, useClass: MockNavController },
    { provide: Platform, useClass: MockIonic }
  ]
  ;

export let defaultServiceProviders: Array<any> = [
  MockBackend,
  BaseRequestOptions,
  Events,
  {
    provide: InterceptedHttp,
    useFactory: (backend, options, events) => {
      return new InterceptedHttp(backend, options, events)
    },
    deps: [MockBackend, BaseRequestOptions, Events]
  },

];

export let injectAsync: Function = ((callback) => async(inject([TestComponentBuilder], callback)));
export let injectService: Function = ((Service, callback) => (done) => {
  let injector = ReflectiveInjector.resolveAndCreate(defaultServiceProviders)
  let mockBackend = injector.get(MockBackend)
  let http = injector.get(InterceptedHttp)
  let events = injector.get(Events)
  if (Service) { //asking for a service
    let service = new Service(http)
    callback(service, mockBackend, http, events)
  } else { //or basic http mock
    callback(events, mockBackend, http)
  }

  done()
})

// export let injectService: Function = ((serviceArray: Array<any>, callback) => async(inject(serviceArray, () => {
//   ReflectiveInjector.resolveAndCreate(serviceArray, callback)
// })));

export let testBootstrap: Function = ((component, testSpec, detectChanges, beforeEachFn) => {
  return ((tcb: TestComponentBuilder) => {
    return tcb
      .createAsync(component)
      .then((fixture: ComponentFixture<Type>) => {
        testSpec.fixture = fixture;
        testSpec.element = fixture.nativeElement;
        testSpec.instance = fixture.componentInstance;
        testSpec.instance.control = new FormControl('');
        if (beforeEachFn) beforeEachFn(testSpec);
        if (detectChanges) fixture.detectChanges();
      })
      .catch(promiseCatchHandler);
  });
});

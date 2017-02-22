/*
import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {TESTING_THIS_CLASS} from './TESTING_THIS_CLASS'

let testProviders: Array<any> = [
  { provide: TESTING_THIS_CLASS, useClass: TESTING_THIS_CLASS },
];

describe('Button Dropdown component', () => {

  //custom vars here

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(TESTING_THIS_CLASS, this, true, () => {
    // custom callback
    // this.fixture
    // this.element
    // this.instance

    this.something = () => {} //custom helper method
  })));

  it('shoulddo something', () => {
    this.something()
  })
})


TODO:
 src/app/modals/SelectContactsModal/SelectContactsModal.spec.ts
 src/app/pages/LandingPage/LandingPage.spec.ts
 src/app/pages/PostDetailPage/PostDetailsPage.spec.ts
 src/app/pages/ProfilePage/SettingsPage/FindFriendsPage/FindFriends.spec.ts
*/

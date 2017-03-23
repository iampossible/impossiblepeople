import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {PostCard} from './PostCard'
import {MockIonic, MockComponent} from '../../../testing/mocks/Mocks'
import {PostService} from '../../services/api/PostService'

let testProviders: Array<any> = [
  { provide: PostService, useClass: MockIonic },
];

describe('Post-card component', () => {

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(PostCard, this, true, () => {
    this.instance.post = {
      "postID": "c129b610",
      "postType": "ASKS",
      "content": "which way i ought to go?",
      "timeRequired": 0,
      "location": "Wonderland",
      "createdAt": 1459410000,
      "createdAtSince": "46yr",
      "commentCount": 3,
      "author": {
        "userID": "47c2f0c20e07",
        "username": "Alice Liddell",
        "imageSource": "http://www.fillmurray.com/100/100",
      },
      "category": {
        "interestID": "SOMEHASH",
        "name": "Food"
      }
    }
  })));

  it('should render title, author and time', () => {
    expect(this.element.querySelector('.post-title').innerText).toBe('Ask: "which way i ought to go?"')
    expect(this.element.querySelector('.post-type').innerText).toBe('Ask: ')
    expect(this.element.querySelector('.post-created-at').innerText).toContain('yr')
    expect(this.element.querySelector('.post-creator').innerText.trim()).toBe('Alice Liddell')
    expect(this.element.querySelector('.post-location').innerText.trim()).toBe('Wonderland')
    expect(this.element.querySelector('.post-category-name').innerText.trim()).toBe('FOOD')
    expect(this.element.querySelector('.post-comment-count').innerText.trim()).toBe('3')
  })

  it('should fire event when tapping on title', () => {
    spyOn(this.instance, 'openPost').and.callThrough()
    this.element.querySelector('.post-title').click()

    expect(this.instance.openPost).toHaveBeenCalledWith(jasmine.anything(), 'c129b610')
  })

  it('should fire event when tapping on author name', () => {
    spyOn(this.instance, 'goToProfile').and.callThrough()
    spyOn(this.instance, 'openPost').and.callThrough()
    this.element.querySelector('.post-author-name').click()

    expect(this.instance.goToProfile).toHaveBeenCalledWith(jasmine.anything(), '47c2f0c20e07')
    expect(this.instance.openPost).not.toHaveBeenCalled()
  })

  it('should fire event when tapping on author photo', () => {
    spyOn(this.instance, 'goToProfile').and.callThrough()
    spyOn(this.instance, 'openPost').and.callThrough()
    this.element.querySelector('.post-author-photo').click()

    expect(this.instance.goToProfile).toHaveBeenCalledWith(jasmine.anything(), '47c2f0c20e07')
    expect(this.instance.openPost).not.toHaveBeenCalled()
  })

  it('should render a single common friend', () => {
    this.instance.post.author = Object.assign(this.instance.post.author, {
      commonFriends: [{
        userID: 'SOMEID',
        username: 'Fill Murray',
        imageSource: 'http://www.fillmurray.com/100/100',
      }]
    });

    this.fixture.detectChanges()

    expect(this.element.querySelector('.post-author-relationship').innerText.trim().toLowerCase()).toBe('friends with fill murray')
  })

  it('should not fire an event when tapping on common friends', () => {
    this.instance.post.author = Object.assign(this.instance.post.author, {
      commonFriends: [{
        userID: 'SOMEID',
        username: 'Fill Murray',
        imageSource: 'http://www.fillmurray.com/100/100',
      }]
    });
    this.fixture.detectChanges();
    spyOn(this.instance, 'goToProfile').and.callThrough()
    spyOn(this.instance, 'openPost').and.callThrough()
    spyOn(this.instance, 'noOp').and.callThrough()

    this.element.querySelector('.post-author-relationship').click()

    expect(this.instance.goToProfile).not.toHaveBeenCalled()
    expect(this.instance.openPost).not.toHaveBeenCalled()
    expect(this.instance.noOp).toHaveBeenCalledWith(jasmine.anything())
  })

  it('should render category image if provided', () => {
    expect(this.element.querySelector('.post-category-image')).toBeFalsy();

    this.instance.post.category = Object.assign(this.instance.post.category, {
      'image': 'build/images/interests/artdesign.png',
    });

    this.fixture.detectChanges()

    expect(this.element.querySelector('.post-category-image')).toBeTruthy();
    expect(this.element.querySelector('.post-category-image').getAttribute('src')).toBe('build/images/interests/artdesign.png');
  })

  it('should not display post options when edit mode is deactivated', () => {
    this.instance.isMyPost = false;
    this.fixture.detectChanges()

    expect(this.element.querySelector('.post-options.public')).toBeDefined()
    expect(this.element.querySelector('.post-options.private')).toBeNull()
  })

  it('should display post options when edit mode is activated', () => {
    this.instance.isMyPost = true;
    this.fixture.detectChanges()

    expect(this.element.querySelector('.post-options.public')).toBeNull()
    expect(this.element.querySelector('.post-options.private')).toBeDefined()
  })

  it('should open post options when tapping on post options icon', () => {
    spyOn(this.instance, 'openOptions').and.callThrough()
    this.instance.isMyPost = true;
    this.fixture.detectChanges()

    this.element.querySelector('.post-options').click()

    expect(this.instance.openOptions).toHaveBeenCalled()
  })

  it('should not show time if post is resolved', () => {
    this.instance.post.resolved = true;

    this.fixture.detectChanges()

    expect(this.element.querySelector('.post-created-at')).toBeNull()
  })
})
//
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
// import {PostCard} from './PostCard'
// import {MockNavController} from '../../../testing/mocks/MockNavController'
// import {PostService} from '../../services/api/PostService'
//
// describe('Post-card component', () => {
//
//   let this.fixture, this.element, this.instance
//
//   beforeEachProviders(() => [
//     provide(NavController, {useClass: MockNavController}),
//     provide(PostService, {useClass: MockIonic}),
//     Events,
//     provide(Config, {useClass: MockIonic})
//   ])
//
//   beforeEach(injectAsync([TestComponentBuilder], (tcb:TestComponentBuilder) => {
//     return tcb
//       .overrideDirective(PostCard, Icon, MockComponent)
//       .overrideDirective(PostCard, Item, MockComponent)
//       .overrideDirective(PostCard, Button, MockComponent)
//       .createAsync(PostCard)
//       .then((componentFixture:ComponentFixture) => {
//         this.fixture = componentFixture
//         this.element = componentFixture.nativeElement
//         this.instance = componentFixture.componentInstance
//
//         this.instance.post = {
//           "postID": "c129b610",
//           "postType": "ASKS",
//           "content": "which way i ought to go?",
//           "timeRequired": 0,
//           "location": "Wonderland",
//           "createdAt": 1459410000,
//           "createdAtSince": "46yr",
//           "commentCount": 3,
//           "author": {
//             "userID": "47c2f0c20e07",
//             "username": "Alice Liddell",
//             "imageSource": "http://www.fillmurray.com/100/100",
//           },
//           "category": {
//             "interestID": "SOMEHASH",
//             "name": "Food"
//           }
//         }
//
//         this.fixture.detectChanges()
//       })
//       .catch((e) => {
//         console.error('Error fetching artifacts', e)
//       })
//   }))
//
//  
//
//   //TODO test isMyPost
//
// })

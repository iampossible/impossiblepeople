import { Events, Tabs, AlertController } from 'ionic-angular'
import { FeedService, UserService } from '../../../services/api/ApiService'
import { ScrollTopService } from '../../../services/ScrollTopService'
import { PostCard } from '../../../components/Components'
import { Component, ElementRef } from '@angular/core'
import { Response } from '@angular/http'
import { Alert, NavController, ModalController } from 'ionic-angular/index'

@Component({
  templateUrl: 'build/pages/MainPage/FeedTab/FeedTab.html',
  directives: [PostCard]
})
export class FeedTab {

  public isScrolling: Boolean = false
  public scrollElement: Element
  public feed: Array<Object> = []
  public showIntro: Boolean = false
  public showBanner: Boolean = false
  private isDay
  private introSeen
  private topBannerSeen
  private user: any = {
    interests: [],
    posts: [],
  }

  constructor(private feedService: FeedService,
    private events: Events,
    private myElement: ElementRef,
    private userService: UserService,
    private alertCtrl: AlertController,
    private nav: NavController) {
    this.events.subscribe('user:updated', () => {
      this.getFeed()
      this.isScrolling = false
    })

    this.events.subscribe('user:posts:updated', () => {
      this.getFeed()
      this.isScrolling = false
    })

    this.events.subscribe('user:updated', () => {
      this.getFeed()
      this.isScrolling = false
    })

    this.events.subscribe('CreatePostTab:close', () => {
      this.getFeed()
      this.dismissIntroScreen()
      this.onPageWillLeave()
      this.onPageWillEnter()
    })

    this.introSeen = window.localStorage.getItem('introSeen')
    this.topBannerSeen = window.localStorage.getItem('topBannerSeen')
    if (this.introSeen !== 'true') {
      this.showIntroductionScreen()
    }
    if (this.topBannerSeen !== 'true') {
      this.showTopBanner()
    }
  }

  private _getScrollElement(elem: ElementRef): Element {
    let nodeList: NodeListOf<Element> = elem.nativeElement.getElementsByTagName('scroll-content')
    let elementList: Array<Element>
    elementList = Array.prototype.slice.call(nodeList)
    return elementList.shift()
  }

  // TODO: add smooth scrolling
  private _fireScrollTop = () => {
    if (!this.isScrolling) { //scroll the element top
      this.scrollElement = this._getScrollElement(this.myElement)
      this.isScrolling = true
      ScrollTopService.scrollTop(<HTMLElement>this.scrollElement).then(() => {
        this.getFeed()
        this.isScrolling = false
      }).catch(() => {
        this.isScrolling = false
      })
    }
  }

  onPageLoaded() {
    this.getFeed()
  }

  onPageWillLeave() {
    const tab00 = document.getElementById('tab-0-0')
    if (tab00) {
      tab00.removeEventListener('click', this._fireScrollTop)
    }
    window.localStorage.setItem('topBannerSeen', 'true')
    this.showBanner = false
  }

  onPageWillEnter() {
    this.getUserDetails()
    const tab00 = document.getElementById('tab-0-0')
    if (tab00) {
      tab00.addEventListener('click', this._fireScrollTop)
    }
  }

  getUserDetails() {
    this.userService
      .getCurrentUser()
      .subscribe(
      (response: Response) => this.user = response.json(),
      () => {
        let failAlert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: 'Failed to fetch user details',
          buttons: ['OK']
        })
        failAlert.present()
      }
      )
  }

  openProfile() {
    const tabs: Tabs = this.nav.parent
    tabs.select(3)
    window.localStorage.setItem('topBannerSeen', 'true')
    this.showBanner = false
  }

  showIntroductionScreen() {
    this.showIntro = true
  }

  showTopBanner() {
    this.showBanner = true
  }

  dismissIntroScreen() {
    this.showIntro = false
    const introScreen = document.getElementById('home-intro-state');
    if (introScreen) {
      introScreen.style.display = 'none';
    }
    window.localStorage.setItem('introSeen', 'true')
  }

  getFeed(event?) {
    let date: Date = new Date(Date.now())
    let hours = date.getHours()
    this.isDay = (hours > 6) && (hours < 19)
    this.feedService.getFeed(response => {
      this.feed = response.json()
      if (event) {
        event.complete()
      }
    })
  }

  public released(event) {
    this.getFeed(event)
  }

  public openModal() {
    const tabs: Tabs = this.nav.parent
    tabs.select(1)
    window.localStorage.setItem('topBannerSeen', 'true')
    this.showBanner = false
  }
}

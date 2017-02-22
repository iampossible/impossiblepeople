import {NavController, NavParams} from 'ionic-angular/index'
import {InterestsPage, MainPage} from '../../pages/Pages'
import {PostDetailPage} from '../../pages/PostDetailPage/PostDetailPage'
import {ProfilePage} from '../../pages/ProfilePage/ProfilePage'
import {AddLocationContextPage} from '../../pages/User/AddLocationContextPage/AddLocationContextPage';

export class NavigationService {

  public static nextOnboardingPage(user:any):any {
    if (!user.interests || !user.interests.length) {
      return InterestsPage
    } else if (!user.location) {
      return AddLocationContextPage
    }
    return MainPage
  }

  /**
   * Push a new Post Page onto the navigation stack, or if page is already part of the stack it pops back to it.
   * @param nav NavController containing the navigation stack
   * @param postID postID the post page to be opened
   */
  public static openPost(nav:NavController, postID:number) {
    let lastPage = NavigationService.getPreviousPage(nav)
    if (lastPage) {
      let params = lastPage.getNavParams()
      if (NavigationService.getNavParamProperty(params, 'postID') == postID) {
        nav.pop()
        return
      }
    }

    nav.push(PostDetailPage, {postID: postID})
  }

  /**
   * Push a new Profile Page onto the navigation stack, or if page is already part of the stack it pops back to it.
   * @param nav NavController containing the navigation stack
   * @param userID userID the post page to be opened
   */
  public static openProfile(nav:NavController, userID:string) {
    if (nav.getActive()) {
      let params = nav.getActive().getNavParams()
      if (NavigationService.getNavParamProperty(params, 'userID') == userID) return
    }

    let lastPage = NavigationService.getPreviousPage(nav)

    if (lastPage) {
      let params = lastPage.getNavParams()
      if (NavigationService.getNavParamProperty(params, 'userID') == userID) {
        nav.pop()
        return
      }
    }

    nav.push(ProfilePage, {userID: userID})
  }

  private static getPreviousPage(nav:NavController) {
    return nav.getPrevious(nav.getActive())
  }

  private static getNavParamProperty(params:NavParams, property:string) {
    if (params.data && params.data[property]) {
      return params.data[property]
    } else {
      return null;
    }
  }

  public static goToProfile(nav:NavController, event:Event, userID:string) {
    event.stopPropagation()
    this.openProfile(nav, userID)
  }
}

import {NavigatorHelper} from './NavigatorHelper'

export class LandingPageNavigator {

  public static goToLandingPage() {
    return NavigatorHelper.goToPath('', by.css('.landing button.button-stable'))
  }

}
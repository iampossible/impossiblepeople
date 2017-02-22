import {NavigationService} from './NavigationService'

import {InterestsPage, MainPage} from '../../pages/Pages';
import {AddLocationContextPage} from '../../pages/User/AddLocationContextPage/AddLocationContextPage';

describe('NavigationService', () => {
  describe('nextOnboardingPage method', () => {
    it('should return MainPage when user has interests and location', () => {
      let completeUser = { interests: [null], location: 'somewhere' }
      expect(NavigationService.nextOnboardingPage(completeUser)).toBe(MainPage)
    });

    it('should return AddLocationContextPage when user has interests but no location', () => {
      let result = NavigationService.nextOnboardingPage({ interests: [null] })
      expect(result).toBe(AddLocationContextPage)
    });

    it('should return InterestsPage when user has no interests', () => {
      expect(NavigationService.nextOnboardingPage({})).toBe(InterestsPage)
    });
  });
});

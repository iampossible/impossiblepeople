import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {InterestPicker} from './InterestPicker'
import {InterestService} from '../../services/api/InterestService'

describe('Interest-picker component', () => {

  describe('basic functionality', () => {

    let testProviders: Array<any> = [
      { provide: InterestService, useValue: {
        getFeaturedInterests: (s) => s({json: () => [
          { 'interestID': 'A1', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B2', 'name': 'InterestB', 'featured': true, 'suggested': false },
          { 'interestID': 'C3', 'name': 'InterestC', 'featured': true, 'suggested': false },
          { 'interestID': 'D4', 'name': 'InterestD', 'featured': true, 'suggested': false },
        ]})
      }},
    ];

    beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
    beforeEach(injectAsync(testBootstrap(InterestPicker, this, true, () => {
      this.interests = (() => this.element.querySelectorAll('.featured-interest'))
      this.interest = ((index: number) => this.interests()[index])
      this.interestsNotSelected = (() => this.element.querySelectorAll('.not-selected'))
    })));

    it('should display all interests', () => {
      expect(this.interests().length).toBe(4)
    })

    it('should display all interests', () => {
      expect(this.interests().length).toBe(4)
    })

    it('should toggle the selected state of an interest', () => {
      this.interest(0).click()
      this.fixture.detectChanges()

      expect(this.interest(0).classList).not.toContain('not-selected')

      this.interest(0).click()
      this.fixture.detectChanges()

      expect(this.interest(0).classList).toContain('not-selected')
    })

    it('should select two interests on multiple mode', () => {
      this.interest(0).click()
      this.interest(1).click()
      this.fixture.detectChanges()

      expect(this.interest(0).classList).not.toContain('not-selected')
      expect(this.interest(1).classList).not.toContain('not-selected')
    })

    it('should not select interests which haven\'t been clicked on', ()=> {
      this.interest(0).click()
      this.interest(1).click()
      this.fixture.detectChanges()

      expect(this.interestsNotSelected().length).toBe(this.interests().length - 2)
    })

    it('should select only one interest on single mode', () => {
      this.instance.isSingleMode = true;

      this.interest(0).click()
      this.interest(1).click()
      this.fixture.detectChanges()

      expect(this.interest(1).classList).not.toContain('not-selected')
      expect(this.interestsNotSelected().length).toBe(this.interests().length - 1)
    })

    it('should show "Suggest something..." button if suggestion enabled', () => {
      this.instance.canSuggest = true;
      this.fixture.detectChanges()

      expect(this.element.querySelector('.suggest-interest')).toBeTruthy()
    })

    it('should not show "Suggest something..." button if suggestion disabled', () => {
      this.instance.canSuggest = false;
      this.fixture.detectChanges()

      expect(this.element.querySelector('.suggest-interest')).toBeNull()
    })

    it('should show default interests as selected', () => {
      this.instance.ngOnChanges({
        'defaultInterests': {
          currentValue: ['A1', 'B2']
        }
      })
      this.fixture.detectChanges()

      expect(this.interest(0).classList).not.toContain('not-selected')
      expect(this.interest(1).classList).not.toContain('not-selected')
      expect(this.interestsNotSelected().length).toBe(this.interests().length - 2)
    })

    it('should emit an event on initialisation containing all the selected interests', () => {
      spyOn(this.instance.selected, 'emit').and.callThrough()
      this.instance.ngOnInit()
      expect(this.instance.selected.emit).toHaveBeenCalledTimes(1)
      expect(this.instance.selected.emit).toHaveBeenCalledWith([])
    })

    it('should emit an event on select containing all the selected interests', () => {
      spyOn(this.instance.selected, 'emit').and.callThrough()

      this.interest(0).click()
      this.fixture.detectChanges()

      expect(this.instance.selected.emit).toHaveBeenCalledTimes(1)
      expect(this.instance.selected.emit).toHaveBeenCalledWith([{
        'interestID': 'A1',
        'name': 'InterestA',
        'featured': true,
        'suggested': false
      }])
    })
  })

  describe('pagination functionality', () => {
    let testProviders: Array<any> = [
      { provide: InterestService, useValue: {
        getFeaturedInterests: (s) => s({json: () => [
          { 'interestID': 'A1', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A2', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A3', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A4', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A5', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A6', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A7', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A8', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A9', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'A0', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B1', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B2', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B3', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B4', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B5', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B6', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B7', 'name': 'InterestA', 'featured': true, 'suggested': false },
          { 'interestID': 'B8', 'name': 'InterestA', 'featured': true, 'suggested': false },
        ]})
      }},
    ];


    beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
    beforeEach(injectAsync(testBootstrap(InterestPicker, this, true, () => {
      this.interests = (() => this.element.querySelectorAll('.featured-interest'))
      this.interest = ((index: number) => this.interests()[index])
      this.interestsNotSelected = (() => this.element.querySelectorAll('.not-selected'))
    })));

    it('should paginate the interests', () => {
      expect(this.element.querySelectorAll('ion-slide').length).toBe(2);
    })

    it('should show suggestion block button on last page', () => {
      this.instance.canSuggest = true
      this.fixture.detectChanges()

      let slides = this.element.querySelectorAll('ion-slide')
      expect(slides[0].querySelector('.suggestion-block')).toBeFalsy()
      expect(slides[1].querySelector('.suggestion-block')).toBeTruthy()
    })

  })

})

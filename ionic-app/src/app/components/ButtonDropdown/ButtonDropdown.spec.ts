import {addProviders} from '@angular/core/testing'
import {testBootstrap, injectAsync, defaultProviders} from '../../../testing/Utils'
import {ButtonDropdown} from './ButtonDropdown'

let testProviders: Array<any> = [
  //custom providers
];

describe('Button Dropdown component', () => {

  let wrapperClass: string = '.dropdown-values'
  let optionClass: string = '.dropdown-value'
  let optionSelector: string = `${wrapperClass} ${optionClass}`

  beforeEach(() => addProviders(defaultProviders.concat(testProviders)));
  beforeEach(injectAsync(testBootstrap(ButtonDropdown, this, true, () => {

    this.toggleDropdown = () => {
      this.element.querySelector('.dropdown-button').click()
      this.fixture.detectChanges()
    }
    this.selectFirstOption = () => {
      this.element.querySelectorAll(optionSelector)[0].click()
      this.fixture.detectChanges()
    }

    this.instance.data = {
      label: 'How much time can you give?',
      values: [{
        text: '1 Hour',
        optionValue: '1'
      }, {
        text: 'Half a day',
        optionValue: '2'
      }, {
        text: 'To be determined',
        optionValue: '3'
      }]
    }
  })));

  it('should be collapsed on default', () => {
    expect(this.element.querySelectorAll(optionSelector).length).toBe(0)
  })

  it('should display label as the dropdown button text', () => {
    expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe('How much time can you give?')
  })

  it('should display label as the dropdown button text after data has changed', () => {
    this.instance.data.label = 'How much time do you require?'

    this.fixture.detectChanges()

    expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe("How much time do you require?")
  })

  it('should display options after expanding the dropdown', () => {
    this.toggleDropdown()

    expect(this.element.querySelectorAll(optionSelector).length).toBe(3)
  })

  describe('when expanded', () => {

    beforeEach(() => {
      this.toggleDropdown()
    })

    it('should display label as the dropdown button text', () => {
      expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe("How much time can you give?")
    })

    it('should collapse if dropdown button is pressed', () => {
      this.toggleDropdown()

      expect(this.element.querySelectorAll(optionSelector).length).toBe(0)
    })

    it('should render the provided options', () => {
      expect(this.element.querySelectorAll(optionSelector)[0].innerText.trim()).toBe('1 Hour')
      expect(this.element.querySelectorAll(optionSelector)[1].innerText.trim()).toBe('Half a day')
      expect(this.element.querySelectorAll(optionSelector)[2].innerText.trim()).toBe('To be determined')
    })

    describe('and an option was selected', () => {

      beforeEach(() => {
        this.selectFirstOption()
      })

      it('should collapse if any option is selected', () => {
        expect(this.element.querySelectorAll(optionSelector).length).toBe(0)
      })

      it('should change the text on the dropdown button to the text of the selected option', () => {
        expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe('1 Hour')
      })

    })

  })

  describe('user scenarios', () => {

    it('should remember what a user has selected when they re-expand and collapse ', () => {
      this.toggleDropdown()
      this.selectFirstOption()
      this.toggleDropdown()

      expect(this.element.querySelectorAll(optionSelector)[0].className).toContain('active')

      this.toggleDropdown()

      expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe('1 Hour')
    })

    it('should retain label text if expanded and collapsed without ever selecting', () => {
      this.toggleDropdown()
      this.toggleDropdown()

      expect(this.element.querySelector('.dropdown-button').innerText.trim()).toBe("How much time can you give?")
    })

  })

})

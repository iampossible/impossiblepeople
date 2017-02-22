import {Component, Input, Output, EventEmitter} from '@angular/core'
import {Button, Icon} from 'ionic-angular'

@Component({
  templateUrl: 'build/components/ButtonDropdown/ButtonDropdown.html',
  selector: 'button-dropdown',
  inputs: ['data'],
  directives: [Button, Icon],
})
export class ButtonDropdown {

  @Input() data;
  @Output() selected = new EventEmitter()

  public selectedOption: any
  public isExpanded: boolean = false
  private originalTitle

  constructor() {

  }

  ngOnInit() {
    this.originalTitle = this.data.label
  }

  toggleDropdown() {
    this.isExpanded = !this.isExpanded

    if (this.isExpanded) {
      this.data.label = this.originalTitle
      return
    }

    if (this.selectedOption) {
      this.data.label = this.selectedOption.text
    }

  }

  public selectOption(option) {
    this.selectedOption = option
    this.selected.emit(option)

    this.data.label = option.text
    this.toggleDropdown()
  }

}

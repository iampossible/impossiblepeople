import {Directive, ElementRef, Input} from '@angular/core';
import {Keyboard} from 'ionic-native'

@Directive({
  selector: '[keyboardAttach]'
})
export class KeyboardAttachDirective {

  @Input('keyboardAttach') bottomOffset: number

  constructor(el: ElementRef) {
    el.nativeElement.style.bottom = '0'

    Keyboard.onKeyboardHide().subscribe(() => {
      el.nativeElement.style.bottom = '0'
    })

    Keyboard.onKeyboardShow().subscribe((data) => {
      el.nativeElement.style.bottom = `${data.keyboardHeight - this.bottomOffset}px`
    })
  }
}

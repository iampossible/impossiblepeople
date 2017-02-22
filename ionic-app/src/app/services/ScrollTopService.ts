import {Injectable} from '@angular/core'

@Injectable()
/**
 *
 * @docs https://coderwall.com/p/hujlhg/smooth-scrolling-without-jquery
 */
export class ScrollTopService {

  static stepFunction(start, end, point) {
    if (point <= start) return 0
    if (point >= end) return 1

    let x = (point - start) / (end - start)
    return x * x * (3 - 2 * x)
  }

  static scrollTop(element: HTMLElement, anim_duration?: number): Promise<Element> {

    //disable (interrupt) smooth and elastic scrolls
    element.style.overflow = 'hidden';

    const target = 0
    let duration = anim_duration || 666

    const _time_start: number = Date.now()
    const _time_end: number = _time_start + duration

    const scrollFrom: number = element.scrollTop
    const scrollDistance: number = target - scrollFrom

    if (scrollDistance < 500) {
      duration = 333
    }

    if (element.scrollTop === 0) { //im on top, don't bother
      element.style.overflow = null;
      return Promise.resolve(element)
    }

    return new Promise((accept, reject): void => {
      let scrollPreviousTop: number = element.scrollTop
      let scroll_frame: Function = () => {
        if (element.scrollTop != scrollPreviousTop) {
          element.style.overflow = null;
          reject("E_SCROLL_INTERRUPTED")
          return;
        }

        let _time_now = Date.now()
        let step = ScrollTopService.stepFunction(_time_start, _time_end, _time_now)
        let frameTop = Math.round(scrollFrom + (scrollDistance * step))
        element.scrollTop = frameTop

        if (_time_now >= _time_end) {
          element.style.overflow = null;
          accept(element)
          return;
        }

        if (element.scrollTop === scrollPreviousTop && element.scrollTop !== frameTop) {
          element.style.overflow = null;
          accept(element)
          return
        }

        scrollPreviousTop = element.scrollTop

        setTimeout(scroll_frame, 0)
      }

      setTimeout(scroll_frame, 0)

    })
  }

}

import {NavParams} from 'ionic-angular/index'

export class MockNavController {
  public pop(): any {
    return new Promise(function (resolve: Function): void {
      resolve();
    });
  }

  public push(): any {
    return new Promise(function (resolve: Function): void {
      resolve();
    });
  }

  public getActive(): any {
    return {
      getNavParams: () => new NavParams(),
      instance: {
        model: 'something',
      },
    };
  }

  public setRoot(): any {
    return true;
  }

  getPrevious() {
  }

}

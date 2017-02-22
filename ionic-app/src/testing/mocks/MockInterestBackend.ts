export class MockInterestBackend {

  constructor(private response:any) {
  }

  public _backend = {}
  public get() {
    return {
      subscribe: (cb) => {
        cb({
          json: () => this.response
        })
      }
    }
  }
}
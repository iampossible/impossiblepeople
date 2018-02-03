// TODO CRITICAL - script this out of here

export namespace Environment {
  export const version: string = '0.0.1';
  export const ENV: string = 'prod';
  // lint errors around here
  export const HOST: string = 'https://prod.gnome.impossible.com:3232';
  export const TESTFAIRY: string = '';
  export const HEAP: string = '585446442';
  export const SENDERID: string = '257227398283';
  export const GOOGLEAPIKEY: string = 'AIzaSyBUPga2E56tLVd-pO8HuS59_ryP1vaPx28';
}


declare interface Environment {
  ENV: string;
  HEAP: string;
  HOST: string;
  version: string;
  SENDERID: string;
}

// TODO CRITICAL - script this out of here

export namespace Environment {
  export const version: string = '0.0.1';
  export const ENV: string = 'dev';
  // lint errors around here
  export const HOST: string = '';
  export const TESTFAIRY: string = '';
  export const HEAP: string = '';
  export const SENDERID: string = '';

}


declare interface Environment {
  ENV: string;
  HEAP: string;
  HOST: string;
  version: string;
  SENDERID: string;
}

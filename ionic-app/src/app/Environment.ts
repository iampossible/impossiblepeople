/*
  This file is auto-populated by gulp.
  For production this code will be swapped out with /config-prod.js.
*/

export module Environment {
  // inject: ../../config/environment-/* @echo GNOME_ENV */.ts
  export const version:string = '$$PKG_VERSION$$'
  export const ENV:string = '/* @echo GNOME_ENV */'
  // lint errors around here
  // export const SENDERID:string = ''
  // export const HEAP:string = ''
  // export const HOST:string = ''
}

declare interface Environment {
  ENV:string
  HEAP: string
  HOST: string
  version:string
  SENDERID: string
}

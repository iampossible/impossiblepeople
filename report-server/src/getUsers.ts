import * as fs from 'fs';
import * as seraph from 'seraph';

import * as config from './config/config';

/*
    adapted from http://eddmann.com/posts/promisifying-error-first-asynchronous-callbacks-in-javascript/
*/
const promisify = (func: Function, ...args: any[]) =>
  new Promise((resolve: Function, reject: Function) =>
    func(...args, (err: undefined | any, value: any) =>
      (err ? reject(err) : resolve(value))
    )
  )

const touch = (path: string) => {
  return promisify(fs.open, path, "w")
    .then((fd) => promisify(fs.close, fd))
}

let db: any = seraph({
  server: config.neo4j.host,
  user: config.neo4j.user,
  pass: config.neo4j.pass,
})

console.time('Gather user ids for reports')
promisify(db.query, 'MATCH (p:Person) WHERE not p.mailUnsubscribe or p.mailUnsubscribe is NULL return p.userID as userID;')
  .then((data: { userID: string }[]) => {
    if (config.logging) {
      console.log('Found ', data.length, ' users')
    }
    for (let user of data) {
      if (config.logging) {
        console.log('Found user', user.userID)
      }
      touch(`${config.workdir}/reports/unprocessed/${user.userID}`)
        .catch((err) => {
          console.error(`Failed to add ${user.userID} to unprocessed queue: ${err}`)
        })
    }
    console.timeEnd('Gather user ids for reports')
  }).catch(console.error)


const fs = require('fs')
const seraph = require('seraph')

const config = require('./config/config')

/*
    adapted from http://eddmann.com/posts/promisifying-error-first-asynchronous-callbacks-in-javascript/
*/
const promisify = (func, ...args) =>
  new Promise((resolve, reject) =>
    func(...args, (err, value) =>
      err ? reject(err) : resolve(value)
    )
  )

const touch = (path) => {
  return promisify(fs.open, path, "w")
    .then((fd) => fs.close(fd))
}

let db = seraph({
  server: config.neo4j.host,
  user: config.neo4j.user,
  pass: config.neo4j.pass,
})

console.time('Gather user ids for reports')
promisify(db.query, 'MATCH (p:Person) WHERE p.password <> "" return extract(n IN collect(p)| n.userID) AS extracted')
  .then((data) => {
    for (let user of data[0]) {
      if (config.logging) {
        console.log(`Found user ${user})`)
      }
      touch(`${config.workdir}/reports/unprocessed/${user}`)
        .catch((err) => {
          console.error(`Failed to add ${user} to unprocessed queue: ${err}`)
        })
    }
    console.timeEnd('Gather user ids for reports')
  }).catch(console.error)


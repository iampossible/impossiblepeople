const fs = require('fs')
const mu = require('mu2')
const nodemailer = require('nodemailer')
const seraph = require('seraph')

const config = require('./config/config')

/*
    adapted from http://eddmann.com/posts/promisifying-error-first-asynchronous-callbacks-in-javascript/
*/
const promisify = (func, ...args) =>
  new Promise((resolve, reject) =>
    func(...args, (err, value) =>
      (err ? reject(err) : resolve(value))
    )
  )

const touch = (path) =>
  promisify(fs.open, path, 'w')
    .then((fd) => fs.close(fd))

const db = seraph({
  server: config.neo4j.host,
  user: config.neo4j.user,
  pass: config.neo4j.pass,
})

mu.root = __dirname + '/../templates'

const maxDistance = 25  // km

const locationSearch = `(
  post.location = user.location 
  OR
  2 * 6371 * ASIN(SQRT(HAVERSIN(RADIANS(user.latitude - post.latitude)) + COS(RADIANS(user.latitude))* COS(RADIANS(post.latitude)) * HAVERSIN(RADIANS(user.longitude - post.longitude)))) < {maxDistance}
)`

const userQuery = (userID) => new Promise((resolve, reject) => {
  promisify(db.query, 'MATCH (p:Person {userID: {userID}}) RETURN p', { userID })
    .then((result) => resolve(result.pop()))
    .catch(reject)
})

const friendCount = (userID) => new Promise((resolve, reject) => {
  promisify(db.query, 'MATCH (:Person {userID: {userID}}) -[:FOLLOWS]-> (friend:Person)RETURN COUNT(DISTINCT friend) AS friendCount', { userID })
    .then((result) => resolve(result.pop().friendCount))
    .catch(reject)
})

const friendlessHighlights = (userID) => new Promise((resolve, reject) => {
  promisify(db.query, `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}})  
       WHERE NOT (user)-[:BLOCKED]-(creator)
         AND ( 
          creator = user 
          OR (${locationSearch} OR (user) -[:INTERESTED_IN]-> (category))
         ) 
          
       OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
       
       RETURN creator, rel, post, category,
          COUNT( DISTINCT comments) AS commentCount,
          [] AS commonFriends
          
       ORDER BY rel.at DESC`, { userID, maxDistance })
    .then(resolve)
    .catch(reject)
})

const friendfulHighlights = (userID) => new Promise((resolve, reject) => {
  promisify(db.query, `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}}),
             (user) -[:FOLLOWS]-> (friend:Person)
       WHERE NOT (user) -[:BLOCKED]- (creator)
         AND (
          creator = user 
          OR creator = friend       
          OR (user) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (creator) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (user)
          OR (${locationSearch} OR (user) -[:INTERESTED_IN]-> (category))
         ) 
            
       OPTIONAL MATCH (post)<-[comments:COMMENTS]-(commenter:Person)
            WHERE NOT (user) -[:BLOCKED]- (commenter)
        
       OPTIONAL MATCH (commonFriend:Person) -[:FOLLOWS]-> (friend_of_friend:Person) -[:FOLLOWS]-> (commonFriend) -[:FOLLOWS]-> (user) -[:FOLLOWS]-> (commonFriend) 
          WHERE creator = friend_of_friend
          AND NOT commonFriend:Invitee
      
        RETURN creator, rel, post, category, 
            creator.userID in COLLECT(friend.userID) as isFriend,
            COUNT( DISTINCT comments) AS commentCount, 
            COLLECT( DISTINCT commonFriend) AS commonFriends
        ORDER BY rel.at DESC`, { userID, maxDistance })
    .then(resolve)
    .catch(reject)
})

const mailReport = (user, htmlContent) =>
  new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: config.smtp.service,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    })
    let email = {
      from: config.smtp.from,
      to: user.email,
      subject: 'Weekly highlights',
      html: htmlContent
    }
    promisify(transporter.sendMail.bind(transporter), email)
      .then(resolve)
      .catch(reject)
  })

console.time(`Process ${config.workdir}/reports/unprocessed`)
promisify(fs.readdir, `${config.workdir}/reports/unprocessed`)
  .then((files) => {
    Promise.all(files.map((userID) =>
      new Promise((resolve, reject) => {
        let templateData = {}
        userQuery(userID)
          .then((userData) => {
            templateData.user = userData
            return friendCount(userID)
          })
          .then((count) => {
            templateData.friendCount = count
            let feedQuery = count > 0 ? friendfulHighlights : friendlessHighlights
            feedQuery(userID)
              .then((feedData) => {
                templateData.feed = feedData
                let htmlContent = ''
                mu.compileAndRender('userReport.html', templateData)
                  .on('data', (data) => {
                    htmlContent += data.toString()
                  })
                  .on('end', () => {
                    mailReport(templateData.user, htmlContent)
                      .then(() => {
                        resolve({ id: userID, failed: false })
                      })
                      .catch((err) => {
                        resolve({ id: userID, failed: true, error: err })
                      })
                  })
                  .on('error', (err) => {
                    resolve({ id: userID, failed: true, error: err })
                  })
              }).catch(reject)
          }).catch(reject)
      })
    )).then((allResults) => {
      let processed = {
        success: allResults.filter(x => !x.failed),
        failed: allResults.filter(x => x.failed)
      }
      for (let result of processed.success) {
        if (config.logging) {
          console.log(`Successfully sent report to ${result.id}`)
        }
        promisify(fs.unlink, `${config.workdir}/reports/unprocessed/${result.id}`)
          .catch(console.error)
      }
      for (let result of processed.failed) {
        if (/* TODO: move onto failed queue if permanent failure, ignore otherwise to retry */true) {
          if (config.logging) {
            console.log(`Failed to sent report to ${result.id}: ${result.error}`)
          }
          touch(`${config.workdir}/reports/failed/${result.id}`)
            .catch((err) => {
              console.error(`Failed to add ${result.id} to failed queue: ${err}`)
            })
          promisify(fs.unlink, `${config.workdir}/reports/unprocessed/${result.id}`)
            .catch(console.error)
        }
      }
      console.timeEnd(`Process ${config.workdir}/reports/unprocessed`)
    }).catch(console.error)
  }).catch(console.error)

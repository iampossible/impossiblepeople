import * as fs from 'fs';
import mu = require('mu2');
import * as nodemailer from 'nodemailer';
import * as seraph from 'seraph';
import * as inlineCss from 'inline-css';
import * as moment from 'moment';
import * as crypto from 'crypto';

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

const touch = (path: string) =>
  promisify(fs.open, path, 'w')
    .then((fd) => promisify(fs.close, fd))

const db = seraph({
  server: config.neo4j.host,
  user: config.neo4j.user,
  pass: config.neo4j.pass,
})

declare const __dirname: string;

mu.root = __dirname + '/../templates'

const unsubscribeDate = Date.now().valueOf();
const cipherAlgo = 'aes256';

const postMinimum = 1;
const postLimitPerType = 10;

const weekStart = moment().subtract(99, 'week').startOf('week');
const weekEnd = moment().subtract(0, 'week').endOf('week');

if (config.logging) {
  console.log('weekStart', weekStart.format('MMM. D YYYY'), weekStart.format('x'))
  console.log('weekEnd', weekEnd.format('MMM. D YYYY'), weekEnd.format('x'))
}

const nByN = (n: number) =>
  (l: any[]) =>
    l.reduce((accum: any[][], x: any) => {
      if (accum.length === 0 || accum[accum.length - 1].length == n) {
        accum.push([x]);
      } else {
        accum[accum.length - 1].push(x);
      }
      return accum;
    }, []);

const twoByTwo = nByN(2);

const userQuery = (userID: string) => new Promise((resolve, reject) => {
  promisify(db.query, 'MATCH (p:Person {userID: {userID}}) RETURN p', { userID })
    .then((result: Array<any>) => resolve(result.pop()))
    .catch(reject)
})

const friendCount = (userID: string) => new Promise((resolve, reject) => {
  promisify(db.query, 'MATCH (:Person {userID: {userID}}) -[:FOLLOWS]-> (friend:Person)RETURN COUNT(DISTINCT friend) AS friendCount', { userID })
    .then((result: Array<any>) => resolve(result.pop().friendCount))
    .catch(reject)
})

const platformHighlights = () =>
  promisify(db.query, `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest)
       WHERE rel.at < ${weekEnd.format('x')} AND rel.at > ${weekStart.format('x')}
       OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
       
       RETURN creator, rel, post, category,
          COUNT( DISTINCT comments) AS commentCount,
          [] AS commonFriends
          
       ORDER BY rel.at DESC`)

const friendlessHighlights = (userID: string) =>
  promisify(db.query, `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}})  
       WHERE NOT (user)-[:BLOCKED]-(creator)
         AND ( 
          creator = user 
          OR (user) -[:INTERESTED_IN]-> (category)
         )
         AND rel.at < ${weekEnd.format('x')} AND rel.at > ${weekStart.format('x')}
          
       OPTIONAL MATCH (post) <-[comments:COMMENTS]- (:Person)
       
       RETURN creator, rel, post, category,
          COUNT( DISTINCT comments) AS commentCount,
          [] AS commonFriends
          
       ORDER BY rel.at DESC`, { userID })

const friendfulHighlights = (userID: string) =>
  promisify(db.query, `MATCH (creator:Person) -[rel:OFFERS|:ASKS]-> (post:Post) -[:IS_ABOUT]-> (category:Interest),
             (user:Person {userID: {userID}}),
             (user) -[:FOLLOWS]-> (friend:Person)
       WHERE NOT (user) -[:BLOCKED]- (creator)
         AND (
          creator = user 
          OR creator = friend       
          OR (user) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (creator) -[:FOLLOWS]-> (friend) -[:FOLLOWS]-> (user)
          OR (user) -[:INTERESTED_IN]-> (category)
         )
         AND rel.at < ${weekEnd.format('x')} AND rel.at > ${weekStart.format('x')}
            
       OPTIONAL MATCH (post)<-[comments:COMMENTS]-(commenter:Person)
            WHERE NOT (user) -[:BLOCKED]- (commenter)
        
       OPTIONAL MATCH (commonFriend:Person) -[:FOLLOWS]-> (friend_of_friend:Person) -[:FOLLOWS]-> (commonFriend) -[:FOLLOWS]-> (user) -[:FOLLOWS]-> (commonFriend) 
          WHERE creator = friend_of_friend
          AND NOT commonFriend:Invitee
      
        RETURN creator, rel, post, category, 
            creator.userID in COLLECT(friend.userID) as isFriend,
            COUNT( DISTINCT comments) AS commentCount, 
            COLLECT( DISTINCT commonFriend) AS commonFriends
        ORDER BY rel.at DESC`, { userID })

const cidify = (category: { image: string }) =>
  category.image.split('/').pop()!.replace(/\..+$/, '')

const processUser = (userID: string, globalAsks: any[], globalOffers: any[]): Promise<{ id: string, failed: boolean, error: undefined | any }> =>
  new Promise((resolve, reject) => {
    let templateData: any = {
      weekDate: weekStart.format('MMM. D') + ' - ' + weekEnd.format('MMM. D YYYY'),
      cidify: cidify
    }
    userQuery(userID)
      .then((userData: any) => {
        templateData.user = userData

        const d = crypto.createCipher(cipherAlgo, config.newsletter_key);

        let code = d.update(`${userData.userID};${userData.email};${unsubscribeDate}`, 'utf8', 'hex');
        code += d.final('hex');
        templateData.unsubscribeLink = `${config.api}/api/newsletter/unsubscribe?code=${code}`;

        return friendCount(userID)
      })
      .then((count: number) => {
        templateData.friendCount = count
        let feedQuery = count > 0 ? friendfulHighlights : friendlessHighlights
        feedQuery(userID)
          .then((feedData: any[]) => {
            templateData.feed = feedData
            let offers = feedData.filter(p => p.rel.type === 'OFFERS').slice(0, postLimitPerType).map(x => Object.assign(x, { categoryCID: templateData.cidify(x.category) }))
            templateData.offers = offers.length >= postLimitPerType ? offers : globalOffers;
            templateData.hasOffers = templateData.offers.length > 0;
            let asks = feedData.filter(p => p.rel.type === 'ASKS').slice(0, postLimitPerType).map(x => Object.assign(x, { categoryCID: templateData.cidify(x.category) }))
            templateData.asks = asks.length >= postLimitPerType ? asks : globalAsks;
            templateData.hasAsks = templateData.asks.length > 0;
            templateData.interestsInFeed = Array.from(new Set((templateData.asks.concat(templateData.offers)).map(p => cidify(p.category))));

            templateData.offers = twoByTwo(templateData.offers);
            templateData.asks = twoByTwo(templateData.asks);
            //console.log('data', templateData)

            let htmlContent = ''
            mu.compileAndRender('weeklyNewsletter.html', templateData)
              .on('data', (data) => {
                htmlContent += data.toString()
              })
              .on('end', () => {
                inlineCss(htmlContent, { url: 'impossible.com' })
                  .then(data =>
                    mailReport(templateData, data)
                  )
                  .then(() => {
                    resolve({ id: userID, failed: false, error: undefined })
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

const mailReport = (data: any, htmlContent: string): Promise<any> => {
  const interestPics = data
    .interestsInFeed
    .map((s: string) => ({
      filename: s + '.png',
      path: __dirname + '/../assets/interests/' + s + '.png',
      cid: 'interest/' + s
    }))

  const attachmentList = [{
    filename: 'doll.png',
    path: __dirname + '/../assets/doll.png',
    cid: 'doll' //same cid value as in the html img src
  }, {
    filename: 'logo.png',
    path: __dirname + '/../assets/logo-small.png',
    cid: 'logo' //same cid value as in the html img src
  }, {
    filename: 'bottomdoll.png',
    path: __dirname + '/../assets/bottomdoll.png',
    cid: 'bottomdoll' //same cid value as in the html img src
  },
  ...interestPics]
  let transporter = nodemailer.createTransport({
    service: config.smtp.service,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  })

  let email = {
    from: config.smtp.from,
    to: data.user.email,
    subject: config.smtp.subject || 'Weekly highlights',
    html: htmlContent,
    attachments: attachmentList
  }
  if (config.logging) {
    console.log('SENDING', data.user.userID);
  }
  promisify(transporter.sendMail.bind(transporter), email);
};

const main = () => {
  console.time(`Process ${config.workdir}/reports/unprocessed`)
  Promise.all([platformHighlights(), promisify(fs.readdir, `${config.workdir}/reports/unprocessed`)])
    .then((result: any[]) => {
      const globalFeed: any[] = result[0]
      const globalOffers: any[] = globalFeed.filter(p => p.rel.type === 'OFFERS').slice(0, postLimitPerType).map(x => Object.assign(x, { categoryCID: cidify(x.category) }))
      const globalAsks: any[] = globalFeed.filter(p => p.rel.type === 'ASKS').slice(0, postLimitPerType).map(x => Object.assign(x, { categoryCID: cidify(x.category) }))

      const files: string[] = result[1];

      if (globalAsks.length + globalOffers.length < postMinimum) {
        // Not enough data for the newsletter, skip it
        if (config.logging) {
          console.log("Not enough posts for the newsletter, nothing sent");
        }
        return Promise.resolve(files.map((userID: string) =>
          ({
            id: userID, failed: false, error: undefined, noop: true,
          })));
      }
      return Promise.all(files.map((userID: string) =>
        processUser(userID, globalAsks, globalOffers)
      ))
    })
    .then((allResults: Array<{ id: string, failed: boolean, error: undefined | any, noop: undefined | boolean }>) => {
      let processed = {
        success: allResults.filter(x => !x.failed),
        failed: allResults.filter(x => x.failed)
      }
      for (let result of processed.success) {
        if (config.logging && !result.noop) {
          console.log(`Successfully processed report of ${result.id}`)
        }
        promisify(fs.unlink, `${config.workdir}/reports/unprocessed/${result.id}`)
          .catch(console.error)
      }
      for (let result of processed.failed) {
        if (/* TODO: move onto failed queue if we're facing a permanent failure, ignore otherwise to retry */true) {
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
}

main();
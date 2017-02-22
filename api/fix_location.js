'use strict';
/**
 *
 * THIS IS A CUSTOM SCRIPT TO FIX/RE-PARSE USER AND POST LOCATIONS
 *
 * */

const locationModel = require('models/LocationModel');
const Model = require('core/Model');

const q = `MATCH (u) WHERE u.location is not null and u.latitude is not null return u limit 1`;

new Model().db.query(q, (err, data) => {
  var i = 0;
  var batch = data.map((u) => new Promise((accept) => {
    i++;
    setTimeout(() => {
      locationModel
        .getFriendlyLocation([u.latitude, u.longitude])
        //.getFriendlyLocation([38.8041537,-9.1068818])
        .done((obj) => {
          if (obj.results) return accept('');
          let location = obj.friendlyName
          let id = u.id

          console.log('from "', u.location , '" to "', obj.friendlyName, '"');

          //accept(`MATCH (u) WHERE id(u) = ${id} set u.location = '${location}'`);
        });
    }, 1000 * i);
  }));

  Promise.all(batch).then((val) => {
    batch.forEach(p => {
      p.then((qq) => {
        console.log(qq)
        new Model().db.query(qq, (err, response)=> {
          console.log(!err ? 'success' : 'upppss', qq)
        });
      });
    });
  });

})

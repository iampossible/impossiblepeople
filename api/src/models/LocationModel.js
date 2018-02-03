'use strict';

const Sequence = require('impossible-promise');
const Model = require('core/Model');
const config = require('config/server');

class LocationModel extends Model {

  constructor() {
    super();
    this.geoApiEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?key=${config.google.apiKey}&address=`;
  }

  getFriendlyLocation(params) {
    let url = this.geoApiEndpoint + encodeURIComponent(params.join(','));
    return new Sequence((next, reject) => {
      this.request.get(url, (err, response) => {
        if (err) return reject(err);
        next(response);
      });
    })
      // JSON.parse may throw an exception, but it will be absorbed by the Promise
      .done((response) => this._parseAddressResponse(JSON.parse(response.body)))
      .error(err => console.warn('error parsing google maps response', JSON.stringify(err)));
  }

  _parseAddressResponse(obj) {
    if (obj.status !== 'OK') {
      throw obj;
    }

    let politicalLocations = {};
    let addressComponents = [].concat.apply([], obj.results.map(item => item.address_components));

    addressComponents.forEach((component) => {
      if (component.types.find((item) => item === 'political')) {
        politicalLocations[component.types[0]] = component.long_name;
      }
    });

    //remove deep administrative area level
    if (politicalLocations.hasOwnProperty('administrative_area_level_4')) {
      delete politicalLocations.administrative_area_level_4;
    }

    let area = '';
    if (politicalLocations.hasOwnProperty('administrative_area_level_1')) {
      area = politicalLocations[Object.keys(politicalLocations).sort((a, b) => {
        return [a, b].map(item => parseInt((item.match(/level_(\d+)/) || []).pop(), 10)).reduce((p, c) => p - (isNaN(c) ? 0 : c));
      }).pop()];
    }

    //custom replace of
    area = area.replace('London Borough of ', '');

    //join city name if
    if (area) { //found an area
      if (politicalLocations.hasOwnProperty('locality')) {
        area += ', ' + politicalLocations.locality;
      } else if (politicalLocations.hasOwnProperty('political')) {
        area += ', ' + politicalLocations.political;
      }
    } else { //found broad area
      if (politicalLocations.hasOwnProperty('locality')) {
        area = ', ' + politicalLocations.locality;
      }
      if (politicalLocations.hasOwnProperty('country')) { //join country
        area += ', ' + politicalLocations.country;
      }
      area = area.replace(/^[, ]+/g, " ").trim(); //trim first comma
    }

    return { friendlyName: area };
  }
}

module.exports = new LocationModel();

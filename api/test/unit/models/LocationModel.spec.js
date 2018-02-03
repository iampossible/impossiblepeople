'use strict';

let locationModel = require('models/LocationModel');
const config = require('config/server');

beforeAll(() => {
  // reset postModel object and all spies
  locationModel = new locationModel.constructor();
});

describe('Location Model', () => {
  let locationData = require('../../assets/location.json');
  let mockResult = JSON.stringify(locationData);

  describe('getFriendlyLocation method', () => {
    it('should call the Google Maps API', (done) => {
      spyOn(locationModel.request, 'get').and.callFake((url, callback) => callback(null, { body: mockResult }));

      locationModel
        .getFriendlyLocation([1.234, 5.678])
        .done(() => {
          let url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + config.google.apiKey + '&address=1.234%2C5.678';
          expect(locationModel.request.get).toHaveBeenCalledWith(url, jasmine.any(Function));
          done();
        });
    });
  });

  describe('_parseAddressResponse method', () => {
    it('should return the most specific administrative area from the all resullts', () => {
      let parsedMockResult = JSON.parse(mockResult);
      let result = locationModel._parseAddressResponse(parsedMockResult);

      expect(result.friendlyName).toEqual('Islington, London');
    });

    it('should return the country if there are no administrative areas', () => {
      let parsedMockResult = JSON.parse('{"results":[{"address_components":[{"long_name":"165","short_name":"165","types":["street_number"]},{"long_name":"Birch Hill Road","short_name":"Birch Hill Rd","types":["route"]},{"long_name":"Bracknell","short_name":"Bracknell","types":["locality","political"]},{"long_name":"Bracknell","short_name":"Bracknell","types":["postal_town"]},{"long_name":"United Kingdom","short_name":"GB","types":["country","political"]},{"long_name":"RG12 7HB","short_name":"RG12 7HB","types":["postal_code"]}],"formatted_address":"165 Birch Hill Rd, Bracknell, Bracknell Forest RG12 7HB, UK","geometry":{"bounds":{"northeast":{"lat":51.3892316,"lng":-0.7531278},"southwest":{"lat":51.3892316,"lng":-0.7531466}},"location":{"lat":51.3892316,"lng":-0.7531466},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":51.3905805802915,"lng":-0.7517882197084981},"southwest":{"lat":51.3878826197085,"lng":-0.7544861802915022}}},"partial_match":true,"place_id":"EjsxNjUgQmlyY2ggSGlsbCBSZCwgQnJhY2tuZWxsLCBCcmFja25lbGwgRm9yZXN0IFJHMTIgN0hCLCBVSw","types":["street_address"]}],"status":"OK"}');
      let result = locationModel._parseAddressResponse(parsedMockResult);

      expect(result.friendlyName).toEqual('Bracknell, United Kingdom');
    });
  });
});

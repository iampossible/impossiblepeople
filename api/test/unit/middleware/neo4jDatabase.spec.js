'use strict';

const db = require('middleware/neo4jDatabase');

describe('Database middleware', () => {
  describe('getOne method', () => {
    it('should refuse on error', (done) => {
      spyOn(db, 'query').and.callFake((query, params, callback) => {
        expect(query).toEqual('some cypher');
        expect(params).toEqual({ some: 'parameters' });
        callback('oops');
      });

      db.getOne('some cypher', { some: 'parameters' }).error((err) => {
        expect(err).toEqual('oops');
        done();
      });
    });

    it('should return null on empty result', (done) => {
      spyOn(db, 'query').and.callFake((query, params, callback) => {
        expect(query).toEqual('some cypher');
        expect(params).toEqual({ some: 'parameters' });
        callback(null, []);
      });

      db.getOne('some cypher', { some: 'parameters' }).done((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should return a single result', (done) => {
      spyOn(db, 'query').and.callFake((query, params, callback) => {
        expect(query).toEqual('some cypher');
        expect(params).toEqual({ some: 'parameters' });
        callback(null, ['something']);
      });

      db.getOne('some cypher', { some: 'parameters' }).done((result) => {
        expect(result).toEqual('something');
        done();
      });
    });

    it('should return the first result and warn if multiple', (done) => {
      spyOn(db, 'query').and.callFake((query, params, callback) => {
        expect(query).toEqual('some cypher');
        expect(params).toEqual({ some: 'parameters' });
        callback(null, ['something', 'else']);
      });
      spyOn(console, 'warn');

      db.getOne('some cypher', { some: 'parameters' }).done((result) => {
        expect(result).toEqual('something');
        expect(console.warn).toHaveBeenCalled();
        done();
      });
    });
  });
});

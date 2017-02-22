/* globals jasmine, describe, expect, it, beforeEach, afterEach */
'use strict';

const Sequence = require('impossible-promise');

var interestModel = require('models/InterestModel');

describe('Interest Model', () => {
  beforeEach(() => {
    // reset feedModel object and all spies
    interestModel = new interestModel.constructor();
  });

  describe('getInterests method', () => {
    var payload;

    beforeEach(() => {

      payload = [{ foo: 'bar' }];
      spyOn(interestModel.db, 'query').and.callFake((query, params, callback) =>
        (callback ? callback(null, payload) : params(null, payload))
      );
    });

    it('should return all interests stored', (done) => {
      interestModel.getInterests().done((data) => {
        expect(interestModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String), jasmine.any(Function)
        );
        expect(data).toBe(payload);

        done();
      });
    });

    it('should return all featured interests', (done) => {
      interestModel.getInterests(true).done((data) => {
        expect(interestModel.db.query).toHaveBeenCalledWith(
          jasmine.any(String), jasmine.any(Function)
        );
        expect(data).toBe(payload);

        done();
      });
    });
  });

  describe('createSuggestion method', () => {
    var mockUser;

    beforeEach(() => {
      mockUser = { userID: 'aperson' };
    });

    describe('failing cases', () => {
      it('should refuse with error if getOne query fails', (done) => {
        // TODO why doesn't this work?
        // spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept, reject) => reject('error')));
        spyOn(interestModel.db, 'query').and.callFake((query, params, callback) => callback('error'));
        spyOn(interestModel.db, 'save');
        interestModel.createSuggestion(mockUser, 'Windsurfing').error((msg) => {
          expect(msg).toEqual('error');
          expect(interestModel.db.save).not.toHaveBeenCalled();
          done();
        });
      });

      it('should refuse with error if save fails', (done) => {
        spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept) => accept(null)));
        spyOn(interestModel.db, 'save').and.callFake((object, label, callback) => callback('error'));
        spyOn(interestModel.db, 'query');
        interestModel.createSuggestion(mockUser, 'Windsurfing').error((msg) => {
          expect(msg).toEqual('error');
          expect(interestModel.db.query).not.toHaveBeenCalled();
          done();
        });
      });

      it('should refuse with error if link query fails', (done) => {
        spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept) => accept(null)));
        spyOn(interestModel.db, 'save').and.callFake((object, label, callbackOrValue, callback) => {
          if (callback) {
            callback(null, {});
          } else {
            callbackOrValue(null, {});
          }
        });
        spyOn(interestModel.db, 'query').and.callFake((query, params, callback) => callback('error'));
        interestModel.createSuggestion(mockUser, 'Windsurfing').error((msg) => {
          expect(msg).toEqual('error');
          done();
        });
      });
    });

    describe('create new suggestion', () => {
      beforeEach(() => {
        spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept) => accept(null)));
        spyOn(interestModel.db, 'save').and.callFake((query, labelOrParam, callbackOrValue, callback) => {
          if (!callback) {
            // first save, creates ID
            callbackOrValue(null, { suggested: true, featured: false, name: 'Windsurfing', id: 123 });
          } else {
            // second save, creates interestID
            callback(null, { suggested: true, featured: false, name: 'Windsurfing', id: 123, interestID: interestModel.db.encodeID(123) });
          }
        });
        spyOn(interestModel.db, 'query').and.callFake((query, params, callback) => callback(null, null));
      });

      it('should query for an existing suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.getOne).toHaveBeenCalledWith(jasmine.any(String), { suggestion: 'Windsurfing' });
          done();
        });
      });

      it('should appear as a new suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done((result) => {
          expect(result.isNew).toBeTruthy();
          done();
        });
      });

      it('should save the new suggestion with an ID', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.save).toHaveBeenCalledWith(
            { suggested: true, featured: false, name: 'Windsurfing' },
            'Interest',
            jasmine.any(Function)
          );
          expect(interestModel.db.save).toHaveBeenCalledWith(
            { suggested: true, featured: false, name: 'Windsurfing', id: 123 },
            'interestID',
            interestModel.db.encodeID(123),
            jasmine.any(Function)
          );
          done();
        });
      });

      it('should link the suggestion to the user', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.query).toHaveBeenCalledWith(
            jasmine.any(String),
            { userID: 'aperson', interestID: interestModel.db.encodeID(123) },
            jasmine.any(Function)
          );
          done();
        });
      });
    });

    describe('link existing interest', () => {
      beforeEach(() => {
        spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept) => {
          accept({ suggested: false, name: 'Windsurfing', featured: true, id: 123, interestID: 'somehash' });
        }));
        spyOn(interestModel.db, 'query').and.callFake((query, params, callback) => {
          expect(query).toContain('INTERESTED_IN');
          callback(null, null);
        });
        spyOn(interestModel.db, 'save');
      });

      it('should query for an existing suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.getOne).toHaveBeenCalledWith(jasmine.any(String), { suggestion: 'Windsurfing' });
          done();
        });
      });

      it('should not save a new interest', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.save).not.toHaveBeenCalled();
          done();
        });
      });

      it('should link the interest to the user', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.query).toHaveBeenCalledWith(
            jasmine.any(String),
            { userID: 'aperson', interestID: 'somehash' },
            jasmine.any(Function)
          );
          done();
        });
      });

      it('should appear as an old suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done((result) => {
          expect(result.isNew).toBeFalsy();
          done();
        });
      });
    });

    describe('link existing suggestion', () => {
      beforeEach(() => {
        spyOn(interestModel.db, 'getOne').and.returnValue(new Sequence((accept) => {
          accept({ suggested: true, name: 'Windsurfing', featured: true, id: 123, interestID: 'somehash' });
        }));
        spyOn(interestModel.db, 'query').and.callFake((query, params, callback) => {
          expect(query).toContain('SUGGESTS');
          callback(null, null);
        });
        spyOn(interestModel.db, 'save');
      });

      it('should query for an existing suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.getOne).toHaveBeenCalledWith(jasmine.any(String), { suggestion: 'Windsurfing' });
          done();
        });
      });

      it('should not save a new interest', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.save).not.toHaveBeenCalled();
          done();
        });
      });

      it('should link the suggestion to the user', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done(() => {
          expect(interestModel.db.query).toHaveBeenCalledWith(
            jasmine.any(String),
            { userID: 'aperson', interestID: 'somehash' },
            jasmine.any(Function)
          );
          done();
        });
      });

      it('should appear as an old suggestion', (done) => {
        interestModel.createSuggestion(mockUser, 'Windsurfing').done((result) => {
          expect(result.isNew).toBeFalsy();
          done();
        });
      });
    });
  });
});

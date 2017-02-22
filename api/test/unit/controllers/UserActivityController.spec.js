/* globals describe, expect, it */
'use strict';

var userActivityController = require('controllers/UserActivityController');

describe('UserActivityController', () => {
  describe('route registration', () => {

    it('registers GET /user/activity method', () => {
      var activityRoutes = userActivityController._routes;

      expect(activityRoutes.getActivity).not.toBeUndefined();
      expect(activityRoutes.getActivity.method).toBe('GET');
      expect(activityRoutes.getActivity.path).toBe('/api/user/activity');
      expect(activityRoutes.getActivity.config.auth).toBe('session');
      expect(activityRoutes.getActivity.config.handler).not.toBeUndefined();
    });

    it('registers GET /user/activity/count method', () => {
      var activityRoutes = userActivityController._routes;

      expect(activityRoutes.getActivityCount).not.toBeUndefined();
      expect(activityRoutes.getActivityCount.method).toBe('GET');
      expect(activityRoutes.getActivityCount.path).toBe('/api/user/activity/count');
      expect(activityRoutes.getActivityCount.config.auth).toBe('session');
      expect(activityRoutes.getActivityCount.config.handler).not.toBeUndefined();
    });
  });
});

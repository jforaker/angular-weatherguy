
angular.module('FlickrService', [])

	.factory('Flickr', function ($q, $resource, FLICKR_API_KEY) {

		var baseUrl = 'https://api.flickr.com/services/rest/';

		var flickrSearch = $resource(baseUrl, {
			method: 'flickr.groups.pools.getPhotos',
			group_id: '1463451@N25',
			safe_search: 1,
			jsoncallback: 'JSON_CALLBACK',
			api_key: FLICKR_API_KEY,
			format: 'json'
		}, {
			get: {
				method: 'JSONP'
			}
		});

		return {
			search: function (tags, lat, lng) {
				var q = $q.defer();

				console.log('Searching flickr for tags', tags);

				flickrSearch.get({
					tags: tags,
					lat: lat,
					lng: lng
				}, function (val) {
					q.resolve(val);
				}, function (httpResponse) {
					q.reject(httpResponse);
				});

				return q.promise;
			}
		};
	})
;

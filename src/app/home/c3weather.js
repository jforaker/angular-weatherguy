angular.module( 'c3weather', [] )


	.controller('buttonBarController', ['$scope', '$window', 'dataService',function($scope, $window, dataService) {
		$scope.primary1Label = 'Prime1';
		$scope.onPrimary1Click = function() {
			$window.alert('Primary 1 clicked');
		};
		angular.copy([ { name: 'test'} , { name: 'foo' } ], dataService.items);

	}])

	.factory('dataService', [function(){

		var items = ['asdf'];

		return {
			items: items
		};
	}])

	.directive('buttonBar',  function($compile, ForecastIOService, dataService) {

		var getTemplate = function (scope) {
			var wd = ForecastIOService.cached.daily.data;
			var t = [];
			angular.forEach(wd, function(item, i) {
				var day = moment.unix(item.time).isoWeekday(i).format('dddd');
				var tpl = '<button data-type="'+day+'"  class="btn btn-info"> '+ day +' </button>';
				t.push(tpl);
			});
			return '<div>' + t.join("") + '</div>';
		};

		return {
			restrict: 'EA',
			scope: {
				weeklyData : '@weeklyData',
				selectedInterval: '@selectedInterval'
			},
			template: function(tElement, tAttrs) {
				return getTemplate(tAttrs.content);
			},
			replace: true,
			transclude: true,
			link: function(scope, element, attrs) {
				var data = JSON.parse(attrs.dailyData);
				var days = [];
				var a = $compile(element.contents())(scope);
				angular.forEach(data, function(item, i) {
					var day = moment.unix(item.time).isoWeekday(i).format('dddd');
					days.push(day);
				});
				scope.days = days;
				scope.data = dataService;

				a.bind('click', function (e) {
					var val = e.target.attributes[0].value;
					console.log(e.target.attributes[0].value);
					scope.data = val;
				})
			}
		};
	})


	.directive('c3weather', function(ForecastIOService, $q, IconService){
		return{
			restrict:'EA',
			scope: {
				bindto: '@bindtoId',
				enableZoom: '=enableZoom',
				weatherData: '@chartData',
				chartData: '@chartData'
			},
			template:	'<div>' +
							'<button id="current" class="btn btn-default">Today</button>' +
							'<button id="week" class="btn btn-default">This week</button>' +
							'<button id="hours" class="btn btn-default">The next hour</button>' +
							'<p style="margin-top: 14px">{{selectedInterval}}</p>'+
							'<div id="chart" data-type="{{bindto}}"></div>' +
						'</div>',

			link: function(scope, elem, attrs){

				scope.selectedInterval =  moment().format('dddd');
				var chardata = attrs.chartData;
				console.log(chardata.daily);
				var ds = JSON.parse(chardata);
				var chart, temps = [], feelsLike = [], hours =[];
				var currentbutt = angular.element(elem.children().children()[0]);
				var weekbut = angular.element(elem.children().children()[1]);  //this seems wonky
				var hourbutt = angular.element(elem.children().children()[2]);
				var icons = new Skycons({'color': '#222222'});

				var draw = function (dh, time, week) {
					if(week){

						//WEEK
						chart = c3.generate({
							data: {
								json: {
									Temperature : dh
								}
							},
							axis: {
								x: {
									type: 'category',
									categories: time,
									tick: {
										rotate: 75
									},
									height: 90,
									y: {
										max: 1,
										min: 0
									}
								}
							}
						});
					} else {
						//CHANCE OF RAIN
						chart = c3.generate({
							data: {
								type: 'gauge',
								json: [dh],
								labels: {
									format: {
										y: d3.format('%')
									}
								}
							},
							gauge: {
								width: 90 // for adjusting arc thickness
							},
							color: {
								pattern: ['blue', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
								threshold: {
									values: [dh]
								}
							}
						});
					}
				};

				var getTemps = (function () {

					return {
						getCurrentTemps : function () {
							var temps = [], feelsLike = [], hours =[];

							ds.hourly.forEach(function (data ,i) {
								temps.push(data.temperature);
								feelsLike.push(data.apparentTemperature);
								hours.push(moment.unix(data.time).format('h:hh a'));
							});
							chart = c3.generate({
								data: {
									type: 'scatter',
									json: {
										'Temperature': temps,
										'Feels Like': feelsLike
									},
									onclick: function (d, i) { console.log("onclick", d, i); }
								},
								axis: {
									x: {
										type: 'category',
										categories: hours,
										tick: {
											rotate: 75,
											culling: {
												max: 20
											}
										},
										height: 90
									}
								}
							});

							setTimeout(function () {
								chart.transform('area-spline');
							}, 1000);
						},
						getHourlyTemps : function () {
							var hours = [], precipIntensity = [];
							ds.minutely.forEach(function (data ,i) {
								precipIntensity.push(data.precipProbability * 10);
								hours.push(moment.unix(data.time).format('h:hh a'));
							});
							draw(precipIntensity, hours);
						},
						getDailyTemps : function () {
							var days = [], daily = [];
							ds.daily.forEach(function (data ,i) {
								daily.push(data.temperatureMax);
								days.push(moment.unix(data.time).isoWeekday(i).format('dddd'))
							});
							draw(daily, days, true);
						}
					}
				}());

				weekbut.bind('click', function (e) {
					var skykon = IconService.get(ds.dailyIcon);
					var _id = scope.$parent.CurrentWeather.weather.data._id;
					var newSummary = ds.dailySummary;
					scope.$apply(function(){
						scope.selectedInterval = 'This week';
						scope.$parent.CurrentWeather.weather.data.selectedInterval = 'This week';
						scope.$parent.CurrentWeather.weather.data.summary = newSummary;
						scope.$parent.CurrentWeather.weather.data.apparentTemperature = '';
					});
					(function() {
						icons.remove(_id);
						icons.add(_id, skykon);
						icons.play();
					}());
					getTemps.getDailyTemps();
				});

				hourbutt.bind('click', function (e) {
					var skykon = IconService.get(ds.minutelyIcon);
					var _id = scope.$parent.CurrentWeather.weather.data._id;
					var newSummary = ds.minutelySummary;
					scope.$apply(function(){
						scope.selectedInterval = 'Chance of percipitation this hour';
						scope.$parent.CurrentWeather.weather.data.selectedInterval = '';
						scope.$parent.CurrentWeather.weather.data.summary = newSummary;
						scope.$parent.CurrentWeather.weather.data.apparentTemperature = '';
					});
					(function() {
						icons.remove(_id);
						icons.add(_id, skykon);
						icons.play();
					}());
					getTemps.getHourlyTemps();
				});

				currentbutt.bind('click', function (e) {
					var skykon = IconService.get(ds.icon);
					var _id = scope.$parent.CurrentWeather.weather.data._id;
					var newSummary = ds.summary;
					scope.$apply(function(){
						scope.selectedInterval = 'Current conditions';
						scope.$parent.CurrentWeather.weather.data.selectedInterval = '';
						scope.$parent.CurrentWeather.weather.data.summary = newSummary;
						scope.$parent.CurrentWeather.weather.data.apparentTemperature = ds.apparentTemperature;
					});
					(function() {
						icons.remove(_id);
						icons.add(_id, skykon);
						icons.play();
					}());
					getTemps.getCurrentTemps();
				});

				//initialize
				getTemps.getCurrentTemps();

			}
		};
	})

;


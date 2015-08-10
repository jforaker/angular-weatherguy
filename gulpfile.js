var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	rename = require('gulp-rename'),
	del = require('del'),
	livereload = require('gulp-livereload'),
	inject = require("gulp-inject"),
	html2js = require('gulp-html2js'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	debug = require('gulp-debug'),
	svgstore = require('gulp-svgstore'),
	merge = require('merge-stream'),
	watch = require('gulp-watch'),
	changed = require('gulp-changed'),
	header = require('gulp-header'),
	fs = require('fs'),
	bump = require('gulp-bump'),
	ngAnnotate = require('gulp-ng-annotate'),
	config = require('./build.config.js'),
	pkg = require('./package.json'),
	gutil = require('gulp-util'),
	http = require('http'),
	ecstatic = require('ecstatic')
	;


/**
 * Copy files to build dir
 */

gulp.task('copy', function () {
	var assets = gulp.src('./src/assets/**/*', {base: './src/assets/'})
			.pipe(changed(config.build_dir + '/assets'))
			.pipe(gulp.dest(config.build_dir + '/assets')),

		svg = gulp.src('./src/assets/svg-defs.svg')
			.pipe(changed(config.build_dir + '/assets'))
			.pipe(gulp.dest(config.build_dir + '/assets')),

		src = gulp.src(['src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'])
			.pipe(changed(config.build_dir + '/src'))
			.pipe(gulp.dest(config.build_dir + '/src')),

		vendorjsfiles = gulp.src(config.vendor_files.js, {base: '.'})
			.pipe(changed(config.build_dir))
			.pipe(gulp.dest(config.build_dir)),

		vendorcssfiles = gulp.src(config.vendor_files.css, {base: '.'})
			.pipe(changed(config.build_dir))
			.pipe(gulp.dest(config.build_dir))
		;

	return merge(assets, svg, src, vendorjsfiles, vendorcssfiles);
});

gulp.task('less', function () {
	return gulp.src(config.app_files.less)
		.pipe(changed(config.build_dir + '/assets', {extension: '.css'}))
		.pipe(less())
		.pipe(rename(function (path) {
			path.basename = pkg.name + '-' + pkg.version;
		}))
		.pipe(gulp.dest(config.build_dir + '/assets'));
});

gulp.task('jshint', function () {
	var options = {
		curly: true,
		immed: true,
		newcap: true,
		noarg: true,
		sub: true,
		boss: true,
		eqnull: true
	};

	return gulp.src(config.app_files.js)
		.pipe(jshint(options))
		.pipe(jshint.reporter(stylish))
		.pipe(jshint.reporter('fail'));
});

gulp.task('html2js', function () {
	var atpls = gulp.src(config.app_files.atpl)
			.pipe(html2js({base: 'src/app', outputModuleName: 'templates-app'}))
			.pipe(changed('./build', {extension: '.js'}))
			.pipe(concat('templates-app.js'))
			.pipe(gulp.dest('./build')),

		ctpls = gulp.src(config.app_files.ctpl)
			.pipe(html2js({base: 'src/common', outputModuleName: 'templates-common'}))
			.pipe(changed('./build', {extension: '.js'}))
			.pipe(concat('templates-common.js'))
			.pipe(gulp.dest('./build'));

	return merge(atpls, ctpls);
});

var indexTask = function () {
	var target = gulp.src('src/index.html'),

		files = [].concat(
			config.vendor_files.js,
			'src/**/*.js',
			config.vendor_files.css,
			'templates-common.js',
			'templates-app.js',
			'assets/' + pkg.name + '-' + pkg.version + '.css'
		),

		sources = gulp.src(files, {read: false, cwd: config.build_dir, addRootSlash: false});

	return target.pipe(inject(sources))
		.pipe(gulp.dest(config.build_dir));
};

gulp.task('index', [
	'less',
	'copy',
	'html2js'
], function () {
	return indexTask();
});

gulp.task('watch-index', [
	'less'
], function () {
	return indexTask();
});

var svgstoreTask = function () {
	var svgs = gulp.src('src/assets/svg/*.svg')
			.pipe(svgstore({prefix: pkg.name + '-', inlineSvg: true})),

		fileContents = function fileContents(filePath, file) {
			return file.contents.toString('utf8');
		};

	return gulp.src(config.build_dir + '/index.html')
		.pipe(inject(svgs, {transform: fileContents}))
		.pipe(gulp.dest(config.build_dir));
};

gulp.task('svgstore', ['index'], function () {
	return svgstoreTask();
});

gulp.task('watch-svgstore', ['watch-index'], function () {
	return svgstoreTask();
});

gulp.task('livereload', ['svgstore'], function () {
	livereload.listen();
	gulp.watch(config.build_dir + '/**').on('change', livereload.changed);
});

gulp.task('watch', ['svgstore'], function () {
	gulp.watch(['**/*.less'], [
		'less'
	]);
	gulp.watch(['src/**/*.js'], [
		//'jshint',
		'copy'
	]);
	gulp.watch([config.app_files.atpl, config.app_files.ctpl], [
		'html2js'
	]);
	gulp.watch('src/index.html', [
		'watch-index', 'watch-svgstore'
	]);
	gulp.watch('src/assets/svg/*.svg', [
		'svgstore'
	]);
});

gulp.task('server', function () {
	http.createServer(ecstatic({root: __dirname + '/build'}))
		.listen(8080);
	gutil
		.log(gutil.colors.green('HTTP server listening on port 8080'));
});

gulp.task('default', [
	//'jshint',
	'server',
	'watch',
	'livereload'
]);

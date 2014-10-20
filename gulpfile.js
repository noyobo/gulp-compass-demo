'use strict';

var gulp = require('gulp')
var path = require('path')
var clean = require('gulp-clean')
var compass = require('gulp-compass')
var copy = require('gulp-copy')
var minifyCSS = require('gulp-minify-css')
var filter = require('gulp-filter')

gulp.task('del', function() {
  return gulp
    .src(['sass/**/*.css', './build/css']) // 需要删除生成后的文件. gulp 不能覆盖
    .pipe(clean())
})

gulp.task('sass', ['del'], function() {
  return gulp.src('./sass/style/*.scss')
    .pipe(compass({
      config_file: path.join(process.cwd(), 'config.rb'),
      project: path.join(process.cwd(), '/sass'),
      css: './',
      sass: 'style',
      import_path: './',
      style: 'nested' //nested, expanded, compact, or compressed.
    }))
    .on('end', function() {
      console.log('compass 编译完成')
    })
});


gulp.task('sassbuild', ['sass'], function() {
  var cssfilter = filter('**/*.css')
  return gulp
    .src(['sass/*.css', 'sass/*/*.png'])
    .pipe(cssfilter)
    .pipe(minifyCSS({
      keepSpecialComments: 0,
      keepBreaks: false
    }))
    .pipe(cssfilter.restore())
    .pipe(copy('./build/css', {
      'prefix': 1
    }))
})

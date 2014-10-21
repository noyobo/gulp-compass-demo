'use strict';

var gulp = require('gulp')
var path = require('path')
var fs = require('fs')
var clean = require('gulp-clean')
var compass = require('gulp-compass')
var copy = require('gulp-copy')
var minifyCSS = require('gulp-minify-css')
var filter = require('gulp-filter')
var map = require('map-stream')
var del = require('del')
var exec = require('child_process').exec

gulp.task('del', function() {
  return gulp
    .src(['buildTemp']) // 需要删除生成后的文件. gulp 不能覆盖
    .pipe(clean())
})

gulp.task('sass', ['del'], function() {
  return gulp.src(['src/*/*.scss', '!src/*/sprites.scss'])
    .pipe(compass({
      // config_file: path.join(process.cwd(), 'config.rb'),
      project: process.cwd(),
      css: './buildTemp', // compass 生成css目录
      sass: 'src',
      import_path: './',
      time: true,
      debug: false,
      relative: false,
      style: 'nested' //nested, expanded, compact, or compressed.
    }))
    .on('end', function() {
      console.log('compass 编译完成')
    })
});

gulp.task('temp', ['sass'], function() {
  return gulp
    .src(['src/*/images/*.*'])
    .pipe(copy('./buildTemp/', {
      prefix: 1
    }))
})

gulp.task('build', ['temp'], function(done) {
  return gulp
    .src(['buildTemp/**/*.*'])
    .pipe(map(function(file, done) {
      if (path.extname(file.path) === '.css') {
        var contents = String(file.contents)
        contents = contents.replace('/src/', '/')
        if (!(contents instanceof Buffer)) {
          contents = new Buffer(contents);
        }
        file.contents = contents;
      };
      done(null, file);
    }))
    .pipe(gulp.dest('./build'))
    .on('end', function() {
      console.log('build complete')
    })
})

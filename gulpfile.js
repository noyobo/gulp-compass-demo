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
  return gulp.src(['src/**/*.scss', '!src/*/_*.scss'])
    .pipe(compass({
      // config_file: path.join(process.cwd(), 'config.rb'),
      project: path.join(process.cwd()),
      css: './buildTemp', // compass 生成css目录
      sass: 'src',
      time: true,
      import_path: './',
      debug: false,
      style: 'nested' //nested, expanded, compact, or compressed.
    }))
    .on('end', function() {
      console.log('compass 编译完成')
    })
});

gulp.task('temp', ['sass'], function() {
  return gulp
    .src(['src/*/images/*.png'])
    .pipe(copy('./buildTemp/', {
      prefix: 1
    }))
})

gulp.task('build', ['temp'], function(done) {
  return gulp
    .src(['buildTemp/**/*/*.*'])
    .pipe(map(function(file, done) {
      if (path.extname(file.path) === '.css') {
        var contents = String(file.contents)
        var imgReg = (/url(?: )?\((?:'|")?([^\'\"]+\.png|gif|jpg|jpge)(?:'|")?\)/gm)
        var imgPathOld = imgReg.exec(contents)[1]
        var imgPath = imgPathOld.replace("/src/", "/buildTemp/")
        var a = path.dirname(file.path) // 取得CSS所在路径
        var b = path.resolve(a, imgPath) // 图片的绝对地址
        var c = path.relative(a, b)
        contents = contents.replace(imgPathOld, c)
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
      del('./buildTemp', function(err){
        if (err) {throw new Error(err)};
        console.log('clean buildTemp')
        exec('compass clean', function(error, stdout, stderr){
          if (error) { throw new Error(error)};
          console.log(stdout)
        })
      })
    })
})

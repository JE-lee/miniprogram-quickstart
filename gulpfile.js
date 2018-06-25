/* eslint-disable no-undef */
const gulp = require('gulp')
const watch = require('gulp-watch')
const del = require('del')
const imagemin = require('gulp-imagemin')
const babel = require('gulp-babel')
const cson = require('gulp-cson2')
// NOTE: 开发者工具只支持JS的inline的sourcemaps
const sourcemaps = require('gulp-sourcemaps')
const stylus = require('gulp-stylus')
const rename = require('gulp-rename')
// NOTE: error别打断工作流；报错后让watch继续工作
const plumber = require('gulp-plumber')
const replace = require('gulp-replace')
const path = require('path')
require('colors')

const paths = {
  img: ['src/**/*.(png|jpg)'],
  js: ['src/**/*.js', '!src/lib'],
  stylus: ['src/**/*.styl'],
  cson: ['src/**/*.cson'],
  copy: ['src/**/*.(json|wxml|wxss|wxs|wav|mp3)', 'src/lib']
}

function cwatch(glob) {
  return watch(glob, {
    ignoreInitial: false,
    base: 'src'
  }, log)
    .pipe(plumber())
}

function log(file) {
  const { event: e, relative: p } = file
  const choices = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan'
  ]
  const _log = (action) => {
    const d = new Date()
    const r1 = Math.floor(Math.random() * choices.length)
    const r2 = Math.floor(Math.random() * choices.length)
    console.log(`${ '['[choices[r1]] }${ d.toLocaleTimeString() }${ ']'[choices[r2]] }`, action, p)
  }
  const pad = s => s.padEnd(6, ' ')
  // NOTE: 没有合适的glob能监听addDir和unlinkDir事件。src的空dir不会add到dist；将src的某dir删除也只能删除dist中对应的file，会遗留空目录树
  switch (e) {
    case 'add':
      _log(pad(e).green); break
    case 'change':
      _log(e.yellow); break
    case 'unlink':
      _log(pad('del').red)
      setImmediate(() => {
        del(file.path.replace('/src/', '/dist/'))
      })
      break
    default:
      _log(e); break
  }
}

function minifyImg() {
  return cwatch(paths.img)
    .pipe(imagemin())
    .pipe(gulp.dest('dist'))
}

function compileJS() {
  return cwatch(paths.js)
    .pipe(replace(/import .*'(@\/).*'/g, function(match, p1) {
      const { relative } = this.file
      const layers = relative.split(path.sep).length - 1
      return match.replace('@/', '../'.repeat(layers))
    }))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.mapSources((sourcePath, file) => {
      // IDEA: 日后研究一下sourcemap的路径等知识
      // NOTE: 开发者工具上传代码时，会自动清除sourcemaps
      return file.basename
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
}

function compileStylus() {
  return cwatch(paths.stylus)
    // FIXME: 目前这种替换无法处理连续引用的情况（import @的styl里还有import @）
    .pipe(replace(/@import '(@\/).*'/g, function(match, p1) {
      const { relative } = this.file
      const layers = relative.split(path.sep).length - 1
      return match.replace('@/', '../'.repeat(layers))
    }))
    .pipe(stylus())
    .pipe(rename(path => path.extname = '.wxss'))
    .pipe(gulp.dest('dist'))
}

function compileCSON() {
  return cwatch(paths.cson)
    .pipe(cson())
    .pipe(gulp.dest('dist'))
}

function copy() {
  return cwatch(paths.copy)
    .pipe(gulp.dest('dist'))
}

function clean() {
  return del('dist/*')
}

gulp.task('default', gulp.series(
  clean,
  gulp.parallel(
    minifyImg,
    compileJS,
    compileStylus,
    compileCSON,
    copy
  )
))

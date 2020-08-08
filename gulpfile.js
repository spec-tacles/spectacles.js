const gulp = require('gulp');
const merge = require('merge2');
const del = require('del');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const project = ts.createProject('tsconfig.json');

const build = () => {
  del.sync(['dist/**', '!dist']);
  del.sync(['typings/**', '!typings']);

  const result = project.src()
    .pipe(sourcemaps.init())
    .pipe(project());

  return merge(
    result.js.pipe(sourcemaps.write('.', { sourceRoot: '../src' })).pipe(gulp.dest('dist')),
    result.dts.pipe(gulp.dest('typings'))
  );
};

gulp.task('default', build);
gulp.task('build', build);

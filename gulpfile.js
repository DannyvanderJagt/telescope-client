import Gulp from 'gulp';
import Path from 'path';
import Babel from 'gulp-babel';
import Watch from 'gulp-watch';
import Fs from 'fs-extra';
import Plumber from 'gulp-plumber';

let paths = [
  {
    input: Path.join(__dirname, '/src/**/*.js'),
    output: Path.join(__dirname, '/dist'),
  },
]


let tasks = {
  allPaths(){
    paths.forEach((path) => {
      Fs.emptyDirSync(path.output);
      return tasks.path(path);
    })
  },
  path(path){
    console.log('> ' + path.input)

    return Gulp.src(path.input)
      .pipe(Plumber())
      .pipe(Babel({
        presets: ['es2015']
      }))
      .pipe(Gulp.dest(path.output))
  }
}


Gulp.task('js', tasks.allPaths);

Gulp.task('watch', () => {
  paths.forEach((path) => {
    Watch(path.input, tasks.path.bind(null, path));
  })
})

Gulp.task('default', ['js', 'watch']);
### About
[PostCss](https://github.com/postcss/postcss) processor for generate addition css ruless to add webp compatble

Using with gulp-postcss
```js
var postcss = require('gulp-postcss')
var gulp = require('gulp')
var autoprefixer = require('autoprefixer-core')
var webpcsstransform = require('webpcss-transform');

gulp.task('css', function () {
    var processors = [
        autoprefixer('last 1 version'),
        webpcsstransform.processor()
    ];
    return gulp.src('./src/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dest'));
});
```

[![Build Status](https://travis-ci.org/lexich/webpcss.svg?branch=0.0.3)](https://travis-ci.org/lexich/webpcss)
### About
[PostCSS](https://github.com/postcss/postcss) processor to add links to WebP images for browsers that support it.

WebP is image format that is smaller, that PNG or JPEG, but it is [supported](http://caniuse.com/webp) only by Chrome.

### Plugins for intergation with popular frontend build systems
* [grunt-webpcss](https://github.com/lexich/grunt-webpcss)
* [gulp-webpcss](https://github.com/lexich/gulp-webpcss)

### Examples

Using with [gulp-postcss](https://github.com/w0rm/gulp-postcss):

```js
var gulp = require('gulp');
var webp = require('gulp-webp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var webpcss = require('webpcss-transform');

gulp.task('webp', function () {
    return gulp.src('./images/*.{png,jpg}')
        .pipe(webp())
        .pipe(gulp.dest('./images'));
});

gulp.task('css', function () {
    var processors = [
        autoprefixer,
        webpcss.webpcss
    ];
    return gulp.src('./src/*.css')
        .pipe( postcss(processors) )
        .pipe( gulp.dest('./dist') );
});
gulp.task('default',['webp', 'css']);
```

Results of webpcss processor.

```css
//Source:
.icon { background-image: url('../images/icon.png') }

//Result:
.icon { background-image: url('../images/icon.png') }
.webp .icon { background-image: url('../images/icon.webp') }
```

Results of webp task.
webp task appends .webp images for every .png image.
```sh
#Source
> ls images
icon.png

#Result
> ls images
icon.png icon.webp
```


To checks browser support of webp format need to use [Modernizr](http://modernizr.com/) which adds `.webp` class to `body` if browser support WebP and browser will download smaller WebP image instead of bigger PNG.

[![Build Status](https://travis-ci.org/lexich/webpcss.svg)](https://travis-ci.org/lexich/webpcss)
[![NPM version](https://badge.fury.io/js/webpcss.svg)](http://badge.fury.io/js/webpcss)
[![Coverage Status](https://coveralls.io/repos/lexich/webpcss/badge.png)](https://coveralls.io/r/lexich/webpcss)
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
    return gulp.src('./images/*.{png,jpg,jpeg}')
        .pipe(webp())
        .pipe(gulp.dest('./images'));
});

gulp.task('css', function () {
    var processors = [
        autoprefixer,
        webpcss
    ];
    return gulp.src('./src/*.css')
        .pipe( postcss(processors) )
        .pipe( gulp.dest('./dist') );
});
gulp.task('default',['webp', 'css']);
```

Results of webpcss processor.

```css
/* Source */
.icon { background-image: url('../images/icon.png') }

/* Result */
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

### Options

- `baseClass`  
Type: String Default value: '.webp'  
Class which prepend selector. For expample:
before

```css
.test { background-image:url('test.png'); }
```

after

```css
.test { background-image:url('test.png'); }
.webp .test { background-image:url('test.webp'); }
```
.webp class indicate webp browser support. Recommends to use [Modernizr](http://modernizr.com/)

- `replace_from`  
Type: RegExp Default value: /\.(png|jpg|jpeg)/  
RegExp pattern for replace

- `replace_to`  
Type: String Default value: .webp  
To checks browser support of webp format need to use [Modernizr](http://modernizr.com/) which adds `.webp` class to `body` if browser support WebP and browser will download smaller WebP image instead of bigger PNG.

- `process_selector`  
Type: function(selector, baseClass)  
modify `selector` with `baseClass`  

### Changelog
- 0.0.7 - fix bug with multiple selectors
- 0.0.6 - add process_selector options for transform selectors
- 0.0.5 - update api according postcss convention

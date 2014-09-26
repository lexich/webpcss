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
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var webpcss = require('webpcss-transform');

gulp.task('css', function () {
    var processors = [
        autoprefixer,
        webpcss.processor()
    ];
    return gulp.src('./src/*.css')
        .pipe( postcss(processors) )
        .pipe( gulp.dest('./dest') );
});
```

It will compile:

```css
.icon { background-image: url('icon.png') }
```

to:

```css
.icon { background-image: url('icon.png') }
.webp .icon { background-image: url('icon.webp') }
```

[Modernizr](http://modernizr.com/) adds `.webp` class to `body` if browser support WebP and browser will download smaller WebP image instead of bigger PNG.

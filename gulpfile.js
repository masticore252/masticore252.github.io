var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var cp = require('child_process');
var browserSync = require('browser-sync');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Compile files
const sassCompile = function (done) {
    gulp.src('assets/css/scss/main.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));

        done();
}

// Compression images
const img = function(done) {
	return gulp.src('assets/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
    .pipe(gulp.dest('_site/assets/img'))
    .pipe(browserSync.reload({stream:true}));

    done();
}

// Build the Jekyll Site
const jekyllBuild = function (done) {
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
};

// Rebuild Jekyll and page reload
const jekyllRebuild = gulp.series(jekyllBuild, function (done) {
    browserSync.reload();
    done();
});

// Wait for jekyll-build, then launch the Server
const browserSyncTask = gulp.series(sassCompile, img, jekyllBuild, function(done) {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
    done();
});


gulp.watch('assets/css/scss/**/*.scss', sassCompile);
gulp.watch('assets/js/**/*.js', jekyllRebuild);
gulp.watch('assets/img/**/*', img);
gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_pages/*.html', '_posts/*'], jekyllRebuild);


//  Default task
// exports.default = gulp.series(browserSync, watch);
exports.default = browserSync;

// Other tasks
exports.jekyllBuild = jekyllBuild;
exports.jekyllRebuild = jekyllRebuild;
exports.browserSync = browserSyncTask;
exports.sass = sassCompile;
exports.img = img;

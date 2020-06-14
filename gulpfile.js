var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var cp = require('child_process');
var browserSync = require('browser-sync');

// Compile Sass files
const sassCompile = function (done) {
    return gulp.src('assets/css/scss/main.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(gulp.dest('assets/css'));
}

// Compile javascript with babel
const babelCompile = function(done) {
    return gulp.src('assets/js/**/*.js')
        .pipe(gulp.dest('_site/assets/js'));
}

// Compress images
const imgCompress = function(done) {
    return gulp.src('assets/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('_site/assets/img'));
}

// Build the Jekyll Site
const jekyllBuild = function (done) {
    return cp.spawn( 'bundle' , ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
        .on('close', done);
};

// Page reload
const browserSyncReload = function (done) {
    browserSync.reload();
    done();
};

// Start the BrowserSync Server
const browserSyncStart = function (done) {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
    done();
};

// watch for changes
const watch = function(done) {
    gulp.watch('assets/img/**/*',           gulp.series(imgCompress, browserSyncReload));
    gulp.watch('assets/js/**/*.js',         gulp.series(babelCompile,browserSyncReload));
    gulp.watch('assets/css/scss/**/*.scss', gulp.series(sassCompile, browserSyncReload));
    gulp.watch([
            '*.html',
            '_layouts/*.html',
            '_includes/*.html',
            '_pages/*.html',
            '_posts/*',
            '_config.yml'
        ],
        gulp.series(jekyllBuild, browserSyncReload)
    );
    done();
};


// Other tasks
exports.img = imgCompress;
exports.sass = sassCompile;
exports.babel = babelCompile;
exports.jekyll = jekyllBuild;

exports.watch = gulp.series(
    gulp.parallel(
        sassCompile,
        babelCompile,
        imgCompress
    ),
    jekyllBuild,
    browserSyncStart,
    watch,
);

// Default task
module.exports.default = exports.watch;



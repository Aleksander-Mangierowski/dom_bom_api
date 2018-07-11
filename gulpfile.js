const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;


const src = {
    sass: 'sass/**/*.scss',
    css: 'css',
    html: '*.html'
};

gulp.task('clean', function () {
    return del('root');
});

gulp.task('sass', function () {

    return gulp.src('sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(src.css))
        .pipe(reload({ stream: true }));
});

gulp.task('watch', function () {

    browserSync.init({
        // server: "./"
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(src.sass, gulp.series('clean', 'sass'));
    gulp.watch(src.html).on('change', reload);
});

gulp.task('default', gulp.series('clean', 'sass', 'watch'));
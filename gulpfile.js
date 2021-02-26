const gulp = require('gulp');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const template = require('gulp-template');
const merge = require('merge-stream');
const run = require('gulp-run');
const replace = require('gulp-replace');

let appIcon = null;
let lang = null;
let localeData = null;

gulp.task('copy', () => {
    let p1 = gulp.src(['index.html']).pipe(gulp.dest('tizen/dist/' + lang + '/'));

    let p2 = gulp.src(['dist/tv7SamsungNg/**/*.js']).pipe(gulp.dest('tizen/dist/' + lang + '/js'));

    let p3 = gulp.src(['dist/tv7SamsungNg/styles.css']).pipe(gulp.dest('tizen/dist/' + lang + '/css'));

    let p4 = gulp.src(['dist/tv7SamsungNg/assets/**/*.*']).pipe(gulp.dest('tizen/dist/' + lang + '/assets'));

    return merge(p1, p2, p3, p4);
});

gulp.task('build', () => {
    return run('npm run build-prod').exec();
});

/**
 * Edits 'src/app/services/locale.service.ts' file. Adds:
 *  - selected locale
 *  - app name
 *  - app version
 */
gulp.task('editServiceFile', () => {
    let target = 'const selectedLocale: string = \'' + lang + '\';';

    return gulp.src(['src/app/services/locale.service.ts'])
        .pipe(replace(/const selectedLocale: string[^\n]*/g, target))
        .pipe(replace(/const appName: string =[^\n]*/g, 'const appName: string = \'' + localeData.channelName + '\';'))
        .pipe(replace(/const appVersion: string =[^\n]*/g, 'const appVersion: string = \'' + localeData.configXmlVersion + '\';'))
        .pipe(gulp.dest('src/app/services/'));
});

gulp.task('renameAppIcon', () => {
    return gulp.src([
        'tizen/config/icon/' + appIcon
    ]).pipe(rename('tv7icon_117x117.png')).pipe(gulp.dest('tizen/dist/' + lang + '/'));
});

gulp.task('editFiles', () =>
    gulp.src([
        localeData.tizenFolder + '/config/config.xml',
        localeData.tizenFolder + '/config/.project',
        localeData.tizenFolder + '/config/.tproject'
    ])
    .pipe(template({
        channelName: localeData.channelName,
        configXmlId: localeData.configXmlId,
        configXmlVersion: localeData.configXmlVersion,
        configXmlName: localeData.configXmlName,
        configXmlPackage: localeData.configXmlPackage,

    })).pipe(gulp.dest('tizen/dist/' + lang + '/'))
);

gulp.task('clean', () => {
    let p1 = gulp.src('dist', {read: false, allowEmpty: true}).pipe(clean());

    let p2 = gulp.src('tizen/dist/' + lang, {read: false, allowEmpty: true}).pipe(clean());

    return merge(p1, p2);
});

gulp.task('cleanBuildDirs', () => {
    let p1 = gulp.src('tizen/dist/fi', {read: false, allowEmpty: true}).pipe(clean());

    let p2 = gulp.src('tizen/dist/et', {read: false, allowEmpty: true}).pipe(clean());

    let p3 = gulp.src('tizen/dist/ru', {read: false, allowEmpty: true}).pipe(clean());

    let p4 = gulp.src('tizen/dist/sv', {read: false, allowEmpty: true}).pipe(clean());

    let p5 = gulp.src('dist' + lang, {read: false, allowEmpty: true}).pipe(clean());

    return merge(p1, p2, p3, p4, p5);
});

loadLocale = ((cb) => {
    console.log('Arguments: ', process.argv);

    lang = process.argv[process.argv.length - 1];

    if (lang === 'fi') {
        appIcon = 'taivas_117x117.png';
        localeData = require('./locale/fi.json');
    }
    else if (lang === 'et') {
        appIcon = 'taevas_117x117.png';
        localeData = require('./locale/et.json');
    }
    else if (lang === 'sv') {
        appIcon = 'himlen_117x117.png';
        localeData = require('./locale/sv.json');
    }
    else if (lang === 'ru') {
        appIcon = 'nebesa_117x117.png';
        localeData = require('./locale/ru.json');
    }

    console.log('Locale data: ', localeData);

    cb();
})

const fi = gulp.series(
    loadLocale, 
    'clean',
    'editFiles',
    'renameAppIcon',
    'editServiceFile',
    'build',
    'copy'
);

const et = gulp.series(
    loadLocale, 
    'clean',
    'editFiles',
    'renameAppIcon',
    'editServiceFile',
    'build',
    'copy'
);

const ru = gulp.series(
    loadLocale, 
    'clean',
    'editFiles',
    'renameAppIcon',
    'editServiceFile',
    'build',
    'copy'
);

const sv = gulp.series(
    loadLocale, 
    'clean',
    'editFiles',
    'renameAppIcon',
    'editServiceFile',
    'build',
    'copy'
);

const cleanBuilds = gulp.series(
    'cleanBuildDirs'
);

exports.fi = fi;
exports.et = et;
exports.ru = ru;
exports.sv = sv;

exports.cleanBuilds = cleanBuilds;

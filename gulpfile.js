//Подключаем модули галпа
const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require("imagemin-jpeg-recompress");


//Порядок подключения css файлов
const cssFiles = [
   // './node_modules/normalize.css/normalize.css',
   './src/css/reset.css',
   './src/css/fonts.css',
   './src/css/style.scss'
]
//Порядок подключения js файлов
// const jsFiles = [
//    './src/js/lib.js',
//    './src/js/main.js'
// ]

//Таск на стили CSS
function styles(){
   return gulp.src(cssFiles)
    //Преобразуем sass  в css
   .pipe(sass())
   // Объединяем в один файл с последующим переносом
   .pipe(concat('all.css'))
    //Добавить префиксы
   .pipe(autoprefixer({
      overrideBrowserslist: ['last 7 versions'],
      cascade: false
   }))
   //Минификация CSS
   .pipe(cleanCSS({
      level: 2
   }))
   .pipe(gulp.dest('dest/css'))
   .pipe(browserSync.stream());
}

//Таск на скрипты JS
function scripts() {
   //Шаблон для поиска файлов JS
   //Всей файлы по шаблону './src/js/**/*.js'
   return gulp.src('src/js/*.js')
   //Объединение файлов в один
   .pipe(concat('script.js'))
   // Минификация JS
   // .pipe(uglify({
   //    toplevel: true
   // }))
   //Выходная папка для скриптов
   .pipe(gulp.dest('dest/js'))
   .pipe(browserSync.stream());
}


function fonts() {
   return gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('dest/fonts'))
}

function libs() {
   return gulp.src('src/libs/**/*')
      .pipe(gulp.dest('dest/libs'))
}

function img() {
   return gulp
     .src(["src/img/*.jpg", "src/img/*.png"]) //Выберем наши картинки
     .pipe(gulp.dest("dest/img")) //Копируем изображения заранее, imagemin может пропустить парочку 
      .pipe(
      imagemin([
         imagemin.gifsicle({ interlaced: true }),
         imageminJpegRecompress({
         progressive: true,
         max: 80,
         min: 70
         }),
         imageminPngquant({
               quality: [0.6, 0.8]
            }),
         imagemin.svgo({ plugins: [{ removeViewBox: true }] })
      ])
   )
     .pipe(gulp.dest("dest/img")); //И бросим в prod отпимизированные изображения
}

//Удалить всё в указанной папке
function clean() {
   return del(['dest/*'])
}

//Просматривать файлы
function watch() {
   browserSync.init({
      server: {
         baseDir: './'
      }
   });
  //Следить за CSS файлами
   gulp.watch('./src/css/*.scss', styles)
  //Следить за JS файлами
   gulp.watch('./src/js/*.js', scripts)

   gulp.watch('./src/libs/*.*', libs)

   gulp.watch('./src/fonts/*.*', fonts)
  //При изменении HTML запустить синхронизацию
   gulp.watch("./*.html").on('change', browserSync.reload);
}

//Таск вызывающий функцию styles
gulp.task('styles', styles);
//Таск вызывающий функцию scripts
gulp.task('scripts', scripts);
//Таск для шрифтов
gulp.task('fonts', fonts);
gulp.task('libs', libs);

gulp.task('img', img)
//Таск для очистки папки build
gulp.task('del', clean);
//Таск для отслеживания изменений
gulp.task('watch', watch);
//Таск для удаления файлов в папке build и запуск styles и scripts
gulp.task('build', gulp.series(clean, gulp.parallel(styles,scripts,img, fonts, libs)));
//Таск запускает таск build и watch последовательно
gulp.task('dev', gulp.series('build','watch'));
var gulp = require("gulp"),
livereload = require('gulp-livereload'),
concat = require('gulp-concat');

gulp.task('default', ['watch']);

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('client/**/*.css', ['reload']);
	gulp.watch('sketch/**/*.js', ['concat', 'reload']);
	gulp.watch('client/**/*.html', ['reload']);
});

gulp.task('reload', function() {
	livereload.reload();
}); 

var sketchFolder = "sketch/";
var sketchFiles = [
	'mousemodeenum.js',
	'flowfield.js',
	'pattern.js',
	'perlin.js',
	'particle.js'
];

sketchFiles.forEach(function(fileName, index) {
	sketchFiles[index] = sketchFolder + fileName;
});

gulp.task('concat', function() {
	gulp.src(sketchFiles)
	.pipe(concat('concat.js'))
	.pipe(gulp.dest('./concat/'));
});

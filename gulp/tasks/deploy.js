import gulp from "gulp";
import ghPages from "gulp-gh-pages";

export const deploy = () => {
  return gulp.src(`${app.paths.base.build}/**/*`).pipe(ghPages());
};

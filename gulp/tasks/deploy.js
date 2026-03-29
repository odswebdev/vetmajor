import gulp from "gulp";
import ghPages from "gulp-gh-pages";

export const deploy = () => {
  return gulp
    .src("./dist/**/*")
    .pipe(
      ghPages({
        force: true,
        message: "deploy " + new Date().toISOString(),
      })
    );
};
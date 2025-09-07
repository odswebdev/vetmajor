import gulp from "gulp";
import { paths } from "../config/paths.js";

export const swiperCss = () => {
  return gulp
    .src("node_modules/swiper/swiper-bundle.css")
    .pipe(gulp.dest(paths.buildCssFolder));
};

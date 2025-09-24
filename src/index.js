import gsap from 'gsap';
// Global styles entry (was previously linked via index.min.css)
import './sass/index.scss';
import './components/Quotes/quotes';
import './components/Background/background';
import './components/FavoritesList/favoriteList';
import './components/FavoritesList/mobile-carousel';
import './components/WeatherData/five-days';
import './components/WeatherData/currentDayData';
import './components/Buttons/buttons';
import './components/Chart/chart';

function animateSquares() {
  const cubeFirst = document.querySelector('.cube-first');
  const cubeSecond = document.querySelector('.cube-second');

  if (!cubeFirst || !cubeSecond) return; // Defensive in case DOM not yet ready

  gsap.to(cubeFirst, {
    duration: 30,
    x: 1200,
    y: 600,
    rotate: 400,
    repeat: -1,
    yoyo: true,
  });

  gsap.to(cubeSecond, {
    duration: 30,
    x: -1000,
    y: 800,
    rotate: 400,
    repeat: -1,
    yoyo: true,
  });
}

document.addEventListener('DOMContentLoaded', animateSquares);

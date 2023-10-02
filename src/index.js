import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import * as Notiflix from 'notiflix';
import { refs } from './js/refs';
import { fetchImages } from './js/axios';
import { renderImages } from './js/renderImeges';

refs.form.addEventListener('submit', renderGalleryInterface);
refs.loadMoreBtn.addEventListener('click', pagination);

const lightbox = new SimpleLightbox('.gallery a');
let perPage = 40;
let currentPage = 0;

async function renderGalleryInterface(event) {
  event.preventDefault();
  currentPage = 1;
  const searchQuery = event.target.searchQuery.value.trim();
  refs.gallery.innerHTML = '';

  if (!searchQuery) {
    Notiflix.Notify.failure('Please, enter some words');
    return;
  }

  try {
    const data = await fetchImages(searchQuery, currentPage);

    if (data.totalHits === 0) {
      Notiflix.Notify.warning('Sorry, no images were found for your request');
      return;
    }

    renderImages(data.hits);
    lightbox.refresh();
    const totalPages = Math.ceil(data.totalHits / perPage);

    if (totalPages > 1) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    } else {
      refs.loadMoreBtn.classList.add('is-hidden');
    }

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

async function pagination() {
  currentPage += 1;
  const searchQuery = refs.input.value;
  const dataImg = await fetchImages(searchQuery, currentPage);
  const totalPages = Math.ceil(dataImg.totalHits / perPage);

  if (currentPage === totalPages) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info('All images loaded!');
  }

  if (currentPage > totalPages) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  
  try {
    const data = await fetchImages(searchQuery, currentPage);

    if (data.totalHits === 0) {
      Notiflix.Notify.warning('Sorry, no images were found for your request');
      return;
    }

    renderImages(data.hits);
    catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
  lightbox.refresh();
}

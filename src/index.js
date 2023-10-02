import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import * as Notiflix from 'notiflix';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '39775256-103811d0d2e2705907a87b65c';
const perPage = 40;
let currentPage = 1;
let totalPages;
let searchQuery = '';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', renderGalleryInterface);
refs.loadMoreBtn.addEventListener('click', pagination);

const lightbox = new SimpleLightbox('.gallery a');

async function fetchImages(searchRequest, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${searchRequest}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
    );

    if (!response || !response.data || !response.data.hits) {
      console.error('Unexpected response format:', response);
      throw new Error('Invalid response format');
    }

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching images');
  }
}

function renderImages(images) {
  const markup = images
    .map(
      ({
        likes,
        webformatURL,
        largeImageURL,
        tags,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
        <a href="${largeImageURL}" class="lightbox-trigger">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${downloads}
          </p>
        </div>
      </div>`
    )
    .join(' ');
  refs.gallery.innerHTML = markup;
}

async function renderMoreImages() {
  try {
    const data = await fetchImages(searchQuery, currentPage);

    if (data.totalHits === 0) {
      Notiflix.Notify.warning('Sorry, no images were found for your request');
      return;
    }

    renderImages(data.hits);
    lightbox.refresh();
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

async function renderGalleryInterface(event) {
  event.preventDefault();
  currentPage = 1;
  searchQuery = event.target.searchQuery.value.trim();

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
    totalPages = Math.ceil(data.totalHits / perPage);

    if (totalPages > 1) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    } else {
      refs.loadMoreBtn.classList.add('is-hidden');
    }

    lightbox.refresh();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

async function pagination() {
  currentPage += 1;
  let limit = 40;

  const dataImg = await fetchImages(searchQuery, currentPage);

  if (currentPage === totalPages) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info('All images loaded!');
  }

  if (currentPage * limit === dataImg.totalHits) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  await renderMoreImages(dataImg, currentPage);
}

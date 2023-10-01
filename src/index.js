import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import * as Notiflix from 'notiflix';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '39775256-103811d0d2e2705907a87b65c';
const perPage = 40;
let currentPage = 1;
let totalPages;

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', renderGalleryInterface);
refs.loadMoreBtn.addEventListener('click', pagination);

async function fetchImages(searchRequest) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${searchRequest}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${currentPage}`
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

function renderMoreImages(moreImages) {
  const markup = moreImages
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
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function paginationInit(data) {
  totalPages = Math.ceil(data.totalHits / perPage);
  if (totalPages > 1) {
    refs.loadMoreBtn.classList.remove('is-hidden');
  } else {
    refs.loadMoreBtn.classList.add('is-hidden');
  }
  return totalPages;
}

function initLightBox() {
  const lightbox = new SimpleLightbox('.lightbox-trigger');
}

function resetLightBox() {
  const lightboxElement = document.querySelector('.gallery');
  lightboxElement.innerHTML = '';
  initLightBox();
}

async function renderGalleryInterface(event) {
  event.preventDefault();
  refs.loadMoreBtn.classList.add('is-hidden');
  const searchRequest = event.target.searchQuery.value.trim();
  if (!searchRequest) {
    Notiflix.Notify.failure('Please, enter some words');
    return;
  }
  try {
    const data = await fetchImages(searchRequest);
    if (data.totalHits === 0) {
      Notiflix.Notify.warning('Sorry, no images were found for your request');
      return;
    }
    renderImages(data.hits);
    initLightBox();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    paginationInit(data);
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

async function pagination() {
  const searchRequest = refs.form.elements.searchQuery.value;

  if (currentPage >= totalPages) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info('All images loaded!');
    return;
  }

  currentPage += 1;
  try {
    const response = await fetchImages(searchRequest);

    if (!response || !response.data || !response.data.hits) {
      // Handle the case where 'hits' is not available in the response
      Notiflix.Notify.info('No more images to load.');
      refs.loadMoreBtn.classList.add('is-hidden');
      return;
    }

    const { data } = response;
    if (data.hits.length === 0) {
      Notiflix.Notify.info('No more images to load.');
      refs.loadMoreBtn.classList.add('is-hidden');
      return;
    }
    renderMoreImages(data.hits);
    totalPages = paginationInit(data);
    resetLightBox();
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

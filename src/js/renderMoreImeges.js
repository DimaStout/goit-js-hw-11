import { fetchImages } from './axios';
import * as Notiflix from 'notiflix';
import { renderImages } from './renderImeges';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
export async function renderMoreImages() {
  try {
    const data = await fetchImages(searchQuery, currentPage);

    if (data.totalHits === 0) {
      Notiflix.Notify.warning('Sorry, no images were found for your request');
      return;
    }

    renderImages(data.hits);
    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  }
}

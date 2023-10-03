import axios from 'axios';
export async function fetchImages(searchRequest, page) {
  axios.defaults.baseURL = 'https://pixabay.com/api/';
  const API_KEY = '39775256-103811d0d2e2705907a87b65c';
  const perPage = 40;
  let searchQuery = '';

  const response = await axios.get(
    `https://pixabay.com/api/?key=${API_KEY}&q=${searchRequest}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
  );

  if (!response || !response.data || !response.data.hits) {
    console.error('Unexpected response format:', response);
    throw new Error('Invalid response format');
  }
  return response.data;
}

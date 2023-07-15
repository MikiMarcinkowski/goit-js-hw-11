const API_KEY = '38204565-e1c6da6c21cb945f8fad8b6c2';

import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const createGalleryItems = itemInfo => {
  const imgCards = itemInfo.map(itemData => {
    return `<div class="photo-card">
        <a href="${itemData.largeImageURL}"><img src="${itemData.webformatURL}" alt="${itemData.tags}" loading="lazy" /></a>
        <div class="info">
            <p class="info-item"><b>Likes</b>${itemData.likes}</p>
            <p class="info-item"><b>Views</b>${itemData.views}</p>
            <p class="info-item"><b>Comments</b>${itemData.comments}</p>
            <p class="info-item"><b>Downloads</b>${itemData.downloads}</p>
        </div>
        </div> `;
  });
  return imgCards.join('');
};

const gallery = document.querySelector('.gallery');
const searchBtn = document.querySelector('[type="submit"]');
const input = document.querySelector('[name="searchQuery"]');
const loadMoreBtn = document.querySelector('.load-more');
const body = document.querySelector('body');


let page = null;
let totalHits = null;
let searchValue = null;
loadMoreBtn.style.display = 'none';

const lightbox = new simpleLightbox('.gallery a');

const onClickSearch = (event) => {
  event.preventDefault();
  if (input.value.trim() === '') {
    return;
  }

  page = 1;
  searchValue = input.value;
  getGalleryItem().then(itemData => {
    if (!itemData) {
      gallery.innerHTML = '';
      
    }

    gallery.innerHTML = createGalleryItems(itemData);

    lightbox.refresh();

  

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    loadMoreBtn.style.display = 'block';

    if (totalHits <= 40) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.style.display = 'none';
    }
  });
}
searchBtn.addEventListener('click', onClickSearch);

const onClickLoadMore = () => {
  page += 1;

  getGalleryItem().then(itemData => {
    gallery.insertAdjacentHTML('beforeend', createGalleryItems(itemData));
    lightbox.refresh();

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (page === Math.ceil(totalHits / 40)) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.style.display = 'none';
    }
  });
}
loadMoreBtn.addEventListener('click', onClickLoadMore);

const getGalleryItem = async () => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: `${searchValue}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: `${page}`,
        per_page: 40,
      },
    });
    const itemData = response.data.hits;
    totalHits = response.data.totalHits;
    if (itemData.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return itemData;
  } catch (error) {
    console.error(error);
  }
};


const handleScroll = () => {
  // Jeśli użytkownik przewinął do końca strony
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    // Tutaj można wykonać żądanie AJAX lub inny sposób ładowania nowych zawartości
    onClickLoadMore();
    loadMoreBtn.style.display = 'none';
    // Na przykład:
    // fetch('url-do-danych-nowej-zawartosci')
    //   .then(response => response.json())
    //   .then(data => {
      //     // Przetwarzanie danych i dodawanie ich do istniejącego kontenera
      //   });
    }
  }
  window.addEventListener('scroll', handleScroll);

  
const API_KEY = '38204565-e1c6da6c21cb945f8fad8b6c2';

import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const createGalleryCards = cardInfo => {
  const imgCards = cardInfo.map(cardData => {
    return `<div class="photo-card">
        <a href="${cardData.largeImageURL}"><img src="${cardData.webformatURL}" alt="${cardData.tags}" loading="lazy" /></a>
        <div class="info">
            <p class="info-item"><b>Likes</b>${cardData.likes}</p>
            <p class="info-item"><b>Views</b>${cardData.views}</p>
            <p class="info-item"><b>Comments</b>${cardData.comments}</p>
            <p class="info-item"><b>Downloads</b>${cardData.downloads}</p>
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


let cardPage = null;
let totalHits = null;
let searchValue = null;
loadMoreBtn.style.display = 'none';

const lightbox = new simpleLightbox('.gallery a');

function onClickSearch(event) {
  event.preventDefault();
  if (input.value.trim() === '') {
    return;
  }

  cardPage = 1;
  searchValue = input.value;
  getCard().then(cardData => {
    if (!cardData) {
      gallery.innerHTML = '';
      // loadMoreBtn.style.display = 'none';
    }

    gallery.innerHTML = createGalleryCards(cardData);

    lightbox.refresh();

    // window.scrollTo({
    //   top: 0,
    //   behavior: 'smooth',
    // });

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

function onClickLoadMore() {
  cardPage += 1;

  getCard().then(cardData => {
    gallery.insertAdjacentHTML('beforeend', createGalleryCards(cardData));
    lightbox.refresh();

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (cardPage === Math.ceil(totalHits / 40)) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.style.display = 'none';
    }
  });
}
loadMoreBtn.addEventListener('click', onClickLoadMore);

async function getCard() {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: `${searchValue}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: `${cardPage}`,
        per_page: 40,
      },
    });
    const cardData = response.data.hits;
    totalHits = response.data.totalHits;
    if (cardData.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return cardData;
  } catch (error) {
    console.error(error);
  }
};

window.addEventListener('scroll', handleScroll);

  function handleScroll() {
    // Jeśli użytkownik przewinął do końca strony
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      onClickLoadMore();
      // Tutaj można wykonać żądanie AJAX lub inny sposób ładowania nowych zawartości
      // Na przykład:
      // fetch('url-do-danych-nowej-zawartosci')
      //   .then(response => response.json())
      //   .then(data => {
      //     // Przetwarzanie danych i dodawanie ich do istniejącego kontenera
      //   });
    }
  }

  
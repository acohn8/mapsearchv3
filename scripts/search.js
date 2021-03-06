foursquareKey = 'LGVNCYIU5YP2WT4PCRYZP0XS1EJPIRLZZDLJF3QU1YTYDMD5&v=20180622';
class Search {
  constructor(searchTerm) {
    this.searchTerm = searchTerm;
  }

  searchCoords() {
    loadedMap.clearPoints();
    if (userLocation.length !== 0) {
      return [userLocation[1], userLocation[0]];
    }
    return [loadedMap.map.getCenter().lat, loadedMap.map.getCenter().lng];
  }

  searchByView() {
    if (userLocation.length === 2) {
      const disclaimerDiv = document.querySelector('#search-disclaimer > div > button');
      disclaimerDiv.addEventListener('click', () => {
        userLocation = [];
        disclaimerDiv.innerHTML = '';
      });
    }
  }

  search() {
    return fetch(`https://api.foursquare.com/v2/venues/search?ll=${this.searchCoords()[0]},${this.searchCoords()[1]}&query=${this.searchTerm}&oauth_token=${foursquareKey}`)
      .then(res => res.json()).then(json => this.createVenues(json));
  }

  addSearchResults() {
    Venue.all.forEach(venue => venue.appendResults());
  }

  createVenues(venues) {
    return new Promise((resolve) => {
      venues.response.venues.forEach((venue) => {
        resolve(new Venue(venue.name, venue.location.lat, venue.location.lng, venue.location.formattedAddress, venue.categories[0].name, venue.contact.formattedPhone, venue.id));
      });
    }).then(sortByDistance())
      .then(loadedMap.plotVenues())
      .then(this.addSearchResults())
      .then(Venue.all.forEach(venue => venue.infoPage()));
  }
}

function enableSearch() {
  const searchForm = document.querySelector('form#search');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchBox = document.getElementById('inputLarge search-box');
    const foursquareSearch = new Search(searchBox.value);
    foursquareSearch.search();
    if (userLocation.length === 2) {
      foursquareSearch.searchByView();
    }
  });
}

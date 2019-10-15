


function searchMovies() {
  
  $('#form').submit(event=> {
    event.preventDefault();
    let searchTitle = $('#search').val();
$.ajax({
  url: 'https://tastedive.com/api/similar',
  jsonp: 'callback',
  dataType: 'jsonp',
  data: {
    q: searchTitle,
    type: 'movies',
    info: 1,
    limit: 10,
    k: '345649-moviesea-TSGG8UJ7',
  },
  success: handleSuccess,
  failure: handleError
})
})  
function handleError(response) {
  console.log('ERROR:', response)
}

function handleSuccess(response) {
  const titles = response.Similar.Results.map(r => r.Name)
  return getTmdbIds(titles) 
}

}

function getTmdbIds(titles) {
  const url = 'https://api.themoviedb.org/3/search/movie'
  const api = '77c592d3ee432d841bea6da44a795419' 
  const titlePromises = titles.map(t => fetch(`${url}?api_key=${api}&query=${t}`))
  return Promise.all(titlePromises)
    .then(res => Promise.all(res.map(r => r.json())))
    .then(res => res.map(d => d.results[0]))
    .then(data => data.map(d => ({ id: d.id, title: d.title })))
    .then(getTmdbReviews)
    
}

async function getTmdbReviews(movies) {
  const url = 'https://api.themoviedb.org/3/movie'
  const api = '77c592d3ee432d841bea6da44a795419'
  const promises = movies.map(m => fetch(`${url}/${m.id}/reviews?api_key=${api}`))
  Promise.all(promises)
    .then(res => Promise.all(res.map(r => r.json())))
    .then(reviews => 
      reviews.map((r, i) => {
        if (r.results.length)
          r.results[0].title = movies[i].title
        return r
      })
    )
    .then(reviews => 
      reviews.map(d => d.results[0]).filter(Boolean)
    )
    .then(renderResults)
    // https://api.themoviedb.org/3/movie/343611/reviews?api_key=77c592d3ee432d841bea6da44a795419
}

function renderResults(reviews){
  $('#results-list').html('');
  reviews.forEach((review, i ) => {
    $('#results-list').append(`
      <li>
        <h2>${review.title}</h2>
        <dl>
          <dt>Review Author: </dt>
          <dd> ${review.author}</dd><br>        
          <dt>Summary: </dt>
          <dd>${summarise(review.content)}</dd>
          <dt>Continue Reading:</dt>
          <dd><a href="${review.url}" target="_blank">go to review</a></dd>
        </dl>
      </li>
    `)
  })

  return $('#results').removeClass('hidden');
}


function summarise(review) {
  if (review.length > 240)
    review = review.substring(0, 500) + '…'
  return formatSummary(review)
}

function formatSummary(review) {
  return `<p>${review.replace(/\r\n/g,'\n\n').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br />')}</p>`; 
 }

$(searchMovies);

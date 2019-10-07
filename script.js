/*
function getMovies(searchTitle){
    const api = '345649-moviesea-TSGG8UJ7';
    const url = 'https://tastedive.com/api/similar';   
    const params = formatQuery({
        q: searchTitle,
        type: 'movie',
        // info: 1,
        // limit: 10,
        k: api,
        callback: console.log
    })    
     return $.ajax({
        url: url,
        jsonp: 'callback',
        dataType: 'jsonp',
        data: {
          q: searchTitle,
          type: 'movie',
          info: 1,
           limit: 10,
          k: api,
        },
        success: renderResults,
        failure: renderError
    })
    }
    
    function renderError(err){
        return $('#error-message')
        .text(`Something went wrong:  ${err.message}`);
    }
    
    function formatQuery(params){
        const queryItems =
        Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        return queryItems.join('&');
    }

    function getReviews(searchID) {
    const params2 = formatQuery({
        "id": searchId,
        "page": 1,
        api_key: '77c592d3ee432d841bea6da44a795419'
    })
    const reviews = $.ajax({
           url: 'https://api.themoviedb.org/3/search/reviews?' + params2,
           success: renderReviews,
            failure: renderError,
})
}

function renderReviews(response){
    $('#results-list').empty();
    for (let results of response.results) {
      console.log(result)
        $('#results-list').append(
            `<li><h3>Review</h3>
            <p>${results.content}</p>            
            </li>`
        )
    }
    return $('#results').removeClass('hidden');
}
    function renderResults(data){
        $('#results-list').empty();
        for (let result of data.Similar.Results) {
          console.log(result)
          getReviews(result.Name);
            $('#results-list').append(
                `<li><h3>${result.Name}</h3>
                <p>${result.wTeaser}</p>
                <a href='${result.yUrl}'> Youtube Link</a>
                
                </li>`
            )
        }
        return $('#results').removeClass('hidden');
    }
    function searchMovies() {
        $('#form').submit(event=> {
          event.preventDefault();
          const searchTitle = $('#search').val();
         
              getMovies(searchTitle),
             // getReviews(searchTitle)
                   
      }) 
  }  

//   function getMovieTrailersFor(movies) {
//     // ['Home Alone', 'Terminator']
//     movies = movies.map(movie => fetch('findtrailers.com/movies/' + movie))
//     // [ PendingPromise<>, PendingPromise<> ]
//     return Promise.all(movies)
//   }    
    $(function(){
        console.log('app loaded');
        $(searchMovies);
    })

*/



// First make a call to tastedive to find movie titles
$(function(){
  console.log('app loaded');
  $(searchMovies);
})
function searchMovies() {
  $('#form').submit(event=> {
    event.preventDefault();
    const searchTitle = $('#search').val();
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
    
function handleError(response) {
  console.log('ERROR:', response)
}

function handleSuccess(response) {
  const titles = response.Similar.Results.map(r => r.Name)
  return getTmdbIds(titles) 
}
  })
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

  reviews.forEach((review, i ) => {
    $('#results-list').append(`
      <li>
        <h2>${review.title}</h2>
        <dl>
          <dt>Author:</dt>
          <dd>${review.author}</dd>
          <dt>Review URL:</dt>
          <dd><a href="${review.url}">Link</a></dd>
          <dt>Summary:</dt>
          <dd>${summarise(review.content)}</dd>
        </dl>
      </li>
    `)
  })

  return $('#results').removeClass('hidden');
}

function summarise(review) {
  if (review.length > 240)
    review = review.substring(0, 240) + '…'
  return formatSummary(review)
}

function formatSummary(review) {
  return `<p>${review.replace(/\r\n/g,'\n\n').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br />')}</p>` 
 }
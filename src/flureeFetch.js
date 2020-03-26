import fetch from 'isomorphic-fetch';

// function isDevelopment() {
//   return (process.env.NODE_ENV === "development");
// }

function parseJSON(response) {
  return response.json().then(function(json) {
    const newResponse = Object.assign(response, { json });
    if (response.status < 300) {
      return newResponse;
    } else {
      throw newResponse;
    }
  });
}

function fetchResp(fullUri, fetchOpts) {
  return fetch(fullUri, fetchOpts)
    .then(parseJSON)
    .then(resp => resp.json)
    .catch(error => {
      let errorMessage = error.message || (error.json && error.json.message);
      throw new Error(errorMessage);
    });
}

var flureeFetch = (uri, body) => {
  // const isDev =   isDevelopment();
  let fullUri = 'http://localhost:8080/fdb/credentials/demo' + uri;

  if (uri === '/new-db') {
    fullUri = 'http://localhost:8080/fdb/new-db';
  }

  var fetchOpts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };

  return new Promise((resolve, reject) => {
    fetchResp(fullUri, fetchOpts)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
};

export { flureeFetch, parseJSON };

const nodeFetch = require('node-fetch');

const makeHeadersToGetCode = (clientId, clientSecretUrlEncoded) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecretUrlEncoded}`).toString('base64')}`,
  };
  return headers;
};

const getTokensWithCode = (url, codeP, redirectUri, headers, fetch = nodeFetch) => {
  const grantType = 'authorization_code';
  // const url = 'https://account-idetest.agetic.gob.bo/token';
  const bodyP = `grant_type=${grantType}&code=${codeP}&redirect_uri=${redirectUri}`;
  return fetch(url, {
    method: 'POST',
    headers,
    body: bodyP,
  }).then((res) => Promise.resolve(res.json())).catch((err) => Promise.reject(err));
};
const getUserIdentity = (url, accessToken, fetch = nodeFetch) => {
  // const url = 'https://account-idetest.agetic.gob.bo/me';
  const headers = { Authorization: `Bearer ${accessToken}` };
  return fetch(url, {
    method: 'GET',
    headers,
  }).then((res) => Promise.resolve(res.json())).catch((err) => Promise.reject(err));
};


module.exports = {
  makeHeadersToGetCode,
  getTokensWithCode,
  getUserIdentity,
};

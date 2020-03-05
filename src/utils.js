const fs = require('fs');
const api = require('apicalypse').default;

const API_KEY = ''; // Your IGDB API key;

// General
const getStandardDeviation = (mean, data) => Math.sqrt(
  data
    .map(value => (value - mean) ** 2)
    .reduce((acc, cur) => acc + cur, 0) /
  data.length
);

const getTotalRatingCount = data => data.map(item => item.total_rating_count || 0);
const getTotalRatingCountMean = data => {
  const totalRatingCount = getTotalRatingCount(data);

  return (
    totalRatingCount.reduce((acc, cur) => acc + cur, 0) /
    totalRatingCount.length
  );
};
const getSigmaOne = data => {
  const totalRatingCountMean = getTotalRatingCountMean(data);
  const totalRatingCountData = getTotalRatingCount(data);

  const standardDevidation = getStandardDeviation(
    totalRatingCountMean,
    totalRatingCountData
  );

  return (standardDevidation - (standardDevidation * 0.341));
};

// Scrape
const getDataFromIGDB = offset => api({
  headers: { 'user-key': API_KEY }
})
  .fields([
    'rating',
    'rating_count',
    'aggregated_rating',
    'aggregated_rating_count',
    'total_rating',
    'total_rating_count',
    'first_release_date',
    'hypes',
    'name',
    'franchise',
    'genres',
    'involved_companies',
    'platforms',
    'popularity',
    'cover'
  ])
  .limit(150)
  .offset(offset)
  .where('category = 0 & first_release_date > 788918400 & popularity > 1 & rating_count > 1 & version_parent = null')
  .sort('first_release_date')
  .request('https://api-v3.igdb.com/games');

const getCoversFromIGDB = covers => api({
  headers: { 'user-key': API_KEY }
})
  .fields(['url'])
  .where(covers.map(id => `id = ${id}`).join(' | '))
  .limit(150)
  .request('https://api-v3.igdb.com/covers');

const createDumpIGDB = file => {
  for (let i = 0; i < 33; i += 1) {
    getDataFromIGDB(i * 150)
      .then(({ data }) => fs.appendFileSync(file, `${JSON.stringify(data)}\n`))
      .catch(err => console.error(err.message, err.response.data));
  }
};

module.exports = {
  getStandardDeviation,
  getTotalRatingCount,
  getTotalRatingCountMean,
  getSigmaOne,
  getCoversFromIGDB,
  createDumpIGDB
};

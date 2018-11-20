import axios from 'axios'

const id = "ec6e179b7f47f77a99eb"; 
const sec = "5462cefb31f13c62b84bef9029b78dd982be68e0";
const params = `?client_id=${id}&client_secret=${sec}`;

async function getProfile (username) {
  const profile = await axios.get(`https://api.github.com/users/${username}${params}`)

  return profile.data
}

function getRepos (username) {
  return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`);
}

function getStarCount (repos) {
  return repos.data.reduce((count, { stargazers_count }) => count +stargazers_count, 0);
}

function calculateScore ({ followers }, repos) {
  return (followers * 3) + getStarCount(repos);
}

function handleError (error) {
  console.warn(error);
  return null;
}

async function getUserData (player) {
  const [ profile, repos ] = await Promise.all([
    getProfile(player),
    getRepos(player)
  ])

  return {
    profile,
    score: calculateScore(profile, repos)
  }
}

function sortPlayers (players) {
  return players.sort((a,b) => b.score - a.score);
}

export async function battle (players) {
  const results = await Promise.all(players.map(getUserData))
    .catch(handleError);

  return results === null
    ? results
    : sortPlayers(results);
}

export async function fetchPopularRepos (language) {
  const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

  const repos = await axios.get(encodedURI)
    .catch(handleError);

  return repos.data.items
}
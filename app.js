const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
module.exports = app
app.use(express.json())
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('serverc is running at localhost3000')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()
const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// Return a list of all movies
app.get('/movies/', async (request, response) => {
  const moviesList = `select movie_name from Movie;`
  const movies = await db.all(moviesList)
  response.send(
    movies.map(movie => convertMovieDbObjectToResponseObject(movie)),
  )
})
// POST a movie
app.post('/movies/', async (request, response) => {
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const movieDetails = `insert into movie(director_id,movie_name,lead_actor) values(${directorId},'${movieName}','${leadActor}' )`
  const movie = await db.run(movieDetails)
  response.send('Movie Successfully Added')
})
// GET A Movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `select * from movie where movie_id = ${movieId};`
  const movie = await db.get(getMovie)
  response.send(convertMovieDbObjectToResponseObject(movie))
})
//  PUT METHOD
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const getUpdateQuery = `update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}';`
  const dbResponse = await db.run(getUpdateQuery)
  response.send('Movie Details Updated')
})
//DELETE A MOVIE FROM DATABASE
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `delete from movie where movie_id=${movieId};`
  const dbResponse = await db.run(deleteMovie)
  response.send('Movie Removed')
})
// GET ALL DIRECTORS
app.get('/directors/', async (request, response) => {
  const getDirectors = `select * from Director ;`
  const dbResponse = await db.all(getDirectors)
  response.send(
    dbResponse.map(director =>
      convertDirectorDbObjectToResponseObject(director),
    ),
  )
})
// GET ALL MOVIES OF DIRECTOR
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getQuery = `SELECT movie_name from Director INNER JOIN Movie ON Director.director_id = Movie.director_id where Director.director_id=${directorId};`
  const dbResponse = await db.all(getQuery)
  response.send(dbResponse.map((movieName)=>convertMovieDbObjectToResponseObject(movieName)));
})

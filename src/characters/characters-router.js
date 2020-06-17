const path = require('path')
const express = require('express')
const xss = require('xss')
const CharactersService = require('./characters-service')

const charactersRouter = express.Router()
const jsonParser = express.json()

const serializeCharacter = character => ({
  id: character.id,
  user_id: character.user_id,
  name: xss(character.name),
  
})

charactersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    CharactersService.getAllCharacters(knexInstance)
      .then(characters => {
        res.json(characters.map(serializeCharacter))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id, name } = req.body
    const newCharacter = { user_id, name }

    for (const [key, value] of Object.entries(newCharacter))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    CharactersService.insertCharacter(
      req.app.get('db'),
      newCharacter
    )
      .then(character => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${character.id}`))
          .json(serializeCharacter(character))
      })
      .catch(next)
  })

charactersRouter
  .route('/:character_id')
  .all((req, res, next) => {
    CharactersService.getById(
      req.app.get('db'),
      req.params.character_id
    )
      .then(character => {
        if (!character) {
          return res.status(404).json({
            error: { message: `Character doesn't exist` }
          })
        }
        res.character = character
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeCharacter(res.character))
  })
  .delete((req, res, next) => {
    CharactersService.deleteCharacter(
      req.app.get('db'),
      req.params.character_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { user_id, name  } = req.body
    const characterToUpdate = { user_id, name  }

    const numberOfValues = Object.values(characterToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain one of: user_id, name`
        }
      })
    CharactersService.updateCharacter(
      req.app.get('db'),
      req.params.character_id,
      characterToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = charactersRouter;
const path = require('path')
const express = require('express')
const xss = require('xss')
const NoticesService = require('./notices-service')
const NoticePlayersService = require('./notice-players-service')
const NoticeCharactersService = require('./notice-characters-service')

const noticesRouter = express.Router()
const jsonParser = express.json()

const serializeNotice = notice => ({
  id: notice.id,
  message: xss(notice.message),
  status: notice.status,
})

const serializeNoticePlayer = noticePlayer => ({
  id: noticePlayer.id,
  notice_id: noticePlayer.notice_id,
  name: xss(noticePlayer.name),
})

const serializeNoticeCharacter = noticeCharacter => ({
  id: noticeCharacter.id,
  notice_id: noticeCharacter.notice_id,
  name: xss(noticeCharacter.name),
})

noticesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NoticesService.getAllNotices(knexInstance)
      .then(notices => {
        res.json(notices.map(serializeNotice))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { message, status } = req.body
    const newNotice = { message, status }

    for (const [key, value] of Object.entries(newNotice))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    NoticesService.insertNotice(
      req.app.get('db'),
      newNotice
    )
      .then(notice => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${notice.id}`))
          .json(serializeNotice(notice))
      })
      .catch(next)
  })

noticesRouter
  .route('/players')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NoticePlayersService.getAllNoticePlayers(knexInstance)
      .then(noticePlayers => {
        res.json(noticePlayers.map(serializeNoticePlayer))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { notice_id, name } = req.body
    const newNoticePlayer = { notice_id, name }

    for (const [key, value] of Object.entries(newNoticePlayer))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    NoticePlayersService.insertNoticePlayer(
      req.app.get('db'),
      newNoticePlayer
    )
      .then(noticePlayer => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${noticePlayer.id}`))
          .json(serializeNoticePlayer(noticePlayer))
      })
      .catch(next)
  })

noticesRouter
  .route('/characters')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NoticeCharactersService.getAllNoticeCharacters(knexInstance)
      .then(noticeCharacters => {
        res.json(noticeCharacters.map(serializeNoticeCharacter))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { notice_id, name } = req.body
    const newNoticeCharacter = { notice_id, name }

    for (const [key, value] of Object.entries(newNoticeCharacter))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    NoticeCharactersService.insertNoticeCharacter(
      req.app.get('db'),
      newNoticeCharacter
    )
      .then(noticeCharacter => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${noticeCharacter.id}`))
          .json(serializeNoticeCharacter(noticeCharacter))
      })
      .catch(next)
  })

noticesRouter
  .route('/:notice_id')
  .all((req, res, next) => {
    NoticesService.getById(
      req.app.get('db'),
      req.params.notice_id
    )
      .then(notice => {
        if (!notice) {
          return res.status(404).json({
            error: { message: `Notice doesn't exist` }
          })
        }
        res.notice = notice
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNotice(res.notice))
  })
  .patch(jsonParser, (req, res, next) => {
    const { message, status } = req.body
    const noticeToUpdate = { message, status }

    const numberOfValues = Object.values(noticeToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain one of: 'message', 'status'`
        }
      })

    NoticesService.updateNotice(
      req.app.get('db'),
      req.params.notice_id,
      noticeToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

noticesRouter
  .route('/players/:noticePlayer_id')
  .all((req, res, next) => {
    NoticePlayersService.getById(
      req.app.get('db'),
      req.params.noticePlayer_id
    )
      .then(noticePlayer => {
        if (!noticePlayer) {
          return res.status(404).json({
            error: { message: `NoticePlayer doesn't exist` }
          })
        }
        res.noticePlayer = noticePlayer
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNoticePlayer(res.noticePlayer))
  })
  .patch(jsonParser, (req, res, next) => {
    const { notice_id, name } = req.body
    const noticePlayerToUpdate = { notice_id, name }

    const numberOfValues = Object.values(noticePlayerToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain one of: 'notice_id', 'name'`
        }
      })

    NoticePlayersService.updateNoticePlayer(
      req.app.get('db'),
      req.params.noticePlayer_id,
      noticePlayerToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

noticesRouter
  .route('/characters/:noticeCharacter_id')
  .all((req, res, next) => {
    NoticeCharactersService.getById(
      req.app.get('db'),
      req.params.noticeCharacter_id
    )
      .then(noticeCharacter => {
        if (!noticeCharacter) {
          return res.status(404).json({
            error: { message: `NoticeCharacter doesn't exist` }
          })
        }
        res.noticeCharacter = noticeCharacter
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNoticeCharacter(res.noticeCharacter))
  })
  .delete((req, res, next) => {
    NoticeCharactersService.deleteNoticeCharacter(
      req.app.get('db'),
      req.params.noticeCharacter_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { notice_id, name } = req.body
    const noticeCharacterToUpdate = { notice_id, name }

    const numberOfValues = Object.values(noticeCharacterToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain one of: notice_id, name`
        }
      })
    NoticeCharactersService.updateNoticeCharacter(
      req.app.get('db'),
      req.params.noticeCharacter_id,
      noticeCharacterToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = noticesRouter;
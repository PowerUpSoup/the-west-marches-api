const path = require('path')
const express = require('express')
const xss = require('xss')
const NoticesService = require('./notices-service')

const noticesRouter = express.Router()
const jsonParser = express.json()

const serializeNotice = notice => ({
  id: notice.id,
  message: xss(notice.message),
  status: notice.status,
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

  module.exports = noticesRouter;
const NoticePlayersService = {
    getAllNoticePlayers(knex) {
      return knex.select('*').from('noticeplayers')
    },
    insertNoticePlayer(knex, newNoticePlayer) {
      return knex
        .insert(newNoticePlayer)
        .into('noticeplayers')  
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex.from('noticeplayers').select('*').where('id', id).first() 
    },
    deleteNoticePlayer(knex, id) {
      return knex('noticeplayers')  
        .where({ id })
        .delete()
    },
    updateNoticePlayer(knex, id, newNoticePlayerFields) {
      return knex('noticeplayers') 
        .where({ id })
        .update(newNoticePlayerFields)
    },
}

module.exports = NoticePlayersService
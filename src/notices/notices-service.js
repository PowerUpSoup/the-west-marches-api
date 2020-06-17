const NoticesService = {
    getAllNotices(knex) {
      return knex.select('*').from('notices')
    },
    insertNotice(knex, newNotice) {
      return knex
        .insert(newNotice)
        .into('notices')  
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex.from('notices').select('*').where('id', id).first() 
    },
    deleteNotice(knex, id) {
      return knex('notices')  
        .where({ id })
        .delete()
    },
    updateNotice(knex, id, newNoticeFields) {
      return knex('notices') 
        .where({ id })
        .update(newNoticeFields)
    },
}

module.exports = NoticesService
const NoticeCharactersService = {
    getAllNoticeCharacters(knex) {
      return knex.select('*').from('noticecharacters')
    },
    insertNoticeCharacter(knex, newNoticeCharacter) {
      return knex
        .insert(newNoticeCharacter)
        .into('noticecharacters')  
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex.from('noticecharacters').select('*').where('id', id).first() 
    },
    deleteNoticeCharacter(knex, id) {
      return knex('noticecharacters')  
        .where({ id })
        .delete()
    },
    updateNoticeCharacter(knex, id, newNoticeCharacterFields) {
      return knex('noticecharacters') 
        .where({ id })
        .update(newNoticeCharacterFields)
    },
}

module.exports = NoticeCharactersService
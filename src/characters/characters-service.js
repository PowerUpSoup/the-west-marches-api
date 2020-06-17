const CharactersService = {
    getAllCharacters(knex) {
      return knex.select('*').from('characters')
    },
    insertCharacter(knex, newCharacter) {
      return knex
        .insert(newCharacter)
        .into('characters')  
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex.from('characters').select('*').where('id', id).first() 
    },
    deleteCharacter(knex, id) {
      return knex('characters')  
        .where({ id })
        .delete()
    },
    updateCharacter(knex, id, newCharacterFields) {
      return knex('characters') 
        .where({ id })
        .update(newCharacterFields)
    },
}

module.exports = CharactersService
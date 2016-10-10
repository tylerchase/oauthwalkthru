
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments()
    table.string('googleID')
    table.string('name')
    table.text('photo')
    table.string('email')
    table.string('token')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};

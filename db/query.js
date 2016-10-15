var knex = require('./knex_config.js')

var Users = function(){
  return knex('users')
}

module.exports = {
  getAllUsers : function(){
    return Users();
  },
  getAllUsersByIdAndGoogleProfileId : function(google_id){
    return Users().where('googleID', google_id).first()
  },
  getUserById: function(profile){
    return Users().where('id', profile.id).first()
  }
}

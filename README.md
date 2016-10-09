```bash
>mkdir oauthTutorial
>cd oauthTutorial
>express --hbs --git
>npm install
>npm install knex pg --save
>knex init

>git init
>git add .
>git commit -m "created express project with handlebars and added knex and postgres"
>git remote add origin "the link to the repo that you created on github"
>git push origin master

>createdb [name of database] // we will call it 'oauthTutorial' for this project

```
- Change client and connection in the knexfile.js
```javascript
      development: {
        client: 'postgres',
        connection: {
          database: name of database created earlier wrapped in quotes // ex = : 'oauthTutorial'
        }
      },
```
- Remove the staging object from the knexfile.js
```bash
> knex migrate:make [name of table] // we will call it 'users'
```
- Now from the migrations folder find the migration file that you just made
- Add the table info (example below)
```javascript
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments()
    table.string('googleID')
    table.string('name')
    table.string('first_name')
    table.string('last_name')
    table.text('photo')
    table.string('email')
    table.string('token')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
```
```bash
> knex migrate:latest
```
- Check to see if the table is there
```bash
> psql oauthTutorial
 =# TABLE users;
 ```
 - Get out of psql (type : '\q' + hit enter)
```bash
> git add .
> git commit -m "first migration"
```

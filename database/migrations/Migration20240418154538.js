'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240418154538 extends Migration {

  async up() {
    this.addSql('alter table "generation" drop constraint "generation_author_id_foreign";');

    this.addSql('alter table "generation" alter column "author_id" type varchar(255) using ("author_id"::varchar(255));');
    this.addSql('alter table "generation" alter column "author_id" drop not null;');
    this.addSql('alter table "generation" add constraint "generation_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade on delete set null;');
  }

  async down() {
    this.addSql('alter table "generation" drop constraint "generation_author_id_foreign";');

    this.addSql('alter table "generation" alter column "author_id" type varchar(255) using ("author_id"::varchar(255));');
    this.addSql('alter table "generation" alter column "author_id" set not null;');
    this.addSql('alter table "generation" add constraint "generation_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;');
  }

}
exports.Migration20240418154538 = Migration20240418154538;

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240416112017 extends Migration {

  async up() {
    this.addSql('create table "cookie" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "tokens" int not null default 0, constraint "cookie_pkey" primary key ("id"));');

    this.addSql('create table "generation" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "generations" text[] not null, "author_id" varchar(255) not null);');

    this.addSql('alter table "generation" add constraint "generation_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade;');
  }

  async down() {
    this.addSql('drop table if exists "cookie" cascade;');

    this.addSql('drop table if exists "generation" cascade;');
  }

}
exports.Migration20240416112017 = Migration20240416112017;

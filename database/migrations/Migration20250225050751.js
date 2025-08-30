'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250225050751 extends Migration {

  async up() {
    this.addSql(`alter table "cookie" drop column "cookie2";`);

    this.addSql(`alter table "cookie" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "cookie" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);

    this.addSql(`alter table "data" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "data" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);

    this.addSql(`alter table "guild" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "guild" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "guild" alter column "last_interact" type timestamptz using ("last_interact"::timestamptz);`);

    this.addSql(`alter table "image" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "image" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);

    this.addSql(`alter table "pastebin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);

    this.addSql(`alter table "stat" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);

    this.addSql(`alter table "user" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "user" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "user" alter column "last_interact" type timestamptz using ("last_interact"::timestamptz);`);

    this.addSql(`alter table "generation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "generation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
  }

  async down() {
    this.addSql(`alter table "cookie" add column "cookie2" varchar(255) not null default '';`);
    this.addSql(`alter table "cookie" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "cookie" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);

    this.addSql(`alter table "data" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "data" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);

    this.addSql(`alter table "guild" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "guild" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);
    this.addSql(`alter table "guild" alter column "last_interact" type timestamptz(0) using ("last_interact"::timestamptz(0));`);

    this.addSql(`alter table "image" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "image" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);

    this.addSql(`alter table "pastebin" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);

    this.addSql(`alter table "stat" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);

    this.addSql(`alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);
    this.addSql(`alter table "user" alter column "last_interact" type timestamptz(0) using ("last_interact"::timestamptz(0));`);

    this.addSql(`alter table "generation" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "generation" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);
  }

}
exports.Migration20250225050751 = Migration20250225050751;

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240418161236 extends Migration {

  async up() {
    this.addSql('alter table "generation" alter column "prompt" type text using ("prompt"::text);');
  }

  async down() {
    this.addSql('alter table "generation" alter column "prompt" type varchar(255) using ("prompt"::varchar(255));');
  }

}
exports.Migration20240418161236 = Migration20240418161236;

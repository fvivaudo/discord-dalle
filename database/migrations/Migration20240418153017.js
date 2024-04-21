'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20240418153017 extends Migration {

  async up() {
    this.addSql('alter table "generation" add column "prompt" varchar(255) not null;');
  }

  async down() {
    this.addSql('alter table "generation" drop column "prompt";');
  }

}
exports.Migration20240418153017 = Migration20240418153017;

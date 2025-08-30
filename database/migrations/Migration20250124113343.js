'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const { Migration } = require('@mikro-orm/migrations');

class Migration20250124113343 extends Migration {

  async up() {
    this.addSql('alter table "cookie" add column "cookie2" varchar(255) not null default \'\';');
  }

  async down() {
    this.addSql('alter table "cookie" drop column "cookie2";');
  }

}
exports.Migration20250124113343 = Migration20250124113343;

import {Entity, EntityRepositoryType, Filter, PrimaryKey, Property} from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ customRepository: () => CookieRepository })
@Filter({ name: 'tokensLeft', cond: { tokens: { $gt: 0 } } })
export class Cookie extends CustomBaseEntity {

    [EntityRepositoryType]?: CookieRepository

    @PrimaryKey({ autoincrement: false })
    id!: string

    @Property()
    tokens: number = 0
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class CookieRepository extends EntityRepository<Cookie> { 

}
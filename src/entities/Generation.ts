import {Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property, Ref, types} from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import {User} from "discord.js";

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ repository: () => GenerationRepository })
export class Generation extends CustomBaseEntity {

    [EntityRepositoryType]?: GenerationRepository

    @PrimaryKey()
    id: number

    @Property({ type: types.text })
    prompt: string

    @Property()
    generations: string[]

    @ManyToOne(() => User, { ref: true, nullable: true })
    author?: Ref<User>;
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class GenerationRepository extends EntityRepository<Generation> {

}

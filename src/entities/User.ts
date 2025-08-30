import { OneToMany, Collection, Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/sqlite'

import { CustomBaseEntity } from './BaseEntity'
import { Generation } from "./Generation";

// ===========================================
// ================= Entity ==================
// ===========================================

@Entity({ repository: () => UserRepository })
export class User extends CustomBaseEntity {

	[EntityRepositoryType]?: UserRepository

	@PrimaryKey({ autoincrement: false })
	id!: string

	@Property()
	lastInteract: Date = new Date()

	@Property()
	contributedCookies: number = 0

	@Property()
	usedTokens: number = 0

	@OneToMany({ entity: () => Generation, mappedBy: 'author', orphanRemoval: true })
	images = new Collection<Generation>(this);
}

// ===========================================
// =========== Custom Repository =============
// ===========================================

export class UserRepository extends EntityRepository<User> {

	async updateLastInteract(userId?: string): Promise<void> {
		const user = await this.findOne({ id: userId })

		if (user) {
			user.lastInteract = new Date()
			await this.em.flush()
		}
	}

}

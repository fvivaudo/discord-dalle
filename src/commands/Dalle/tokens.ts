import { Category } from '@discordx/utilities'
import {ApplicationCommandOptionType, CommandInteraction, Message} from 'discord.js'
import {Client, SlashOption} from 'discordx'

import {Discord, Injectable, Slash} from '@/decorators'
import {Dalle} from "@/services";

@Discord()
@Injectable()
@Category('Dalle')
export default class Tokens {
    constructor(
        private dalle: Dalle
    ) {}

    @Slash({
        name: 'tokens',
    })
    async add_cookie(
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const msg = (await interaction.followUp({ content: 'Treating...', fetchReply: true })) as Message

        const numTokens = await this.dalle.checkAllCookies()

        await msg.edit(numTokens + ' tokens in the global pool')
    }

}
import { Category } from '@discordx/utilities'
import {ApplicationCommandOptionType, CommandInteraction, Message, TextChannel} from 'discord.js'
import {Client, SlashOption} from 'discordx'

import {Discord, Injectable, Slash} from '@/decorators'
import {Dalle} from "@/services";

@Discord()
@Injectable()
@Category('Dalle')
export default class AddCookie {
    constructor(
        private dalle: Dalle
    ) {}

    @Slash({
        name: 'add_cookie',
    })
    async add_cookie(
        @SlashOption({
            description: "your _U cookie",
            name: "cookie",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            cookie: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const msg = (await interaction.followUp({ content: 'Treating...', fetchReply: true })) as Message

        // if (cookie.length !== 215)
        //     await msg.edit('Error! Cookie should be 215 characters long')
        // else {
            const response = await this.dalle.validateAndRegisterCookie(cookie)

            await msg.edit(response + ' Thanks!')

            if (response.includes('Success!'))
            {
                await this.dalle.addOneContributedCookie(interaction.user.id)
                await ( client.channels.cache.get('1230126888685408278') as TextChannel ).send('Comrade ' + '<@' + interaction.member + '>' + ' has toiled for a cookie, and gave it to the commune. Thank you!')
            }
        // await client.send
        // }
    }

}



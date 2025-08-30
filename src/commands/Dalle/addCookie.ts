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
        description: 'Give a microsoft bing creator account _U cookie to the bot'
    })
    async add_cookie(
        @SlashOption({
            description: "_U cookie",
            name: "cookie",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
            _U: string,
        // @SlashOption({
        //     description: "SRCHHPGUSR cookie",
        //     name: "analytics",
        //     required: false,
        //     type: ApplicationCommandOptionType.String,
        // })
        //     SRCHHPGUSR: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const msg = (await interaction.followUp({ content: 'Treating...', fetchReply: true })) as Message

        // if (cookie.length !== 215)
        //     await msg.edit('Error! Cookie should be 215 characters long')
        // else {
        //     const response = await this.dalle.validateAndRegisterCookie(_U, SRCHHPGUSR ? SRCHHPGUSR : "")
        const response = await this.dalle.validateAndRegisterCookie(_U)

            await msg.edit(response + ' Thanks!')

            if (response.includes('Success!'))
            {
                await this.dalle.addOneContributedCookie(interaction.user.id)
                await ( client.channels.cache.get('1230126888685408278') as TextChannel ).send('<@' + interaction.user.id + '>' + ' gave the bot a cookie, helping it run! Thank you!')
                await ( client.channels.cache.get('1272759037343301683') as TextChannel ).send('<@' + interaction.user.id + '>' + ' gave the bot a cookie, helping it run! Thank you!')

            }
        // await client.send
        // }
    }

}



import { Category } from '@discordx/utilities'
import {ApplicationCommandOptionType, CommandInteraction, Message} from 'discord.js'
import {Client, SlashOption} from 'discordx'

import {Discord, Injectable, Slash} from '@/decorators'
import {Dalle} from "@/services";
import {Generation} from "@/entities";

@Discord()
@Injectable()
@Category('Dalle')
export default class Create {
    constructor(
        private dalle: Dalle
    ) {}

    @Slash({
        name: 'dalle',
    })
    async create(
        @SlashOption({
            description: "your prompt",
            name: "prompt",
            required: true,
            type: ApplicationCommandOptionType.String,
            maxLength: 480
        })
            prompt: string,
        @SlashOption({
            description: "number of generation attempts",
            name: "n",
            required: true,
            type: ApplicationCommandOptionType.Number,
            maxValue: 10,
        })
            n: number,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const msg = (await interaction.followUp({ content: 'Treating...', fetchReply: true })) as Message

        const result = await this.dalle.createManyPictures(prompt, n, interaction.user.id)
        if (!result.completed || result.urls.length === 0)
        {
            let response = '**Failure!** '+ result.error+ '\n' + prompt + '\n'
            await msg.edit(response)

        }
        else
        {
            let slicedUrls = result.urls.slice(0,4)
            let response =
                '**Success!** ' + result.urls.length + '/' + n * 4 + ' expected pictures' + '\n'
                + prompt + '\n'
                + slicedUrls.map((pic) => pic + '\n').join('')
            await msg.edit(response)
            //Send urls bit by bit so that they all get previewed
            for (let i = 4; i < result.urls.length; i += 4)
            {
                slicedUrls = result.urls.slice(i,4+i)
                await msg.reply(slicedUrls.map((pic) => pic + '\n').join(''))
            }

            await this.dalle.createGeneration(prompt, result.urls)
        }
    }

}

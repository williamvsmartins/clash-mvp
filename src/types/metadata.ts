import { Client, Guild, GuildTextBasedChannel } from "discord.js";

export interface QueueMetadata {
    client: Client<true>;
    guild: Guild;
    channel: GuildTextBasedChannel;
}
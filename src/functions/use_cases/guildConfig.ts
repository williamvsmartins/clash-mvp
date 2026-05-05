import { Guild } from '#database';

export interface GuildConfigData {
    channelQueue:     string;
    channelAlerts:    string;
    channelSupport:   string;
    roleRegistered:   string;
    roleStaff:        string;
    roleAvailable:    string;
    depositFee:       number;
    queueWaitMinutes: number;
}

export type GuildConfigField = keyof GuildConfigData;

const cache = new Map<string, GuildConfigData>();

function docToConfig(doc: InstanceType<typeof Guild>): GuildConfigData {
    const d = doc as any;
    return {
        channelQueue:     d.channelQueue     ?? '',
        channelAlerts:    d.channelAlerts    ?? '',
        channelSupport:   d.channelSupport   ?? '',
        roleRegistered:   d.roleRegistered   ?? '',
        roleStaff:        d.roleStaff        ?? '',
        roleAvailable:    d.roleAvailable    ?? '',
        depositFee:       d.depositFee       ?? 10,
        queueWaitMinutes: d.queueWaitMinutes ?? 1,
    };
}

export async function getGuildConfig(guildId: string): Promise<GuildConfigData> {
    if (cache.has(guildId)) return cache.get(guildId)!;
    const doc = await Guild.findOne({ guildId }) ?? await Guild.create({ guildId });
    const data = docToConfig(doc);
    cache.set(guildId, data);
    return data;
}

export async function setGuildConfigField(
    guildId: string,
    field: GuildConfigField,
    value: string | number,
): Promise<GuildConfigData> {
    const doc = await Guild.findOneAndUpdate(
        { guildId },
        { [field]: value },
        { upsert: true, new: true },
    );
    const data = docToConfig(doc!);
    cache.set(guildId, data);
    return data;
}

export function invalidateGuildConfigCache(guildId: string): void {
    cache.delete(guildId);
}

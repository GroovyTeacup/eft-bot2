import { Message } from "discord.js";
import EFTClient from "../eftClient";

/** An instance of a ban within the database */
declare class Ban {
    /** The ID of ban instance */
    public ban_id: int
    /** The ID of the member that was banned */
    public member_id: int
    /** The specified reason the member was banned, if any. */
    public ban_reason: string
    /** The date/time the member was banned */
    public ban_date: Date
    /** The ID of the staff member that issued the ban */
    public ban_issuer: string
    /** Whether the member was banned for scamming (Using the !banscammer command) */
    public is_scammer: boolean
}

/** An instance of a member within the database */
declare class DBMember {
    /** The id of the member */
    member_id: int
    /** The discord username of the member */
    member_name: string
    /** The date/time the member created their discord account */
    account_creation_date: Date
    /** The date/time the member used the !accept command. */
    accept_date: Date
    /** The amount of reputation the member has */
    reputation: int
    /** The amount of middleman reputation the member has */
    mm_reputation: int
    /** Whether the member is banned */
    is_banned: boolean
    /** Whether the member is active */
    is_active: boolean
}
/*
declare class EFTMessage extends Message {
    client: EFTClient
}*/
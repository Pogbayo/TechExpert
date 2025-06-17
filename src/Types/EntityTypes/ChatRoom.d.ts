import type { ApplicationUser } from "./ApplicationUser"

export type ChatRoomType = {
    ChatRoomId : string ,
    Name : string,
    IsGroup : boolean,
    LastMessageContent: string,
    LastMessageTimeStamp : string,
    Users : ApplicationUser[]
}
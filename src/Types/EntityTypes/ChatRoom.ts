import type { ApplicationUser } from "./ApplicationUser"

export type ChatRoomType = {
  chatRoomId: string;
  name: string;
  isGroup: boolean;
  lastMessageContent: string | null;
  lastMessageTimestamp: string | null;
  users: ApplicationUser[];
  pinned?: boolean;
};

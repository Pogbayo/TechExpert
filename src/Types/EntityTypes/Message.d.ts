import type { ApplicationUser } from "./ApplicationUser";

export type Message = {
  messageId: string ;      
  chatRoomId: string; 
  sender: ApplicationUser | null;
  content: string;            
  timestamp?: string;   
};


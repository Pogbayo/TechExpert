import type { ApplicationUser } from "./ApplicationUser";

export type Message = {
  messageId: string ;    
  clientMessageId:string;  
  chatRoomId: string; 
  sender: ApplicationUser | null;
  content: string;            
  timestamp?: string;   
  isEdited?: boolean;
  isDeleted?:boolean;
  readBy?: string[];
};


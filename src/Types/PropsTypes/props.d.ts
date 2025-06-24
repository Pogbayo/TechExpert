
//component props type
export type ButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export type ChatBubbleProps = {
  message: string;
  senderId: string;
};

export type ChatInputProps = {
  onSend: (message: string) => void;
};

export type ChatHeaderProps = {
  title: string;            
  subtitle?: string;         
  onBack?: () => void;         
};

type ChatRoomListProps = {
  showDpOnly?: boolean;
  onSelectChatRoom?: (chatRoomId: string) => void;
};

export type AvatarProps = {
  src?: string;               
  alt?: string;           
  size?: number;               
  initials?: string;          
};

export type ChatMessageListProps = {
  messages: ChatMessage[];
};


export type ChatRoomListProps = {
  showDpOnly?: boolean;
  onSelectChatRoom?: (chatRoomId: string) => void;
  chatRoomId?: string;
  isMobileView: boolean;
};
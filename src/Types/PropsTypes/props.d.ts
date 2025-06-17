
//component props type
export type ButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export type ChatBubbleProps = {
  message: string;
  senderId: number;
};

export type ChatInputProps = {
  onSend: (message: string) => void;
};

export type ChatHeaderProps = {
  title: string;            
  subtitle?: string;         
  onBack?: () => void;         
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



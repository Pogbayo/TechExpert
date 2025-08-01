import type { ApiResponse } from "../ApiResponseTypes/ApiResponse";
import type { ApplicationUser } from "../EntityTypes/ApplicationUser";
import type { ChatRoomType } from "../EntityTypes/ChatRoom";
import type { Message } from "../EntityTypes/Message";

export type MessageContextType = {
  messagesByChatRoomId: { [chatRoomId: string]: Message[] | null};
  setmessagesByChatRoomId: React.Dispatch<React.SetStateAction<{ [chatRoomId: string]: Message[] | null }>>;
  fetchMessagesByChatRoomId: (chatRoomId: string) => Promise<void>;
  sendMessage: (chatRoomId: string, senderId:string ,content:string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<ApiResponse<boolean>>;
  editMessage : (messageId : string,newContent : string) => Promise<ApiResponse<boolean>>;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
  isMessageSent:boolean
  currentChatRoomId: string | null;
  // lastMessage:string | null;
  openChatRoom:(chatRoomId:string) =>void
  setCurrentChatRoomId: (id: string | null) => void; };

export type AuthContextType = {
  user: ApplicationUser | null;
  fetchedUser : ApplicationUser | null;
  login: (Email: string, password: string) => Promise<ApiResponse<LoginResponse>>;
  register: (Username:string,Email: string, Password: string) => Promise<ApiResponse<string>>; 
  getUserById: (userId: string) => Promise<void>;
  // updateUsername:(userid:string,newUsername:string)=> Prmoise<ApiResponse<void>>
  // updatePassword:(userid:string,currentPassword:string,newPassword:string)=> Prmoise<ApiResponse<void>>
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<ApplicationUser | null>>;  isLoading: boolean;
  isAuthChecked:boolean;
};

export type ChatUIContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  goBack: () => void;
  canGoBack: boolean;
};

export type UserContextType = {
  user: ApplicationUser | null;
  users : ApplicationUser[],
  getUserById : (userId : string) => Promise<void>;
  fetchUsers :(numberOfUsers : number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  nonMutualFriends: ApplicationUser[] | null;
  fetchNonMutualFriends: (userId: string) => Promise<void>;
}

export type ChatRoomUserContextType = {
  addUserToChatRoom: (chatRoomId : string,userIds : string[]) => Promise<ApiResponse<boolean>>;
  removeUserFromChatRoom : (chatRoomId : string, userId : string) => Promise<ApiResponse<boolean>>
  getUsersFromChatRoom : (chatRoomId : string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  chatRoomUsers: ApplicationUser[]
}

interface ChatRoomRowProps {
  room: ChatRoomType;
  unreadCount: Record<string,number>
  index: number;
  user: ApplicationUser | null;
  messagesByChatRoomId: { [chatRoomId: string]: Message[] | null };
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  showAbove: { [id: string]: boolean };
  setShowAbove: React.Dispatch<React.SetStateAction<{ [id: string]: boolean }>>;
  pinChatRoom: (id: string) => void;
  unpinChatRoom: (id: string) => void;
  handleArchive: (e: React.MouseEvent) => void;
  handleDelete: (e: React.MouseEvent) => void;
  onSelectChatRoom?: (id: string) => void;
  compactView: boolean;
  onlineUsers: string[];
  setCurrentChatRoomId: (id: string) => void;
  isMobileView: boolean;
}

export type ChatRoomContextType = {
  chatRoom: ChatRoomType | null;
  chatRooms: ChatRoomType[];
  unreadCount: Record<string,number>;
  setUnreadCount: React.Dispatch<React.SetStateAction<Record<string,number>>>;
  chatRoomsThatUserIsNotIn:chatRooms[] | null;
  lastAction: 'user-added' | 'user-removed' | 'chatroom-created' | 'chatroom-deleted' | 'chatroom-updated' | null;
  setLastAction: (action: 'user-added' | 'user-removed' | 'chatroom-created' | 'chatroom-deleted' | 'chatroom-updated' | null) => void;
  isLoading: boolean;
  error: string | null;
  showCreateModal:boolean;
  getUnreadMessagesCount:(userId:string) => Promise<void>
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>; 
  markAsRead: (messageIds:string[],userId:string) => Promise<ApiResponse<boolean> | undefined>
  openChatRoom:(chatRoomId:string) => Promise<void>;
  createChatRoom: (name: string, isGroup: boolean, memberIds: string[]) => Promise<ChatRoomType | null>;
  getChatRoomsRelatedToUser: (userId: string) => Promise<void>;
  getPrivateChatRoom:(currentUserId: string,friendUserId:string) => Promise<ChatRoomType>
  getChatRoomByName: (chatRoomName: string) => Promise<ChatRoomType | null>;
  getChatRoomById: (chatRoomId: string) => Promise<void>;
  deleteChatRoomAsync: (chatRoomId: string) => Promise<void>;
  updateChatRoomName: (chatRoomId: string, newName: string) => Promise<void>;
  refreshChatRoomsFromServer: (userId: string) => Promise<void>;
  fetchChatRoomsWhereUserIsNotIn:(userId:string) => Promise<void>
  currentChatRoomId: string | null;
  setCurrentChatRoomId: (id: string | null) => void;
  pinChatRoom: (chatRoomId: string) => Promise<void>;
  isDarkMode:boolean;
  unpinChatRoom: (chatRoomId: string) => Promise<void>;
};

export type LoginResponse = {
  token: string;
  user : ApplicationUser | null;
}

export type SignalContextType = {
  connection: signalR.HubConnection | null;
  connectionStatus: "connecting" | "connected" | "disconnected" | "reconnecting";
};

export type ChatWindowProps = {
  chatRoom: ChatRoomType | null;
};

export type MessageInputProps = {
  // chatRoomId: string;
  isGroup:boolean
};

export interface ProvidersProps {
  children: ReactNode;
}

interface ProfileContextType {
  updateUsername: (newUsername: string) => Promise<ApiResponse<string>>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  loading: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>
  username:string;
}
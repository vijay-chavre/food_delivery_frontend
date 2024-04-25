// ChatItem.tsx
import { Chat } from "@/services/chat/chatService";
import { formatTimestamp } from "@/utils/date";
import Link from "next/link";
import { Group, AccountCircle } from "@mui/icons-material";

interface Props {
  chat: Chat;
  setActiveChat: React.Dispatch<React.SetStateAction<string | null>>;
  activeChat: string | null;
}

const ChatItem: React.FC<Props> = ({ chat, setActiveChat, activeChat }) => {
  const isActive = chat._id === activeChat;
  const classNames = `${isActive ? " bg-gray-100" : ""}`;
  return (
    <Link href={`/chat/${chat._id}`} onClick={() => setActiveChat(chat._id)}>
      <div
        className={
          "flex cursor-pointer focus:bg-gray-100 items-center justify-between border-b border-gray-200 py-4" +
          classNames
        }
      >
        <div className="flex items-center p-4 lg:p-1">
          <div className="w-12 h-12 bg-gray-300 flex items-center justify-center rounded-full mr-4">
            <AccountCircle fontSize="large" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{chat.name}</h2>
            <p className="text-sm hidden lg:block text-gray-500">
              {formatTimestamp(chat.updatedAt)}
            </p>
          </div>
        </div>
        <div className="lg:flex hidden items-center">
          <p className="mr-4">{chat.participants.length}</p>
          <Group />
          {/* You can add an icon here for indicating number of participants */}
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
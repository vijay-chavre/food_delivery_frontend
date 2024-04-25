import ChatList from "@/features/Chat/ChatList";

const ChatLayout = async ({ children }: any) => {
  return (
    <div className="min-h-screen">
      <header className="w-full z-50 bg-black h-16 text-white fixed flex items-center justify-center">
        Welcome to Chat App
      </header>
      <div className="flex flex-col lg:flex-row pt-16 lg:min-h-screen h-16">
        <div className="lg:w-1/4 lg:min-h-screen h-64  px-1 border-gray-100 border">
          <ChatList />
        </div>
        <main className="lg:w-3/4 min-h-screen pl-0  w-full">{children}</main>
      </div>
    </div>
  );
};

export default ChatLayout;
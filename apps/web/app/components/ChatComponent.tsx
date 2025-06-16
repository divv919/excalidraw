import axios from "axios";
import { BACKEND_BASE_URL } from "../config";
import { ChatComponentClient } from "./ChatComponentClient";

const getPrevChats = async (id: number) => {
  const response = await axios.get(BACKEND_BASE_URL + "/chats/" + id);
  return response.data;
};

export const ChatComponent = async ({ id }: { id: number }) => {
  const { messages } = await getPrevChats(id);
  return <ChatComponentClient messages={messages} />;
};

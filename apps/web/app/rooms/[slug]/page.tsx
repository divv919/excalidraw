import axios from "axios";
import { BACKEND_BASE_URL } from "../../config";
import { ChatComponent } from "../../components/ChatComponent";
const getRoomIdFromSlug = async (slug: string) => {
  try {
    const response = await axios.get(BACKEND_BASE_URL + "/idFromSlug/" + slug);
    return response.data.id;
  } catch (err) {
    console.log(err);
    return null;
  }
};
const ChatRoom = async ({ params }: { params: { slug: string } }) => {
  const id = await getRoomIdFromSlug(params.slug);
  if (!id) {
    return <div>Error during getting id from slug</div>;
  }

  return <ChatComponent id={id} />;
};

export default ChatRoom;

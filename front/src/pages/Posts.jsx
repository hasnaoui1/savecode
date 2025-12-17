import { useSnippets } from "../services/SnippetContext";
import SnippetCard from "../components/SnippetCard";
import { UserContext } from "../services/UserContext";
import { useContext , useState } from "react";
import { format } from "date-fns";
import LikedPosts from "./LikedPosts";
import { Link } from "react-router-dom";
const Posts = () => {

  const { user } = useContext(UserContext);
  const { snippets } = useSnippets();
  const [activeTab, setActiveTab] = useState("posts");



  return (
    <div className="flex">
      <div className="w-1/4 p-4">
        <div className="bg-red-900 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold">
          {user?.username[0]}
        </div>
        <h2 className="mt-4 text-xl">{user?.username}</h2>
        <p className="text opacity-70">
          User Since{" "}
          {user?.createdAt
            ? format(new Date(user.createdAt), "MMM dd, yyyy")
            : "Unknown"}
        </p>

        <p className="mt-2 text-sm">📄 {user?.Snippets?.length} Posts</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[...new Set(user?.Snippets?.map((s) => s.language))].map((lang) => (
            <span key={lang} className="bg-blue-800 text-sm px-2 py-1 rounded">
              {lang}
            </span>
          ))}
        </div>
          <Link to="/settings">
            <button className="mt-4 w-full bg-gray-800 px-4 py-2 rounded cursor-pointer">
              Edit Profile
            </button>
        </Link>
      </div>

      <div className="w-3/4 p-4">
        <div className="flex gap-4 mb-4 border-b border-gray-600">
          <button onClick={()=>setActiveTab("posts") }className={`pb-2 cursor-pointer font-semibold ${activeTab=="posts"?"border-b-2 border-white text-white" : ""}`}>
            Posts
          </button>
          <button  onClick={()=>setActiveTab("likes")}className={`pb-2 cursor-pointer font-semibold ${activeTab=="likes"?"border-b-2 border-white text-white" : ""}`}>Likes</button>
        </div>

        { activeTab === "posts"?<div className="grid grid-cols-2 gap-4">
          {snippets
            .filter((s) => s?.userId === user?.id)
            .map((snippet, index) => (
              <SnippetCard key={index} snippet={snippet} />
            ))}
        </div> : <LikedPosts/>}
      </div>
    </div>
  );
};

export default Posts;

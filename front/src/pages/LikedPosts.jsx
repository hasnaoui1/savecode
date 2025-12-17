import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import SnippetCard from "../components/SnippetCard"

const LikedPosts = () => {
  const [favorites, setFavorites] = useState([]);

  const getFavorites = async () => {
    try {
      const res = await axiosInstance.get("/favorites");


      const validFavorites = res
        .filter(f => f.Snippet)
        .map(f => f.Snippet);

      setFavorites(validFavorites);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-2 gap-4">
        {favorites.map(snippet => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            hideMenu={true}
          />
        ))}
      </div>
    </div>
  );
};

export default LikedPosts;

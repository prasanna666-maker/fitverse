import { createContext, useState, useEffect, useContext } from "react";
import { toggleFavorite, getFavorites } from "../api";
import { AuthContext } from "./AuthContext";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]); // array of gym objects
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (user) {
      getFavorites()
        .then((res) => {
          setFavorites(res.data);
          setFavoriteIds(new Set(res.data.map((g) => g._id)));
        })
        .catch(() => {});
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const toggle = async (gymId) => {
    if (!user) return false; // not logged in
    try {
      const res = await toggleFavorite(gymId);
      if (res.data.isFavorited) {
        setFavoriteIds((prev) => new Set([...prev, gymId]));
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(gymId);
          return next;
        });
      }
      // Refresh full list
      const fresh = await getFavorites();
      setFavorites(fresh.data);
      return res.data.isFavorited;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
};

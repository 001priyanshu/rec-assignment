import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTrash,
  faBook,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { useGetUserID } from "../../hooks/useGetUserID";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const [cookies] = useCookies(["access_token"]);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const user = useGetUserID();
  const navigate = useNavigate();

  const navigateSignIn = () => {
    if (cookies.access_token.length === 0) {
      navigate("/signin");
      return;
    }
  };

  const checkLoggedIn = () => {
    if (cookies.access_token.length === 0) {
      return false;
    } else return true;
  };

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/recipe/getAllRecipes",
        {
          headers: { authorization: cookies.access_token },
        }
      );
      setRecipes(response.data.allRecipes);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFavRecipes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/favoriteRecipes/${
          JSON.parse(user)._id
        }`,
        {
          headers: { authorization: cookies.access_token },
        }
      );
      setFavoriteRecipes(response.data.favoriteRecipes);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchFavRecipes();
  }, []);

  const isRecipeFavorite = (id) => favoriteRecipes.includes(id);

  const toggleFavorite = async (recipeID) => {
    navigateSignIn();
    try {
      if (isRecipeFavorite(recipeID)) {
        // Remove from favorites
        await axios.put(
          `http://localhost:5000/api/user/removeFavRecipe/${recipeID}`,
          {},
          {
            headers: { Authorization: cookies.access_token },
          }
        );
        setFavoriteRecipes((prevFavorites) =>
          prevFavorites.filter((id) => id !== recipeID)
        );
      } else {
        // Add to favorites
        await axios.put(
          `http://localhost:5000/api/user/addFavRecipe/${recipeID}`,
          {},
          {
            headers: { Authorization: cookies.access_token },
          }
        );
        setFavoriteRecipes([...favoriteRecipes, recipeID]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRecipe = async (recipeID) => {
    navigateSignIn();
    try {
      await axios.delete(
        `http://localhost:5000/api/recipe/deleteRecipe/${recipeID}`,
        {
          headers: { authorization: cookies.access_token },
        }
      );
      fetchRecipes();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredRecipes = searchInput
    ? recipes.filter((recipe) => {
        const searchStr = searchInput.toLowerCase();
        return (
          recipe.name.toLowerCase().includes(searchStr) ||
          recipe.description.toLowerCase().includes(searchStr) ||
          recipe.mealType.toLowerCase().includes(searchStr)
        );
      })
    : recipes;

  return (
    <div className="bg-gray-100 min-h-screen p-2">
      <h1 className="text-center p-8 text-4xl font-serif font-extrabold m-y-2 text-blue-500">
        Recipes
      </h1>
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search for recipes..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full max-w-md"
        />
      </div>
      <div className="flex justify-center">
        <div className="space-y-8 w-full md:w-1/2">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white p-4 shadow-lg rounded-lg transition-transform transform hover:scale-105"
            >
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => toggleFavorite(recipe._id)}
                  className={`px-4 py-2 text-3xl rounded ${
                    isRecipeFavorite(recipe._id)
                      ? "text-red-500 "
                      : "text-blue-500 "
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>

                <div className="text-center">
                  <h2 className="text-2xl font-bold  text-indigo-800">
                    {recipe.name}
                  </h2>
                  <h4 className="text-xl mt-2 text-gray-700 font-bold">
                    {recipe.mealType}
                  </h4>
                </div>

                <button
                  onClick={() => deleteRecipe(recipe._id)}
                  className={`px-4 py-2 text-3xl ${
                    checkLoggedIn() === true ? "text-red-500 " : "text-white"
                  }  rounded`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <p className="mt-2 text-gray-700  text-center">
                {recipe.description}
              </p>

              <hr className="my-4 border-t border-gray-300" />
              <div>
                <div className="">
                  <div className=" flex">
                    <FontAwesomeIcon
                      icon={faList}
                      className="text-indigo-500 text-2xl w-max"
                    />
                    <h3 className="text-lg -mt-1 ml-2 font-semibold  text-indigo-800">
                      Ingredients
                    </h3>
                  </div>
                  <ul className="pl-4 text-gray-700">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-lg">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <hr className="my-4 border-t border-gray-300" />
              <div>
                <div className="">
                  <div className="flex">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="text-indigo-500 text-2xl"
                    />
                    <h3 className="text-lg -mt-1 ml-2 font-semibold text-indigo-800">
                      Instructions
                    </h3>
                  </div>
                  <ul className="pl-4 text-gray-700">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="text-lg">
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="mt-4 w-full h-96 object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

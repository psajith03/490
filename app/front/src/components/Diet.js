import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SPOONACULAR_API_KEY = 'd4e47ade78614ff88e381caf7619af36';

const Diet = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  
  // Add ingredient
  const addIngredient = () => {
    if (input.trim() !== '') {
      setIngredients([...ingredients, input.trim()]);
      setInput('');
    }
  };
  
  // Fetch nutritional data and recipes from Spoonacular
  const fetchNutritionAndRecipes = async () => {
    if (ingredients.length === 0) return;
    
    // Get nutrition summary
    const nutritionResponse = await fetch(`https://api.spoonacular.com/recipes/guessNutrition?title=${ingredients.join(',')}&apiKey=${SPOONACULAR_API_KEY}`);
    const nutritionData = await nutritionResponse.json();
    setNutritionData({
      calories: nutritionData.calories.value,
      protein: nutritionData.protein.value,
      carbs: nutritionData.carbs.value,
      fats: nutritionData.fat.value
    });

    const recipeResponse = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&number=1&apiKey=${SPOONACULAR_API_KEY}`);
    const recipes = await recipeResponse.json();

    // Fetch full recipe details to get URLs
    const detailedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`);
        const details = await detailsResponse.json();
        return { title: details.title, sourceUrl: details.sourceUrl };
      })
    );

    setRecipeSuggestions(detailedRecipes);
  };
  
  return (
    <PageWrapper>
      <Header>
        <span>Diet</span>
        <HomeButton onClick={() => navigate('/')}>Home</HomeButton>
      </Header>
      <Content>
        <h1>Manage Your Nutrition</h1>
        <p>Input your favorite ingredients or available foods:</p>
        
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter an ingredient"
          />
          <button onClick={addIngredient}>Add</button>
        </div>
        
        <ul>
          {ingredients.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
        
        <button onClick={fetchNutritionAndRecipes}>Analyze Diet & Get Recipes</button>
        
        {nutritionData && (
          <div>
            <h2>Nutritional Summary</h2>
            <p>Calories: {nutritionData.calories}</p>
            <p>Protein: {nutritionData.protein}g</p>
            <p>Carbs: {nutritionData.carbs}g</p>
            <p>Fats: {nutritionData.fats}g</p>
          </div>
        )}
        
        {recipeSuggestions.length > 0 && (
          <div>
            <h2>Recipe Suggestions</h2>
            <ul>
              {recipeSuggestions.map((recipe, idx) => (
                <li key={idx}>
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">{recipe.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Content>
    </PageWrapper>
  );
};

export default Diet;


/* --- STYLES --- */
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%, #a60064 40%, #000 100%);
  color: white;
  text-align: center;
`;


const Header = styled.div`
  position: fixed; /* ✅ Keeps it at the top */
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff; /* Dark background */
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgb(201, 80, 169);

  span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;


const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border: .25em solid rgb(217, 176, 255); /* Light purple glow */
  background-color: #fff;
  color: rgb(217, 176, 255);
  border-radius: 1em;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 1em .25em rgb(217, 176, 255),
              0 0 4em 1em rgba(191, 123, 255, 0.5),
              inset 0 0 .75em .25em rgb(217, 176, 255);
  text-shadow: 0 0 .5em rgb(217, 176, 255);

  &:hover {
    background-color: rgb(217, 176, 255);
    color: #222;
    box-shadow: 0 0 1em .25em rgb(217, 176, 255),
                0 0 4em 2em rgba(191, 123, 255, 0.5),
                inset 0 0 .75em .25em rgb(217, 176, 255);
  }

  &:active {
    box-shadow: 0 0 0.6em .25em rgb(217, 176, 255),
                0 0 2.5em 2em rgba(191, 123, 255, 0.5),
                inset 0 0 .5em .25em rgb(217, 176, 255);
  }
`;


const Content = styled.div`
  margin-top: 80px;
  text-align: center;

  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
  }
`;
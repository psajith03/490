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
  const [loading, setLoading] = useState(false);
  
  const addIngredient = () => {
    if (input.trim() !== '') {
      setIngredients([...ingredients, input.trim()]);
      setInput('');
    }
  };
  
  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };
  
  const fetchNutritionAndRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    
    try {
      const nutritionResponse = await fetch(`https://api.spoonacular.com/recipes/guessNutrition?title=${ingredients.join(',')}&apiKey=${SPOONACULAR_API_KEY}`);
      const nutritionData = await nutritionResponse.json();
      setNutritionData({
        calories: nutritionData.calories.value,
        protein: nutritionData.protein.value,
        carbs: nutritionData.carbs.value,
        fats: nutritionData.fat.value
      });

      const recipeResponse = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&number=3&apiKey=${SPOONACULAR_API_KEY}`);
      const recipes = await recipeResponse.json();

      const detailedRecipes = await Promise.all(
        recipes.map(async (recipe) => {
          const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`);
          const details = await detailsResponse.json();
          return { 
            title: details.title, 
            sourceUrl: details.sourceUrl,
            image: details.image,
            readyInMinutes: details.readyInMinutes,
            servings: details.servings
          };
        })
      );

      setRecipeSuggestions(detailedRecipes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageWrapper>
      <Header>
        <span>Diet</span>
        <HomeButton onClick={() => navigate('/DietHome')}>Diet Home</HomeButton>
      </Header>
      <Content>
        <TitleSection>
          <h1>Manage Your Nutrition</h1>
          <p>Input your favorite ingredients or available foods:</p>
        </TitleSection>
        
        <InputSection>
          <InputContainer>
            <StyledInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter an ingredient"
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            />
            <AddButton onClick={addIngredient}>Add</AddButton>
          </InputContainer>
        </InputSection>
        
        <IngredientList>
          {ingredients.length > 0 ? (
            ingredients.map((ing, idx) => (
              <IngredientItem key={idx}>
                <IngredientText>{ing}</IngredientText>
                <RemoveButton onClick={() => removeIngredient(idx)}>✕</RemoveButton>
              </IngredientItem>
            ))
          ) : (
            <EmptyMessage>No ingredients added yet</EmptyMessage>
          )}
        </IngredientList>
        
        <AnalyzeButton onClick={fetchNutritionAndRecipes} disabled={loading || ingredients.length === 0}>
          {loading ? "Analyzing..." : "Analyze Diet & Get Recipes"}
        </AnalyzeButton>
        
        {nutritionData && (
          <NutritionSection>
            <h2>Nutritional Summary</h2>
            <NutritionGrid>
              <NutritionCard>
                <NutritionValue>{nutritionData.calories}</NutritionValue>
                <NutritionLabel>Calories</NutritionLabel>
              </NutritionCard>
              <NutritionCard>
                <NutritionValue>{nutritionData.protein}g</NutritionValue>
                <NutritionLabel>Protein</NutritionLabel>
              </NutritionCard>
              <NutritionCard>
                <NutritionValue>{nutritionData.carbs}g</NutritionValue>
                <NutritionLabel>Carbs</NutritionLabel>
              </NutritionCard>
              <NutritionCard>
                <NutritionValue>{nutritionData.fats}g</NutritionValue>
                <NutritionLabel>Fats</NutritionLabel>
              </NutritionCard>
            </NutritionGrid>
          </NutritionSection>
        )}
        
        {recipeSuggestions.length > 0 && (
          <RecipeSection>
            <h2>Recipe Suggestions</h2>
            <RecipeGrid>
              {recipeSuggestions.map((recipe, idx) => (
                <RecipeCard key={idx}>
                  <RecipeImage src={recipe.image} alt={recipe.title} />
                  <RecipeContent>
                    <RecipeTitle>{recipe.title}</RecipeTitle>
                    <RecipeDetails>
                      <RecipeDetail>
                        <span>⏱️</span> {recipe.readyInMinutes} mins
                      </RecipeDetail>
                      <RecipeDetail>
                        <span>👥</span> {recipe.servings} servings
                      </RecipeDetail>
                    </RecipeDetails>
                    <RecipeLink href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      View Recipe
                    </RecipeLink>
                  </RecipeContent>
                </RecipeCard>
              ))}
            </RecipeGrid>
          </RecipeSection>
        )}
      </Content>
    </PageWrapper>
  );
};

export default Diet;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  padding: 20px;
  box-sizing: border-box;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border: .25em solid rgb(217, 176, 255);
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
  }
`;

const Content = styled.div`
  margin-top: 80px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 1.1em;
  }
`;

const InputSection = styled.div`
  margin-bottom: 30px;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #74C0FC;
    box-shadow: 0 0 10px rgba(116, 192, 252, 0.3);
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: #74C0FC;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5BA4E5;
    transform: translateY(-2px);
  }
`;

const IngredientList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
`;

const IngredientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const IngredientText = styled.span`
  font-size: 14px;
  color: #333;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.1);
  }
`;

const EmptyMessage = styled.div`
  color: #666;
  font-style: italic;
  text-align: center;
  width: 100%;
  padding: 20px;
`;

const AnalyzeButton = styled.button`
  display: block;
  margin: 30px auto;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(45deg, #74C0FC, #5BA4E5);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(116, 192, 252, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(116, 192, 252, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NutritionSection = styled.div`
  margin: 40px 0;
  text-align: center;

  h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 20px;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const NutritionCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const NutritionValue = styled.div`
  font-size: 2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const NutritionLabel = styled.div`
  font-size: 1.1em;
  color: #666;
`;

const RecipeSection = styled.div`
  margin: 40px 0;
  text-align: center;

  h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 20px;
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const RecipeCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const RecipeImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const RecipeContent = styled.div`
  padding: 20px;
`;

const RecipeTitle = styled.h3`
  font-size: 1.2em;
  color: #333;
  margin-bottom: 10px;
`;

const RecipeDetails = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
  color: #666;
`;

const RecipeDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RecipeLink = styled.a`
  display: inline-block;
  padding: 10px 20px;
  background: #74C0FC;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #5BA4E5;
    transform: translateY(-2px);
  }
`;
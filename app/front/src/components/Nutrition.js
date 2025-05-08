import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const fetchNutritionData = async (ingredient) => {
  try {
    const response = await fetch(`http://localhost:5001/get_nutrition?food=${ingredient}`);
    
    if (!response.ok) {
      throw new Error(`Server returned error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return null;
  }
};

const getServingSize = (nutritionData) => {
    if (nutritionData.ServingSize) {
      return `${nutritionData.ServingSize}g`;
    }
  
    if (nutritionData.foodNutrients && Array.isArray(nutritionData.foodNutrients)) {
      const waterNutrient = nutritionData.foodNutrients.find(nutrient => nutrient.nutrient.name === "Water");
      if (waterNutrient && waterNutrient.amount) {
        return `${waterNutrient.amount}g`;
      }
    }
  
    return "100g";
  };
  
  
  
const Nutrition = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    if (input.trim() !== '') {
      setIngredients([...ingredients, input.trim()]);
      setInput('');
    }
  };

  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
    setNutritionData(null);
  };

  const fetchNutrition = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError('');
    
    const nutritionResults = await Promise.all(
      ingredients.map(async (ingredient) => await fetchNutritionData(ingredient))
    );

    const validResults = nutritionResults.filter((data) => data !== null);

    if (validResults.length > 0) {
      const summedNutrition = sumNutrients(validResults);
      setNutritionData(summedNutrition);
    } else {
      setError("Failed to retrieve nutrition data.");
    }

    setLoading(false);
  };

  const sumNutrients = (nutritionList) => {
    const summed = {
      calories: 0,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbs: 0,
      dietaryFiber: 0,
      totalSugars: 0,
      protein: 0,
      servingSize: "100g"
    };
  
    nutritionList.forEach((item) => {
      const defaultServingSize = getServingSize(item);
      summed.servingSize = defaultServingSize;
  
      const servingSizeMultiplier = 1;
  
      Object.entries(item.Nutrients).forEach(([key, value]) => {
        const numValue = parseFloat(value.split(' ')[0]);
        if (!isNaN(numValue)) {
          if (key.includes("Energy")) summed.calories += numValue * servingSizeMultiplier;
          if (key.includes("Total Fat")) summed.totalFat += numValue * servingSizeMultiplier;
          if (key.includes("Saturated Fat")) summed.saturatedFat += numValue * servingSizeMultiplier;
          if (key.includes("Trans Fat")) summed.transFat += numValue * servingSizeMultiplier;
          if (key.includes("Cholesterol")) summed.cholesterol += numValue * servingSizeMultiplier;
          if (key.includes("Sodium")) summed.sodium += numValue * servingSizeMultiplier;
          if (key.includes("Total Carbohydrates")) summed.totalCarbs += numValue * servingSizeMultiplier;
          if (key.includes("Dietary Fiber")) summed.dietaryFiber += numValue * servingSizeMultiplier;
          if (key.includes("Total Sugars")) summed.totalSugars += numValue * servingSizeMultiplier;
          if (key.includes("Protein")) summed.protein += numValue * servingSizeMultiplier;
        }
      });
    });
  
    if (summed.addedSugars === 0) {
      summed.addedSugars = summed.totalSugars;
    }
  
    return summed;
  };
  
  const calculateDailyValue = (nutrient, value) => {
    const dailyValues = {
      totalFat: 78, 
      saturatedFat: 20, 
      cholesterol: 300, 
      sodium: 2300, 
      totalCarbs: 275, 
      dietaryFiber: 28, 
      addedSugars: 50, 
      protein: 50, 
      vitaminD: 20, 
      calcium: 1300, 
      iron: 18, 
      potassium: 4700
    };

    if (!dailyValues[nutrient] || value === 0) return 0;
    return Math.round((value / dailyValues[nutrient]) * 100);
  };

  return (
    <PageWrapper>
      <Header>
        <span>Nutrition Analyzer</span>
        <HomeButton onClick={() => navigate('/DietHome')}>Diet Home</HomeButton>
      </Header>
      <Content>
        <TitleSection>
          <h1>Analyze Your Food</h1>
          <p>Enter the ingredients you want to analyze:</p>
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

        <AnalyzeButton onClick={fetchNutrition} disabled={loading || ingredients.length === 0}>
          {loading ? "Analyzing..." : "Get Nutrition Info"}
        </AnalyzeButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {nutritionData && (
          <NutritionLabel 
            nutrition={nutritionData} 
            calculateDailyValue={calculateDailyValue}
          />
        )}
      </Content>
    </PageWrapper>
  );
};

const NutritionLabel = ({ nutrition, calculateDailyValue }) => {
  return (
    <LabelContainer>
      <LabelTitle>Nutrition Facts</LabelTitle>
      <ServingInfo>1 servings per container</ServingInfo>
      <ServingSizeRow>
        <span><strong>Serving size</strong></span>
        <span>{nutrition.servingSize}</span>
      </ServingSizeRow>

      <ThickDivider />

      <SmallText>Amount per serving</SmallText>
      <CalorieRow>
        <span>Calories</span>
        <span>{Math.round(nutrition.calories || 0)}</span>
      </CalorieRow>

      <MediumDivider />

      <DailyValueHeader>% Daily Value*</DailyValueHeader>

      <NutrientRow>
        <strong>Total Fat {(nutrition.totalFat || 0).toFixed(1)}g</strong>
        <strong>{calculateDailyValue('totalFat', nutrition.totalFat || 0)}%</strong>
      </NutrientRow>

      <NutrientRow indented>
        <span>Saturated Fat {(nutrition.saturatedFat || 0).toFixed(1)}g</span>
        <span>{calculateDailyValue('saturatedFat', nutrition.saturatedFat || 0)}%</span>
      </NutrientRow>

      <NutrientRow indented>
        <span>Trans Fat {(nutrition.transFat || 0).toFixed(1)}g</span>
      </NutrientRow>

      <NutrientRow>
        <strong>Cholesterol {(nutrition.cholesterol || 0).toFixed(0)}mg</strong>
        <strong>{calculateDailyValue('cholesterol', nutrition.cholesterol || 0)}%</strong>
      </NutrientRow>

      <NutrientRow>
        <strong>Sodium {(nutrition.sodium || 0).toFixed(0)}mg</strong>
        <strong>{calculateDailyValue('sodium', nutrition.sodium || 0)}%</strong>
      </NutrientRow>

      <NutrientRow>
        <strong>Total Carbohydrate {(nutrition.totalCarbs || 0).toFixed(0)}g</strong>
        <strong>{calculateDailyValue('totalCarbs', nutrition.totalCarbs || 0)}%</strong>
      </NutrientRow>

      <NutrientRow indented>
        <span>Dietary Fiber {(nutrition.dietaryFiber || 0).toFixed(0)}g</span>
        <span>{calculateDailyValue('dietaryFiber', nutrition.dietaryFiber || 0)}%</span>
      </NutrientRow>

      <NutrientRow indented>
        <span>Total Sugars {(nutrition.totalSugars || 0).toFixed(0)}g</span>
        <span>{calculateDailyValue('addedSugars', nutrition.totalSugars || 0)}%</span>
      </NutrientRow>

      <NutrientRow>
        <strong>Protein {(nutrition.protein || 0).toFixed(0)}g</strong>
        <strong>{calculateDailyValue('protein', nutrition.protein || 0)}%</strong>
      </NutrientRow>

      <ThickDivider />

      <SmallText>
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
      </SmallText>
    </LabelContainer>
  );
};

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
  max-width: 800px;
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

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  margin: 20px 0;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 10px;
`;

const LabelContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 30px auto;
`;

const LabelTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  color: #333;
`;

const ServingInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const ServingSizeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
`;

const ThickDivider = styled.hr`
  border: none;
  border-top: 8px solid black;
  margin: 10px 0;
`;

const MediumDivider = styled.hr`
  border: none;
  border-top: 1px solid black;
  margin: 10px 0;
`;

const SmallText = styled.div`
  font-size: 12px;
  color: #666;
  margin: 10px 0;
`;

const CalorieRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
`;

const DailyValueHeader = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
`;

const NutrientRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin: 5px 0;
  padding-left: ${props => props.indented ? '20px' : '0'};
`;

export default Nutrition;
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
        <h1>Analyze Your Food</h1>
        <p>Enter the ingredients you want to analyze:</p>

        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter an ingredient"
            onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
          />
          <button onClick={addIngredient}>Add</button>
        </div>

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
        <span>{nutrition.servingSize}</span> {}
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
      </NutrientRow>

      <NutrientRow doubleIndented>
        <span>Includes {(nutrition.addedSugars || 0).toFixed(0)}g Added Sugars</span>
        <span>{calculateDailyValue('addedSugars', nutrition.addedSugars || 0)}%</span>
      </NutrientRow>

      <NutrientRow>
        <strong>Protein {(nutrition.protein || 0).toFixed(0)}g</strong>
      </NutrientRow>

      <Divider />
    </LabelContainer>
  );
};

export default Nutrition;


const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(125% 125% at 50% 10%, #a60064 40%, #000 100%);
  color: white;
  text-align: center;
  padding: 80px 20px 20px;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgb(201, 80, 169);
`;

const HomeButton = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  background-color: #fff;
  color: rgb(217, 176, 255);
  border-radius: 1em;
  cursor: pointer;
`;

const Content = styled.div`
  text-align: center;
  width: 100%;
  max-width: 600px;

  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }

  p {
    font-size: 18px;
  }

  input {
    padding: 8px;
    margin-right: 10px;
    border-radius: 4px;
    border: none;
  }

  button {
    padding: 8px 16px;
    background: white;
    color: #a60064;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    
    &:hover {
      background: #f0f0f0;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;


const IngredientList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 15px 0;
  text-align: left;
  width: 100%;
`;

const IngredientItem = styled.li`
  background-color: rgba(255, 255, 255, 0.1);
  margin-bottom: 5px;
  padding: 8px 15px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IngredientText = styled.span`
  flex-grow: 1;
`;

const RemoveButton = styled.button`
  background: transparent !important;
  color: white !important;
  border: none;
  padding: 0 8px !important;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 50%;
  }
`;

const EmptyMessage = styled.li`
  text-align: center;
  font-style: italic;
  padding: 10px;
  opacity: 0.7;
`;

const AnalyzeButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px !important;
  font-size: 16px;
  min-width: 200px;
`;

const LabelContainer = styled.div`
  background: white;
  color: black;
  padding: 10px;
  border: 1px solid black;
  width: 270px;
  margin: 20px auto;
  text-align: left;
  font-family: Arial, sans-serif;
`;

const LabelTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  padding: 0;
`;

const ServingInfo = styled.p`
  margin: 0;
  padding: 0;
  font-size: 14px;
`;

const ServingSizeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1px 0;
  font-size: 14px;
`;

const ThickDivider = styled.div`
  height: 6px;
  background-color: black;
  margin: 2px 0;
`;

const MediumDivider = styled.div`
  height: 3px;
  background-color: black;
  margin: 2px 0;
`;

const Divider = styled.div`
  height: 1px;
  background-color: black;
  margin: 2px 0;
`;

const SmallText = styled.p`
  font-size: 10px;
  margin: 1px 0;
  font-weight: bold;
`;

const CalorieRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
`;

const DailyValueHeader = styled.div`
  text-align: right;
  font-size: 10px;
  margin: 1px 0;
`;

const NutrientRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 1px 0;
  font-size: 14px;
  padding-left: ${props => props.indented ? '20px' : props.doubleIndented ? '40px' : '0'};
`;

const Footnote = styled.p`
  font-size: 10px;
  margin-top: 5px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 16px;
  margin-top: 10px;
`;
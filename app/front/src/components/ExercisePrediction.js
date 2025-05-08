import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';

const ExercisePrediction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [userHistory, setUserHistory] = useState({
    savedWorkouts: [],
    ratedWorkouts: []
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        const idToken = await user.getIdToken();

        const savedResponse = await axios.get('/api/saved-workouts', {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        const ratedWorkouts = savedResponse.data.filter(workout => 
          workout.ratings && Object.keys(workout.ratings).length > 0
        );

        setUserHistory({
          savedWorkouts: savedResponse.data,
          ratedWorkouts
        });

        const recommendationsResponse = await axios.post('/api/exercise/ai-recommendations', {
          savedWorkouts: savedResponse.data,
          ratedWorkouts
        }, {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        setRecommendations(recommendationsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recommendations. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Analyzing your workout history...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => navigate('/exercise-home')}>Back to Exercise Home</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>AI Workout Recommendations</Title>
        <BackButton onClick={() => navigate('/exercise-home')}>Back to Exercise Home</BackButton>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Your Workout History</SectionTitle>
          <StatsContainer>
            <StatCard>
              <StatNumber>{userHistory.savedWorkouts.length}</StatNumber>
              <StatLabel>Saved Workouts</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{userHistory.ratedWorkouts.length}</StatNumber>
              <StatLabel>Rated Workouts</StatLabel>
            </StatCard>
          </StatsContainer>
        </Section>

        {recommendations && (
          <>
            <Section>
              <SectionTitle>Recommended Exercises</SectionTitle>
              <RecommendationGrid>
                {recommendations.recommendedExercises.map((exercise, index) => (
                  <ExerciseCard key={index}>
                    <ExerciseName>{exercise.name}</ExerciseName>
                    <ExerciseDetails>
                      <DetailItem>
                        <Label>Target:</Label>
                        <Value>{exercise.target}</Value>
                      </DetailItem>
                      <DetailItem>
                        <Label>Equipment:</Label>
                        <Value>{exercise.equipment}</Value>
                      </DetailItem>
                      <DetailItem>
                        <Label>Confidence Score:</Label>
                        <Value>{exercise.confidenceScore}%</Value>
                      </DetailItem>
                    </ExerciseDetails>
                  </ExerciseCard>
                ))}
              </RecommendationGrid>
            </Section>

            <Section>
              <SectionTitle>Workout Patterns</SectionTitle>
              <PatternCard>
                <PatternTitle>Your Preferred Split Types</PatternTitle>
                <PatternList>
                  {recommendations.preferredSplitTypes.map((split, index) => (
                    <PatternItem key={index}>
                      <PatternName>{split.name}</PatternName>
                      <PatternScore>{split.score}% match</PatternScore>
                    </PatternItem>
                  ))}
                </PatternList>
              </PatternCard>
            </Section>

            <Section>
              <SectionTitle>Suggested Next Steps</SectionTitle>
              <SuggestionList>
                {recommendations.suggestions.map((suggestion, index) => (
                  <SuggestionItem key={index}>
                    <SuggestionIcon>💡</SuggestionIcon>
                    <SuggestionText>{suggestion}</SuggestionText>
                  </SuggestionItem>
                ))}
              </SuggestionList>
            </Section>
          </>
        )}
      </Content>
    </Container>
  );
};

export default ExercisePrediction;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(45deg, #B7E4C7, #FFE066, #74C0FC, #c4a7e7);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  padding: 20px;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 2rem;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: #fff;
  border: 2px solid #74C0FC;
  border-radius: 8px;
  color: #74C0FC;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #74C0FC;
    color: #fff;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const StatCard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-width: 150px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #74C0FC;
`;

const StatLabel = styled.div`
  color: #666;
  margin-top: 5px;
`;

const RecommendationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ExerciseCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ExerciseName = styled.h3`
  color: #333;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
`;

const ExerciseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  color: #666;
  font-weight: 500;
`;

const Value = styled.span`
  color: #333;
  font-weight: bold;
`;

const PatternCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
`;

const PatternTitle = styled.h3`
  color: #333;
  margin: 0 0 15px 0;
`;

const PatternList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PatternItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
`;

const PatternName = styled.span`
  font-weight: 500;
  color: #333;
`;

const PatternScore = styled.span`
  color: #74C0FC;
  font-weight: bold;
`;

const SuggestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

const SuggestionIcon = styled.span`
  font-size: 1.5rem;
`;

const SuggestionText = styled.p`
  margin: 0;
  color: #333;
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: #333;
  margin-top: 50px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #dc3545;
  font-size: 1.2rem;
  margin: 20px 0;
`; 
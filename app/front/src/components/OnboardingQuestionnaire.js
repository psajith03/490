import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';

const OnboardingQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    preferredName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    fitnessGoals: [],
    dietaryRestrictions: [],
    injuries: '',
    workoutFrequency: '',
    preferredWorkoutTime: '',
    equipmentAccess: [],
    experienceLevel: '',
    sleepSchedule: '',
    stressLevel: '',
    medicalConditions: ''
  });
  const [isComplete, setIsComplete] = useState(false);

  const questions = [
    {
      id: 'basicInfo',
      title: 'Basic Information',
      fields: [
        {
          name: 'preferredName',
          label: 'Preferred Name or Nickname',
          type: 'text',
          placeholder: 'Enter your preferred name'
        },
        {
          name: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'Enter your age'
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Other', 'Prefer not to say']
        },
        {
          name: 'height',
          label: 'Height (inches)',
          type: 'number',
          placeholder: 'Enter your height in inches'
        },
        {
          name: 'weight',
          label: 'Weight (lbs)',
          type: 'number',
          placeholder: 'Enter your weight in lbs'
        }
      ]
    },
    {
      id: 'fitnessProfile',
      title: 'Fitness Profile',
      fields: [
        {
          name: 'activityLevel',
          label: 'Activity Level',
          type: 'select',
          options: [
            'Sedentary (office job, little exercise)',
            'Lightly Active (light exercise 1-3 days/week)',
            'Moderately Active (moderate exercise 3-5 days/week)',
            'Very Active (hard exercise 6-7 days/week)',
            'Extremely Active (very hard exercise, physical job)'
          ]
        },
        {
          name: 'fitnessGoals',
          label: 'Fitness Goals (select all that apply)',
          type: 'multiSelect',
          options: [
            'Weight Loss',
            'Muscle Gain',
            'Improve Strength',
            'Increase Flexibility',
            'Improve Endurance',
            'Better Overall Health',
            'Sports Performance'
          ]
        }
      ]
    },
    {
      id: 'healthInfo',
      title: 'Health Information',
      fields: [
        {
          name: 'dietaryRestrictions',
          label: 'Dietary Restrictions (select all that apply)',
          type: 'multiSelect',
          options: [
            'None',
            'Vegetarian',
            'Vegan',
            'Gluten-Free',
            'Lactose Intolerant',
            'Nut Allergy',
            'Other'
          ]
        },
        {
          name: 'injuries',
          label: 'Current or Past Injuries',
          type: 'textarea',
          placeholder: 'Please describe any injuries we should know about'
        },
        {
          name: 'medicalConditions',
          label: 'Medical Conditions',
          type: 'textarea',
          placeholder: 'Please list any relevant medical conditions'
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Workout Preferences',
      fields: [
        {
          name: 'workoutFrequency',
          label: 'Preferred Workout Frequency',
          type: 'select',
          options: [
            '1-2 times per week',
            '3-4 times per week',
            '5-6 times per week',
            'Every day'
          ]
        },
        {
          name: 'preferredWorkoutTime',
          label: 'Preferred Workout Time',
          type: 'select',
          options: [
            'Early Morning',
            'Late Morning',
            'Afternoon',
            'Evening',
            'Late Night'
          ]
        },
        {
          name: 'equipmentAccess',
          label: 'Available Equipment (select all that apply)',
          type: 'multiSelect',
          options: [
            'None (Bodyweight only)',
            'Dumbbells',
            'Resistance Bands',
            'Full Home Gym',
            'Gym Membership'
          ]
        },
        {
          name: 'experienceLevel',
          label: 'Fitness Experience Level',
          type: 'select',
          options: [
            'Beginner',
            'Intermediate',
            'Advanced'
          ]
        }
      ]
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateForm = () => {
    const requiredFields = {
      age: 'Age',
      gender: 'Gender',
      height: 'Height',
      weight: 'Weight',
      activityLevel: 'Activity Level',
      fitnessGoals: 'Fitness Goals',
      workoutFrequency: 'Workout Frequency',
      experienceLevel: 'Experience Level'
    };

    const missingFields = [];
    
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (field === 'fitnessGoals') {
        if (formData[field].length === 0) {
          missingFields.push(label);
        }
      } else if (!formData[field]) {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.age < 13 || formData.age > 100) {
      alert('Please enter a valid age between 13 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      console.error("Authentication error: No current user found.");
      alert("Session expired. Please log in again.");
      navigate('/');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken(true);
      console.log("Sending ID Token:", idToken);
      const apiBase = "http://localhost:5000";
      console.log("Submitting form data:", JSON.stringify(formData, null, 2));

      const response = await fetch(`${apiBase}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save profile data. Server response: ${errorText}`);
      }

      const userResponse = await fetch(`${apiBase}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`Failed to fetch updated user data. Server response: ${errorText}`);
      }

      const userData = await userResponse.json();
      console.log("Updated user data received:", userData);

      if (userData.isOnboardingComplete) {
        console.log("Onboarding complete! Navigating to home...");

        navigate('/home');

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.warn("Onboarding still incomplete after update:", userData);
      }
    } catch (error) {
      console.error('🚨 Error saving questionnaire:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <SelectWrapper>
            <label>{field.label}</label>
            <select
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            >
              <option value="">Select an option</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </SelectWrapper>
        );

      case 'multiSelect':
        return (
          <MultiSelectWrapper>
            <label>{field.label}</label>
            <div className="options">
              {field.options.map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData[field.name].includes(option)}
                    onChange={() => handleMultiSelect(field.name, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </MultiSelectWrapper>
        );

      case 'textarea':
        return (
          <TextAreaWrapper>
            <label>{field.label}</label>
            <textarea
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          </TextAreaWrapper>
        );

      default:
        return (
          <InputWrapper>
            <label>{field.label}</label>
            <input
              type={field.type}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          </InputWrapper>
        );
    }
  };

  return (
    <QuestionnaireWrapper>
      {isComplete ? (
        <div className="completion-container">
          <h2>Thank you for completing the questionnaire!</h2>
        </div>
      ) : (
        <div className="questionnaire-container">
          <h2>{questions[currentStep].title}</h2>
          <div className="fields-container">
            {questions[currentStep].fields.map(field => (
              <div key={field.name} className="field">
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="navigation-buttons">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)}>
                Previous
              </button>
            )}
            {currentStep < questions.length - 1 ? (
              <button onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
              </button>
            ) : (
              <button onClick={handleSubmit}>
                Complete
              </button>
            )}
          </div>
          <div className="progress-indicator">
            Step {currentStep + 1} of {questions.length}
          </div>
        </div>
      )}
    </QuestionnaireWrapper>
  );
};

const QuestionnaireWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;

  .questionnaire-container, .completion-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    text-align: center;

    h2 {
      margin-bottom: 30px;
      color: #323232;
    }

    .fields-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }

    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;

      button {
        padding: 10px 20px;
        border: 2px solid #323232;
        border-radius: 5px;
        background-color: white;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 4px 4px #323232;
        transition: all 0.2s ease;

        &:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px #323232;
        }
      }
    }

    .progress-indicator {
      color: #666;
    }
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #323232;
  }

  input {
    padding: 10px;
    border: 2px solid #323232;
    border-radius: 5px;
    font-size: 16px;
    box-shadow: 4px 4px #323232;

    &:focus {
      outline: none;
      border-color: #2d8cf0;
    }
  }
`;

const SelectWrapper = styled(InputWrapper)`
  select {
    padding: 10px;
    border: 2px solid #323232;
    border-radius: 5px;
    font-size: 16px;
    background-color: white;
    box-shadow: 4px 4px #323232;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #2d8cf0;
    }
  }
`;

const MultiSelectWrapper = styled(InputWrapper)`
  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
  }
`;

const TextAreaWrapper = styled(InputWrapper)`
  textarea {
    padding: 10px;
    border: 2px solid #323232;
    border-radius: 5px;
    font-size: 16px;
    min-height: 100px;
    resize: vertical;
    box-shadow: 4px 4px #323232;

    &:focus {
      outline: none;
      border-color: #2d8cf0;
    }
  }
`;

export default OnboardingQuestionnaire;
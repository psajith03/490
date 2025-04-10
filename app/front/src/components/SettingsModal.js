import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SettingsModal = ({ isOpen, onClose, currentName, onNameChange }) => {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onNameChange(newName);
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>Settings</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Your Name</Label>
            <Input
              type="text"
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your name"
            />
          </FormGroup>
          <SubmitButton type="submit">Save Changes</SubmitButton>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #74C0FC;
  }
`;

const SubmitButton = styled.button`
  background-color: #74C0FC;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background-color: #5aa8e0;
  }
`;

export default SettingsModal; 
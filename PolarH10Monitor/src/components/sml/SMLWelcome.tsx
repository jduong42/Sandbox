import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { smlScreenStyles as styles } from '../../theme/smlScreen';

interface SMLWelcomeProps {
  commonQuestions: string[];
  onQuestionSelect: (question: string) => void;
}

export const SMLWelcome: React.FC<SMLWelcomeProps> = ({
  commonQuestions,
  onQuestionSelect,
}) => {
  return (
    <ScrollView
      style={styles.chatContainer}
      contentContainerStyle={styles.welcomeContainer}
    >
      <Text style={styles.welcomeTitle}>Welcome to your AI Sports Coach!</Text>
      <Text style={styles.welcomeText}>
        Ask me anything about sports science, training, nutrition, recovery, or
        performance optimization. I'm here to help you reach your goals!
      </Text>

      <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
      {commonQuestions.map((question, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickQuestionCard}
          onPress={() => onQuestionSelect(question)}
        >
          <Text style={styles.quickQuestionText}>{question}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SMLWelcome;

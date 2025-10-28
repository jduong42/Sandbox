import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { theme } from '../../theme';
import { smlScreenStyles as styles } from '../../theme/smlScreen';

interface SMLInputProps {
  question: string;
  setQuestion: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isInitialized: boolean;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
}

export const SMLInput: React.FC<SMLInputProps> = ({
  question,
  setQuestion,
  onSend,
  isLoading,
  isInitialized,
  isInputFocused,
  setIsInputFocused,
}) => {
  const canSend = question.trim() && !isLoading && isInitialized;

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.textInput, isInputFocused && styles.textInputFocused]}
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask about training, nutrition, recovery..."
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        maxLength={500}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        editable={!isLoading && isInitialized}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        <NativeIcon
          name={isLoading ? 'hourglass' : 'send'}
          size={20}
          color={canSend ? 'white' : theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SMLInput;

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Surface } from 'react-native-paper';
import NativeIcon from '../common/NativeIcon';
import { theme } from '../../theme';
import { llamaTestScreenStyles as styles } from '../../theme/llamaTestScreen';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  isGenerating: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSend,
  isGenerating,
}) => {
  const canSend = inputText.trim() && !isGenerating;

  return (
    <View style={styles.inputContainer}>
      <Surface style={styles.inputSurface}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about training, recovery, heart rate zones..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          scrollEnabled
          returnKeyType="send"
          onSubmitEditing={canSend ? onSend : undefined}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!canSend}
        >
          <NativeIcon
            name="send"
            size={20}
            color={canSend ? 'white' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

export default ChatInput;

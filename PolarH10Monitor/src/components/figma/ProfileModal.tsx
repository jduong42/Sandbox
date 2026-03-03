import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/NavigationTypes';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../common/Toast';

type Nav = StackNavigationProp<RootStackParamList>;

interface ProfileModalProps {
  onClose: () => void;
}

type ViewMode = 'profile' | 'login' | 'signup';

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { c } = useTheme();
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const navigation = useNavigation<Nav>();

  const [viewMode, setViewMode] = useState<ViewMode>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, show, hide } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      show('Please fill in all fields.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      show('Welcome back! 👋', 'success');
      setTimeout(() => setViewMode('profile'), 1200);
    } catch {
      show('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      show('Please fill in all fields.', 'error');
      return;
    }
    if (signupPassword.length < 6) {
      show('Password must be at least 6 characters.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await signup(signupName.trim(), signupEmail.trim(), signupPassword);
      show('Account created! Welcome 🎉', 'success');
      setTimeout(() => setViewMode('profile'), 1200);
    } catch {
      show('Signup failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const title =
    viewMode === 'profile'
      ? 'Profile'
      : viewMode === 'login'
      ? 'Log In'
      : 'Sign Up';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop: tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sheet centred over backdrop */}
        <View style={styles.overlay} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[
              styles.sheet,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <View style={styles.headerLeft}>
                <LinearGradient
                  colors={['#a855f7', '#ec4899']}
                  style={styles.avatarSmall}
                >
                  <Text style={styles.avatarSmallText}>
                    {isAuthenticated && user ? user.avatar : '👤'}
                  </Text>
                </LinearGradient>
                <Text style={[styles.title, { color: c.foreground }]}>
                  {title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: c.accent }]}
                accessibilityLabel="Close"
              >
                <Text style={[styles.closeBtnText, { color: c.foreground }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentInner}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Profile view ── */}
              {viewMode === 'profile' && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      {/* Logged-in user */}
                      <View style={styles.userInfoCenter}>
                        <LinearGradient
                          colors={['#a855f7', '#ec4899']}
                          style={styles.avatarLarge}
                        >
                          <Text style={styles.avatarLargeText}>
                            {user.avatar}
                          </Text>
                        </LinearGradient>
                        <Text
                          style={[styles.userName, { color: c.foreground }]}
                        >
                          {user.name}
                        </Text>
                        <Text style={[styles.userEmail, { color: c.muted }]}>
                          ✉️ {user.email}
                        </Text>
                      </View>

                      <View style={styles.buttonStack}>
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: c.accent,
                              borderColor: c.border,
                            },
                          ]}
                          onPress={() => {
                            onClose();
                            navigation.navigate('ProfileSettings');
                          }}
                        >
                          <Text style={styles.actionBtnIcon}>⚙️</Text>
                          <Text
                            style={[
                              styles.actionBtnLabel,
                              { color: c.foreground },
                            ]}
                          >
                            Profile Settings
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.logoutBtn}
                          onPress={handleLogout}
                        >
                          <Text style={styles.logoutBtnIcon}>🚪</Text>
                          <Text style={styles.logoutBtnLabel}>Log Out</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      {/* Guest state */}
                      <View style={styles.userInfoCenter}>
                        <View
                          style={[
                            styles.guestAvatar,
                            { backgroundColor: c.accent },
                          ]}
                        >
                          <Text style={styles.guestAvatarText}>👤</Text>
                        </View>
                        <Text
                          style={[styles.userName, { color: c.foreground }]}
                        >
                          Not Logged In
                        </Text>
                        <Text
                          style={[styles.guestSubtitle, { color: c.muted }]}
                        >
                          Log in or create an account to sync your data
                        </Text>
                      </View>

                      <View style={styles.buttonStack}>
                        <LinearGradient
                          colors={['#a855f7', '#ec4899']}
                          style={styles.gradientBtnWrap}
                        >
                          <TouchableOpacity
                            style={styles.gradientBtn}
                            onPress={() => setViewMode('login')}
                          >
                            <Text style={styles.gradientBtnLabel}>Log In</Text>
                          </TouchableOpacity>
                        </LinearGradient>

                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: c.accent,
                              borderColor: c.border,
                            },
                          ]}
                          onPress={() => setViewMode('signup')}
                        >
                          <Text
                            style={[
                              styles.actionBtnLabel,
                              { color: c.foreground },
                            ]}
                          >
                            Create Account
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}

              {/* ── Login form ── */}
              {viewMode === 'login' && (
                <View style={styles.form}>
                  <FormField
                    label="Email"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    c={c}
                  />
                  <FormField
                    label="Password"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    editable={!isLoading}
                    c={c}
                  />

                  <LinearGradient
                    colors={
                      isLoading
                        ? ['#6b7280', '#6b7280']
                        : ['#a855f7', '#ec4899']
                    }
                    style={[styles.gradientBtnWrap, { marginTop: 8 }]}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtn}
                      onPress={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.gradientBtnLabel}>Log In</Text>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>

                  <TouchableOpacity
                    onPress={() => setViewMode('profile')}
                    disabled={isLoading}
                    style={styles.backBtn}
                  >
                    <Text style={[styles.backBtnLabel, { color: c.muted }]}>
                      ← Back
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Signup form ── */}
              {viewMode === 'signup' && (
                <View style={styles.form}>
                  <FormField
                    label="Name"
                    value={signupName}
                    onChangeText={setSignupName}
                    placeholder="Alex Johnson"
                    editable={!isLoading}
                    c={c}
                  />
                  <FormField
                    label="Email"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    c={c}
                  />
                  <FormField
                    label="Password"
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    editable={!isLoading}
                    c={c}
                  />

                  <LinearGradient
                    colors={
                      isLoading
                        ? ['#6b7280', '#6b7280']
                        : ['#a855f7', '#ec4899']
                    }
                    style={[styles.gradientBtnWrap, { marginTop: 8 }]}
                  >
                    <TouchableOpacity
                      style={styles.gradientBtn}
                      onPress={handleSignup}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.gradientBtnLabel}>
                          Create Account
                        </Text>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>

                  <TouchableOpacity
                    onPress={() => setViewMode('profile')}
                    disabled={isLoading}
                    style={styles.backBtn}
                  >
                    <Text style={[styles.backBtnLabel, { color: c.muted }]}>
                      ← Back
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={hide}
        />
      </View>
    </Modal>
  );
}

// ─── Small reusable form field ────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  editable?: boolean;
  c: Record<string, any>;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  c,
}: FormFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: c.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor: c.accent,
            borderColor: c.border,
            color: c.foreground,
            opacity: editable ? 1 : 0.5,
          },
        ]}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    maxHeight: 520,
  },
  contentInner: {
    padding: 20,
  },
  // ── User info ──
  userInfoCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guestAvatarText: {
    fontSize: 36,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
  },
  guestSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  // ── Buttons ──
  buttonStack: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  actionBtnLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  logoutBtnIcon: {
    fontSize: 18,
  },
  logoutBtnLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ef4444',
  },
  gradientBtnWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  gradientBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // ── Form ──
  form: {
    gap: 16,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backBtnLabel: {
    fontSize: 14,
  },
});

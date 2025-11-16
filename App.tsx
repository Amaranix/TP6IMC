import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Enhanced single-file IMC (BMI) calculator
// - Updated categories and images per category
// - Image displayed centered under the IMC + category
// - Legend updated to 5 categories

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.safe, isDarkMode && styles.safeDark]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <IMCForm isDarkMode={isDarkMode} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function IMCForm({ isDarkMode }) {
  const [poids, setPoids] = useState('');
  const [taille, setTaille] = useState('');
  const [imc, setImc] = useState(null);
  const [categorie, setCategorie] = useState('');
  const [message, setMessage] = useState('');

  // animations
  const cardAnim = useRef(new Animated.Value(0)).current; // for entry
  const valueAnim = useRef(new Animated.Value(0)).current; // for counting imc
  const btnScale = useRef(new Animated.Value(1)).current; // press effect
  const progress = useRef(new Animated.Value(0)).current; // progress bar

  useEffect(() => {
    // entry animation on mount
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  useEffect(() => {
    // when imc changes animate the displayed number and progress
    if (imc !== null) {
      const numeric = parseFloat(imc);
      valueAnim.setValue(0);
      Animated.timing(valueAnim, {
        toValue: numeric,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // numeric animation (text) can't use native driver
      }).start();

      // map BMI to a progress [0..1] relative to [15 .. 40]
      const min = 15;
      const max = 40;
      const clamped = Math.max(min, Math.min(max, numeric));
      const pct = (clamped - min) / (max - min);
      Animated.timing(progress, {
        toValue: pct,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      // reset progress
      Animated.timing(progress, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [imc, valueAnim, progress]);

  const calculerIMC = () => {
    Keyboard.dismiss();
    const p = parseFloat(poids.replace(',', '.'));
    const t = parseFloat(taille.replace(',', '.')) / 100; // cm → m
    if (isNaN(p) || isNaN(t) || t <= 0 || p <= 0) {
      setMessage('Veuillez entrer des valeurs numériques valides (ex: 72, 175).');
      setImc(null);
      setCategorie('');
      return;
    }
    setMessage('');
    const resultat = p / (t * t);
    const rounded = parseFloat(resultat.toFixed(2));
    setImc(rounded);
    setCategorie(getCategorie(rounded));
  };

  // Updated categories:
  // Maigreur: IMC < 18.5
  // Normal: 18.5 ≤ IMC < 25
  // Surpoids: 25 ≤ IMC < 30
  // Obésité modérée: 30 ≤ IMC < 40
  // Obésité sévère: IMC ≥ 40
  const getCategorie = (imcValue) => {
    if (imcValue < 18.5) return 'Maigreur';
    if (imcValue < 25) return 'Normal';
    if (imcValue < 30) return 'Surpoids';
    if (imcValue < 40) return 'Obésité modérée';
    return 'Obésité sévère';
  };

  const getCategoryColor = (imcValue) => {
    if (imcValue == null) return '#999';
    if (imcValue < 18.5) return '#4A90E2'; // blue - maigreur
    if (imcValue < 25) return '#2ECC71'; // green - normal
    if (imcValue < 30) return '#F5A623'; // orange - surpoids
    if (imcValue < 40) return '#FF7F50'; // coral - obésité modérée
    return '#E74C3C'; // red - obésité sévère
  };

  // map category -> local image in same folder
  const getCategoryImage = (category) => {
    switch (category) {
      case 'Maigreur':
        return require('./Maigreur.png');
      case 'Normal':
        return require('./Normal.png');
      case 'Surpoids':
        return require('./Surpoids.png');
      case 'Obésité modérée':
        return require('./ObesiteModeree.png');
      case 'Obésité sévère':
        return require('./ObesiteSevere.png');
      default:
        return null;
    }
  };

  const onPressIn = () => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const reset = () => {
    setPoids('');
    setTaille('');
    setImc(null);
    setCategorie('');
    setMessage('');
  };

  // interpolated styles
  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const cardOpacity = cardAnim;

  const displayedValue = valueAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: cardTranslate }], opacity: cardOpacity },
      ]}
    >
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>Calculateur d'IMC</Text>

      <View style={styles.formRow}>
        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Poids (kg) — ex: 72"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          keyboardType="numeric"
          value={poids}
          onChangeText={setPoids}
          returnKeyType="next"
          accessibilityLabel="Poids en kilogrammes"
        />

        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Taille (cm) — ex: 175"
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          keyboardType="numeric"
          value={taille}
          onChangeText={setTaille}
          returnKeyType="done"
          accessibilityLabel="Taille en centimètres"
        />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.buttonsRow}>
        <Pressable
          onPress={calculerIMC}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessibilityRole="button"
          accessibilityLabel="Calculer l'IMC"
        >
          <Animated.View style={[styles.button, { transform: [{ scale: btnScale }] }]}>
            <Text style={styles.buttonText}>Calculer</Text>
          </Animated.View>
        </Pressable>

        <Pressable onPress={reset} accessibilityRole="button">
          <View style={styles.resetButton}>
            <Text style={styles.resetText}>Réinitialiser</Text>
          </View>
        </Pressable>
      </View>

      {/* result area */}
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Résultat</Text>
        </View>

        <View style={styles.resultBody}>
          <View style={styles.resultLeft}>
            <Text style={styles.imcLabel}>IMC</Text>

            <Animated.Text
              style={[
                styles.imcValue,
                { color: getCategoryColor(imc) },
              ]}
            >
              {imc === null ? '--' : imc.toFixed ? imc.toFixed(2) : imc}
            </Animated.Text>

            <Text style={styles.categoryText}>{categorie || "-"}</Text>

            {/* image centered under the result */}
            {categorie ? (
              <Image
                source={getCategoryImage(categorie)}
                style={styles.categoryImage}
                accessible
                accessibilityLabel={`Image illustrant la catégorie ${categorie}`}
              />
            ) : null}
          </View>

          <View style={styles.resultRight}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: getCategoryColor(imc),
                  },
                ]}
              />
            </View>

            <View style={styles.legendRow}>
              <Legend color="#4A90E2" label="Maigreur" />
              <Legend color="#2ECC71" label="Normal" />
              <Legend color="#F5A623" label="Surpoids" />
              <Legend color="#FF7F50" label="Obésité modérée" />
              <Legend color="#E74C3C" label="Obésité sévère" />
            </View>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Conseil</Text>
              <Text style={styles.tipsText}>{pickTip(categorie)}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>Conçu avec ❤️ — Entrez des chiffres et appuyez sur Calculer</Text>
    </Animated.View>
  );
}

function Legend({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function pickTip(category) {
  switch (category) {
    case 'Maigreur':
      return "Augmentez légèrement l'apport calorique et privilégiez les aliments riches en nutriments.";
    case 'Normal':
      return "Continuez votre mode de vie — alimentation équilibrée + activité régulière.";
    case 'Surpoids':
      return "Réduisez les aliments transformés, bougez plus — consultez un professionnel si besoin.";
    case 'Obésité modérée':
      return "Adoptez une alimentation contrôlée et augmentez l'activité physique ; demandez un suivi si nécessaire.";
    case 'Obésité sévère':
      return "Consultez un professionnel de santé pour un accompagnement médical et un plan adapté.";
    default:
      return "Entrez vos informations puis appuyez sur Calculer pour obtenir des conseils.";
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  safeDark: { backgroundColor: '#0F1720' },
  scroll: { flexGrow: 1 },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', marginTop: 10, marginBottom: 18, color: '#111' },
  titleDark: { color: '#fff' },
  formRow: { width: '100%', gap: 10 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  inputDark: { backgroundColor: '#0b1220', borderColor: '#203040', color: '#fff' },
  message: { color: '#cc0000', marginBottom: 8 },
  buttonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 6 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
  },
  resetText: { color: '#334155', fontWeight: '600' },
  resultCard: {
    width: '100%',
    marginTop: 20,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  resultHeader: { marginBottom: 8 },
  resultTitle: { fontSize: 16, fontWeight: '700' },
  resultBody: { flexDirection: 'row', gap: 10 },
  resultLeft: { width: '40%', alignItems: 'center', justifyContent: 'center' },
  imcLabel: { fontSize: 12, color: '#94a3b8' },
  imcValue: { fontSize: 36, fontWeight: '900', marginTop: 4 },
  categoryText: { fontSize: 14, marginTop: 6, color: '#334155', fontWeight: '600', textAlign: 'center' },
  // image style for category illustration
  categoryImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 10,
  },
  resultRight: { width: '60%', paddingLeft: 10 },
  progressTrack: {
    height: 12,
    backgroundColor: '#eef2f7',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    borderRadius: 999,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: '#475569' },
  tipsBox: { marginTop: 12, backgroundColor: '#f8fafc', padding: 10, borderRadius: 10 },
  tipsTitle: { fontWeight: '700', marginBottom: 6 },
  tipsText: { fontSize: 13, color: '#334155' },
  footer: { marginTop: 18, color: '#64748b' },
});

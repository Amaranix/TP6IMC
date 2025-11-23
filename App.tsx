import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from 'react-native';

/*
  TP : "Card" Produit - Version professionnelle
  - Fichier unique : App.tsx
  - Images locales attendues dans le même dossier :
      Prod1.jpeg, Prod2.jpeg, Prod3.jpeg, Prod4.jpeg
    (si vos fichiers ont une extension différente, adaptez require())
  - Contraintes respectées : pas de position: 'absolute'
  - Fonctionnalités ajoutées :
      * Liste produit (FlatList)
      * Carte produit fidèle au design (ombre, coins arrondis, image en haut)
      * Titre + prix alignés (row + space-between)
      * Description courte
      * Bouton centré
      * Détail produit en modal
      * Animation d'appui sur la carte
      * Accessibilité
*/

type Product = {
  id: string;
  title: string;
  price: string;
  description: string;
  image: any;
  rating?: number;
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Baskets Vintage',
    price: '89,99 €',
    description: 'Baskets vintage, confortables et stylées pour tous les jours.',
    image: require('./Prod1.jpeg'),
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Chaussures Running',
    price: '129,00 €',
    description: "Chaussures légères pensées pour la performance et le confort.",
    image: require('./Prod2.jpeg'),
    rating: 4.2,
  },
  {
    id: '3',
    title: 'Air Max Rouge',
    price: '149,50 €',
    description: 'Edition limitée, semelle amortissante.',
    image: require('./Prod3.jpeg'),
    rating: 4.8,
  },
  {
    id: '4',
    title: 'Sneakers Urbaines',
    price: '99,00 €',
    description: 'Design moderne adapté à la ville et aux longues marches.',
    image: require('./Prod4.jpeg'),
    rating: 4.1,
  },
];

export default function App() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openDetails = (product: Product) => {
    setSelected(product);
    setModalVisible(true);
  };

  const closeDetails = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const renderItem = ({item}: {item: Product}) => (
    <ProductCard product={item} onPress={() => openDetails(item)} />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.header}>Produits phares</Text>

        <FlatList
          data={PRODUCTS}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          // vertical list; change to horizontal if you prefer
          showsVerticalScrollIndicator={false}
        />

        {/* Modal détails produit */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeDetails}
          transparent={Platform.OS === 'ios' ? true : false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent} accessibilityRole="dialog">
              <ScrollView>
                {selected && (
                  <>
                    <Image source={selected.image} style={styles.modalImage} />
                    <View style={styles.modalBody}>
                      <View style={styles.row}>
                        <Text style={styles.modalTitle}>{selected.title}</Text>
                        <Text style={styles.price}>{selected.price}</Text>
                      </View>

                      <Text style={styles.modalDescription}>{selected.description}</Text>

                      <TouchableOpacity
                        style={styles.primaryButton}
                        accessibilityLabel={`Acheter ${selected.title}`}
                        onPress={() => {
                          // ici on ferait l'ajout au panier
                          closeDetails();
                        }}>
                        <Text style={styles.primaryButtonText}>Acheter maintenant</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={closeDetails}
                        accessibilityLabel="Fermer la fenêtre de détail">
                        <Text style={styles.secondaryButtonText}>Fermer</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function ProductCard({product, onPress}: {product: Product; onPress: () => void}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, {transform: [{scale}]}]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`Voir détails ${product.title}`}>
        <View style={styles.card}>
          <Image source={product.image} style={styles.productImage} resizeMode="cover" />

          <View style={styles.row}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {product.description}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // action d'achat rapide
              onPress();
            }}
            accessibilityLabel={`Acheter ${product.title}`}>
            <Text style={styles.primaryButtonText}>Acheter maintenant</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f2f4f7'},
  container: {flex: 1, paddingHorizontal: 20, paddingTop: 18},
  header: {fontSize: 26, fontWeight: '700', marginBottom: 12, color: '#111'},
  list: {paddingBottom: 30},

  /* Card */
  cardWrapper: {marginBottom: 18},
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    // ombre iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // ombre Android
    elevation: 6,
  },
  productImage: {width: '100%', height: 180, borderRadius: 10, marginBottom: 10},

  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontSize: 17, fontWeight: '700', color: '#111', flex: 1, marginRight: 8},
  price: {fontSize: 17, fontWeight: '700', color: '#d32f2f'},
  description: {fontSize: 13, color: '#666', marginTop: 8},

  primaryButton: {
    backgroundColor: '#2e8b57',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  primaryButtonText: {color: '#fff', fontWeight: '700', fontSize: 15},

  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {color: '#2e8b57', fontWeight: '700'},

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.25)' : '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    // ombre
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: '90%'
  },
  modalImage: {width: '100%', height: 250},
  modalBody: {padding: 16},
  modalTitle: {fontSize: 20, fontWeight: '800', flex: 1},
  modalDescription: {color: '#555', marginTop: 10, fontSize: 14},
});

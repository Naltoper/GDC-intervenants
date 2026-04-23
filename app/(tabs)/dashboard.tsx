import { View, Text, StyleSheet, FlatList, ActivityIndicator, 
  RefreshControl, TouchableOpacity, Platform, Modal,
  ScrollView} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Clock, User, Shield, ChevronLeft, Info, X, MapPin, AlertTriangle} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Affiche la bannière en haut de l'écran
    shouldShowList: true,   // Garde la notification dans le centre de notifications
  }),
});


export default function DashboardScreen() {
  // -------------------------------------------------------------------------
  // 1. ÉTATS & VARIABLES (STATES)
  // -------------------------------------------------------------------------
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [filter, setFilter] = useState('Tous');
  const router = useRouter();

  // -------------------------------------------------------------------------
  // 2. LOGIQUE MÉTIER & APPELS API (LOGIC)
  // -------------------------------------------------------------------------

  // Fonction pour tester les notif quand test sur Expo go
  const testNotificationLocale = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 Test Signalement GDC",
        body: 'Ceci est une notification locale pour tester l\'affichage.',
        data: { reportId: 'test-123' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX, // Pour forcer la bannière sur Android
      },
      trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      },
    });
    
    if (Platform.OS === 'web') {
      alert("Test lancé ! (Ne fonctionne pas sur Web)");
    } else {
      alert("C'est bon ! Ferme l'app ou mets-la en arrière-plan, attends 5 secondes...");
    }
  };

  useEffect(() => {
    // 1. Écouteur pour le clic sur la notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Dès qu'on clique, on redirige vers le dashboard (ou une autre page)
      // router.replace force l'ouverture de l'app sur cette vue
      router.replace('/(tabs)/dashboard');
    });

    // 2. Nettoyage de l'écouteur quand on quitte l'écran
    return () => subscription.remove();
  }, []);

  // Récupération des signalements depuis Supabase
  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  // Gestion du status
  const updateStatus = async () => {
    if (!selectedReport) return;

    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', selectedReport.id);

    if (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } else {
      // On met à jour localement la liste pour éviter un rechargement complet
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status: newStatus } : r));
      setIsModalVisible(false);
    }
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    fetchReports();
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return; // Ne fonctionne pas sur simulateur

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;

    // CONFIGURATION DU CANAL ANDROID
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Signalements',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#023e8a', // Couleur de ta charte
      });
    }

    // Récupère le token Expo
    const token = (await Notifications.getExpoPushTokenAsync({
        projectId: "69174575-39f2-4d8e-9440-d9a3e148ec88" // Trouvable dans app.json ou sur Expo Dev Center 
    })).data;

    // Enregistre le token dans Supabase
    if (token) {
      await supabase
        .from('intervenant_tokens')
        .upsert({ expo_push_token: token }, { onConflict: 'expo_push_token' });
    }
  }

  // Fonction de rafraîchissement manuel
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  // Formatage de la date (ex: 21/03 à 14:30)
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' à');
  };

  // -------------------------------------------------------------------------
  // 3. RENDU DES SOUS-COMPOSANTS (SUB-RENDER)
  // -------------------------------------------------------------------------

  // Rendu d'une carte de signalement individuelle
  const renderItem = ({ item }: { item: any }) => {
    
    return (
      <View style={styles.card}>
        {/* En-tête de la carte : Auteur et Date */}
        <View style={styles.cardHeader}>
          <View style={styles.authorContainer}>
            {item.is_anonyme ? <Shield size={16} color="#64748b" /> : <User size={16} color="#023e8a" />}
            <Text style={[styles.typeText, { color: item.is_anonyme ? '#64748b' : '#023e8a' }]}>
              {item.is_anonyme ? " Anonyme" : ` ${item.author_name}`}
            </Text>
          </View>

          {/* --- NOUVEAU BOUTON INFOS --- */}
          <TouchableOpacity 
            onPress={() => {
              setSelectedReport(item);
              setIsDetailsVisible(true);
            }}
            style={styles.infoIconButton}
          >
            <Info size={22} color="#00b4d8" />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.dateText}> {formatDateTime(item.created_at)}</Text>
          </View>
        </View>
        
        {/* Corps de la carte : Contenu du message */}
        <Text style={styles.reportText}>{item.content}</Text>
        
        {/* Action : Bouton de réponse */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: `../chat/${item.id}`,
            params: { role: 'admin' }
          })}
        >
          <LinearGradient
            colors={["#48a4f4", "#00b4d8"]}
            style={styles.replyBtn}
          >
            <MessageCircle size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.replyBtnText}>Répondre à l&apos;élève</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Pied de la carte : Statut et Token */}
        <View style={styles.footer}>
          {/* Remplacer le View du badge par un TouchableOpacity */}
          <TouchableOpacity 
            style={[styles.badge, { backgroundColor: getStatusColor(item.status).bg }]}
            onPress={() => {
              setSelectedReport(item);
              setNewStatus(item.status);
              setIsModalVisible(true);
            }}
          >
            <View style={[styles.dot, { backgroundColor: getStatusColor(item.status).dot }]} />
            <Text style={[styles.badgeText, { color: getStatusColor(item.status).text }]}>
              {item.status}
            </Text>
          </TouchableOpacity>
          <Text style={styles.tokenText}>ID: {item.user_token?.split('_')[1] || '---'}</Text>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // 4. RENDU PRINCIPAL (MAIN RENDER)
  // -------------------------------------------------------------------------

  // Logique de filtrage
  const filteredReports = filter === 'Tous' 
    ? reports 
    : reports.filter(r => r.status === filter);

  return (
    <View style={styles.container}>
      {/* HEADER AVEC TITRE CENTRÉ ET BOUTON RETOUR */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')} 
          style={styles.backButton}
        >
          <ChevronLeft color="#023e8a" size={30} strokeWidth={2.5} />
        </TouchableOpacity>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Espace Intervenants</Text>
          <Text style={styles.subtitle}>{reports.length} signalement(s) au total</Text>
        </View>
      </View>
      {/* --- BOUTON DE TEST DE NOTIF --- */}
      {/* <TouchableOpacity 
        onPress={testNotificationLocale}
        style={{ backgroundColor: '#00b4d8', padding: 10, margin: 20, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>🔔 Tester l&apos;affichage notification</Text>
      </TouchableOpacity> */}
            
      {/* --- BARRE DE FILTRES --- */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['Tous', 'Non traité', 'En cours', 'Résolu'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilter(status)}
              style={[
                styles.filterBadge,
                filter === status && styles.filterBadgeActive,
                // Optionnel : petite couleur spécifique par badge actif
                filter === status && status === 'Non traité' && { backgroundColor: '#fee2e2' },
                filter === status && status === 'En cours' && { backgroundColor: '#fff7ed' },
                filter === status && status === 'Résolu' && { backgroundColor: '#f0fdf4' },
              ]}
            >
              <Text style={[
                styles.filterText, 
                filter === status && styles.filterTextActive,
                filter === status && status === 'Non traité' && { color: '#ef4444' },
                filter === status && status === 'En cours' && { color: '#f97316' },
                filter === status && status === 'Résolu' && { color: '#22c55e' },
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- CONTENU (LISTE OU LOADER) --- */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#023e8a" />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#023e8a" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>Aucun signalement pour le moment.</Text>
            </View>
          }
        />
      )}
      {/* MODALE DE CHANGEMENT DE STATUT */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le statut</Text>
            
            <View style={styles.statusOptions}>
              {['Non traité', 'En cours', 'Résolu'].map((status) => (
                <TouchableOpacity 
                  key={status}
                  style={[styles.statusOption, newStatus === status && styles.statusOptionSelected]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text style={[styles.statusOptionText, newStatus === status && styles.statusOptionTextSelected]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={updateStatus}>
              <Text style={styles.confirmBtnText}>Enregistrer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALE DE DÉTAILS COMPLETS */}
      <Modal
        visible={isDetailsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.modalTitle}>Fiche détaillée</Text>
              <TouchableOpacity onPress={() => setIsDetailsVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Badge d'urgence mis en avant */}
                <View style={[styles.urgencyBanner, { backgroundColor: selectedReport.urgence?.includes('Élevé') ? '#fee2e2' : '#f1f5f9' }]}>
                  <AlertTriangle size={20} color={selectedReport.urgence?.includes('Élevé') ? '#ef4444' : '#64748b'} />
                  <Text style={[styles.urgencyText, { color: selectedReport.urgence?.includes('Élevé') ? '#b91c1c' : '#475569' }]}>
                    Urgence : {selectedReport.urgence || "Non définie"}
                  </Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.detailLabel}>Type de fait</Text>
                  <Text style={styles.detailValue}>{selectedReport.type_harcelement || "Inconnu"}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.detailLabel}>Lieu précis</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MapPin size={14} color="#94a3b8" style={{marginRight: 5}}/>
                    <Text style={styles.detailValue}>{selectedReport.lieu || "Non précisé"}</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.detailLabel}>Fréquence & Victimes</Text>
                  <Text style={styles.detailValue}>
                    {selectedReport.frequence || "?"} — {selectedReport.nb_victimes || "?"}
                  </Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.detailLabel}>Description intégrale</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{selectedReport.content}</Text>
                  </View>
                </View>
                
                <Text style={styles.dateInfo}>Signalement reçu le {formatDateTime(selectedReport.created_at)}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Petite fonction helper pour les couleurs
const getStatusColor = (status: string) => {
  switch (status) {
    case 'En cours': return { bg: '#fff7ed', dot: '#f97316', text: '#ea7f0c' };
    case 'Résolu': return { bg: '#f0fdf4', dot: '#22c55e', text: '#16a34a' };
    default: return { bg: '#eff6ff', dot: '#d53f3f', text: '#eb2525' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'ios' ? 55 : 35,
    padding: 10,
    zIndex: 10,
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#023e8a',
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 12, 
    color: '#64748b', 
    fontWeight: '600',
    marginTop: 2 
  },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 20, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 } 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15, 
    alignItems: 'center' 
  },
  authorContainer: { flexDirection: 'row', alignItems: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  typeText: { fontWeight: '700', fontSize: 14 },
  dateText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  
  reportText: { color: '#334155', marginBottom: 20, lineHeight: 22, fontSize: 15 },
  
  replyBtn: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  replyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20 
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tokenText: { fontSize: 10, color: '#cbd5e1', fontWeight: '600' },
  
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  empty: { color: '#94a3b8', fontSize: 16, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(198, 7, 7, 0)',
    // On force le contenu vers le bas pour TOUTES les plateformes
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    // On limite la largeur sur les grands écrans Web pour que ce soit plus beau
    maxWidth: Platform.OS === 'web' ? 450 : '100%', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Sur Web, si c'est centré, on arrondit tous les angles
    borderRadius: Platform.OS === 'web' ? 30 : undefined, 
    padding: 25,
    alignItems: 'center',
    // --- LA CORRECTION POUR LE WEB ---
    maxHeight: Platform.OS === 'web' ? '90%' : 'auto', 
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#023e8a', marginBottom: 20 },
  statusOptions: { width: '100%', marginBottom: 20 },
  statusOption: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
    alignItems: 'center'
  },
  statusOptionSelected: { borderColor: '#00b4d8', backgroundColor: '#f0f9ff' },
  statusOptionText: { fontWeight: '600', color: '#64748b' },
  statusOptionTextSelected: { color: '#00b4d8' },
  confirmBtn: {
    backgroundColor: '#023e8a',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15
  },
  confirmBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  cancelText: { color: '#94a3b8', fontWeight: '600' },
  infoIconButton: {
    padding: 5,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
  },
  detailsContent: {
    backgroundColor: 'white',
    width: '100%',
    // On retire le marginTop: 'auto' qui peut créer des bugs sur Web
    height: '85%', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    // On s'assure qu'il n'y a pas de bordure ou de marge cachée en bas
    marginBottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    // Shadow pour l'effet de profondeur
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  urgencyText: {
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  infoSection: {
    marginBottom: 18,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  dateInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 10,
    marginBottom: 20,
  },
  filterBar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBadgeActive: {
    backgroundColor: '#023e8a',
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
});
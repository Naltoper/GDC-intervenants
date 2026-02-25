import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Clock, User, Shield, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' à');
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPending = item.status === 'Non traité';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.authorContainer}>
            {item.is_anonyme ? <Shield size={16} color="#64748b" /> : <User size={16} color="#023e8a" />}
            <Text style={[styles.typeText, { color: item.is_anonyme ? '#64748b' : '#023e8a' }]}>
              {item.is_anonyme ? " Anonyme" : ` ${item.author_name}`}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.dateText}> {formatDateTime(item.created_at)}</Text>
          </View>
        </View>
        
        <Text style={styles.reportText}>{item.content}</Text>
        
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

        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: isPending ? '#e0f2fe' : '#e6f4f1' }]}>
            <View style={[styles.dot, { backgroundColor: isPending ? '#00b4d8' : '#10ac56' }]} />
            <Text style={[styles.badgeText, { color: isPending ? '#00b4d8' : '#10ac56' }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.tokenText}>ID: {item.user_token?.split('_')[1] || '---'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER AVEC TITRE CENTRÉ ET BOUTON RETOUR */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft color="#023e8a" size={30} strokeWidth={2.5} />
        </TouchableOpacity>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Espace Intervenants</Text>
          <Text style={styles.subtitle}>{reports.length} signalement(s) au total</Text>
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#023e8a" />
        </View>
      ) : (
        <FlatList
          data={reports}
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
    </View>
  );
}

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
  empty: { color: '#94a3b8', fontSize: 16, fontWeight: '500' }
});
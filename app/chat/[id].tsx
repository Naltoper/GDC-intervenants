import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ChevronLeft, ShieldCheck, Lock } from 'lucide-react-native';

// IMPORT DE TON NOUVEAU COMPOSANT
import PreviewRibbon from '../../components/PreviewRibbon'; 

export default function ChatScreen() {
  const { id, role } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isUserAuthor = role === 'user';

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('report_id', id)
      .order('created_at', { ascending: true });
    
    if (!error && data) setMessages(data);
  }, [id]);

  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `report_id=eq.${id}` 
      }, 
      (payload) => {
        setMessages((current) => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('messages')
      .insert([{ 
        report_id: id, 
        content: newMessage, 
        sender_role: isUserAuthor ? 'user' : 'admin' 
      }]);
    
    if (!error) setNewMessage('');
    setLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#023e8aff", "#0077b6ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="white" size={30} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {isUserAuthor ? "Échange avec un intervenant" : "Échange avec un élève"}
            </Text>
            <View style={styles.idBadge}>
              <Lock size={10} color="#caf0f8" style={{ marginRight: 4 }} />
              <Text style={styles.idText}>ID: {id?.toString().toUpperCase().slice(0, 8)}</Text>
            </View>
          </View>

          <View style={styles.shieldIcon}>
            <ShieldCheck color="#76c893" size={24} />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMyMessage = isUserAuthor 
              ? item.sender_role === 'user' 
              : item.sender_role === 'admin';

            return (
              <View style={[
                styles.msgContainer, 
                isMyMessage ? styles.myMsgContainer : styles.theirMsgContainer
              ]}>
                <View style={[
                  styles.msgBubble, 
                  isMyMessage ? styles.myBubble : styles.theirBubble
                ]}>
                  <Text style={[
                    styles.msgText, 
                    isMyMessage ? styles.myText : styles.theirText
                  ]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={styles.timeText}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />

        {/* UTILISATION DU COMPOSANT RÉUTILISABLE ICI */}
        <PreviewRibbon />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={newMessage} 
              onChangeText={setNewMessage} 
              placeholder="Écris ton message..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <TouchableOpacity onPress={sendMessage} disabled={!newMessage.trim() || loading}>
              <LinearGradient
                colors={newMessage.trim() ? ["#48a4f4", "#10ac56"] : ["#e2e8f0", "#cbd5e1"]}
                style={styles.sendBtn}
              >
                <Send size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 10,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  backButton: { width: 45, height: 45, justifyContent: 'center' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  idBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  idText: { color: '#caf0f8', fontSize: 11, fontWeight: '600' },
  shieldIcon: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 15 },
  content: { flex: 1 },
  listContent: { padding: 20 },
  msgContainer: { marginVertical: 6, maxWidth: '85%' },
  myMsgContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMsgContainer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  msgBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  myBubble: { backgroundColor: '#023e8a', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  msgText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  myText: { color: '#fff' },
  theirText: { color: '#334155' },
  timeText: { fontSize: 10, marginTop: 4, color: '#94a3b8', fontWeight: '600' },
  inputWrapper: { paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 25, padding: 5 },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 15, color: '#1e293b', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
});
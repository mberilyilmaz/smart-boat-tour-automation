import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { Ship, Anchor, User, Activity } from 'lucide-react-native'; 

// --- AYARLAR ---
const API_BASE = "http://172.20.10.6:8081"; 

export default function App() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // AKTİF TEKNE LİSTESİ
  const [activeBoats, setActiveBoats] = useState<string[]>([]);

  const [dashboardData, setDashboardData] = useState<any>({
    waiting_stats: { total: 0, adult: 0, child: 0 },
    boats: [] 
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard-status`); 
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      // Sessiz hata
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); 
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleToggleBoat = async (boatId: any) => {
    const idStr = String(boatId);
    const isActive = activeBoats.includes(idStr);

    if (isActive) {
        setActiveBoats(prev => prev.filter(id => id !== idStr));
    } else {
        setActiveBoats(prev => [...prev, idStr]);
        try {
          await fetch(`${API_BASE}/boats/${boatId}/depart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {}
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const waitingStats = dashboardData.waiting_stats || { total: 0, adult: 0, child: 0 };
  const boats = dashboardData.boats || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <View style={styles.logoBox}>
              <Ship size={20} color="#fff" />
            </View>
            <View style={{marginLeft: 10}}>
              <Text style={styles.headerTitle}>DARK CANYON</Text>
              <Text style={styles.headerSubtitle}>KAPTAN PANELİ</Text>
            </View>
          </View>
          
          <View style={styles.onlineBadge}>
            <Activity size={12} color="#4ade80" style={{marginRight:4}} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        {/* İSKELE KARTI */}
        <View style={styles.card}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
             <Text style={styles.cardLabel}>İSKELEDE BEKLEYEN</Text>
             <Anchor size={20} color="#94a3b8" />
          </View>
          
          <View style={styles.waitingContainer}>
            <Text style={styles.bigNumber}>{waitingStats.total}</Text>
            <Text style={styles.bigNumberSub}>YOLCU</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{waitingStats.adult}</Text>
              <Text style={styles.statLabel}>Yetişkin</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{waitingStats.child}</Text>
              <Text style={styles.statLabel}>Çocuk</Text>
            </View>
          </View>
        </View>

        {/* BİLGİ ŞERİDİ */}
        <View style={styles.infoStrip}>
          <User size={18} color="#38bdf8" style={{marginRight:10}} />
          <Text style={styles.infoText}>Veriler anlık olarak çekilmektedir.</Text>
        </View>

        {/* BAŞLIK */}
        <Text style={styles.sectionTitle}>TEKNE KAPASİTELERİ</Text>

        {/* TEKNE KARTLARI */}
        <View style={styles.boatsGrid}>
          {boats.map((boat: any) => {
             const boatIdStr = String(boat.id);
             
             // --- RENK AYARLAMASI ---
             const isEgin = boat.name.includes("Eğin");
             const defaultColor = isEgin ? '#22d3ee' : '#3b82f6'; 
             
             // Durum Kontrolü
             const isManual = activeBoats.includes(boatIdStr);
             const s = boat.status ? boat.status.toLowerCase() : '';
             const serverSaysTour = s.includes('tour') || s === 'active' || s === 'seferde';
             
             const isTouring = isManual || serverSaysTour;
             const activeColor = isTouring ? '#f97316' : defaultColor;

             const capacity = boat.capacity || 20;
             
             // --- DEĞİŞİKLİK BURADA ---
             // Eskiden: isTouring ? capacity : ...
             // Şimdi: Her zaman gerçek yolcu sayısını gösteriyoruz.
             // Turuncu olsa bile "13 / 20" yazacak.
             const currentLoad = Math.min(waitingStats.total, capacity);

             return (
              <TouchableOpacity 
                key={boat.id} 
                activeOpacity={0.7}
                onPress={() => handleToggleBoat(boat.id)}
                style={[
                  styles.boatCard, 
                  { borderColor: activeColor } 
                ]}
              >
                {/* TEKNE İKONU */}
                <Ship 
                  size={32} 
                  color={activeColor} 
                  style={{marginBottom: 10}} 
                />
                
                {/* TEKNE ADI */}
                <Text style={styles.boatName}>{boat.name}</Text>
                
                {/* KAPASİTE YAZISI */}
                <Text style={[styles.capacityText, isTouring && {color:'#f97316'}]}>
                  {currentLoad} / {capacity} Kişilik
                </Text>

                {/* BAR */}
                <View style={styles.progressBarBg}>
                  <View style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((currentLoad / capacity) * 100, 100)}%` },
                    { backgroundColor: activeColor } 
                  ]} />
                </View>

              </TouchableOpacity>
             );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- STİLLER ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 10 }, 
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoBox: { width: 40, height: 40, backgroundColor: '#3b82f6', borderRadius: 8, justifyContent:'center', alignItems:'center' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#94a3b8', fontSize: 10, letterSpacing: 1 },
  
  onlineBadge: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(34, 197, 94, 0.15)', paddingHorizontal:10, paddingVertical:6, borderRadius:20, borderWidth:1, borderColor:'rgba(34, 197, 94, 0.5)' },
  onlineText: { color:'#4ade80', fontSize:10, fontWeight:'bold' },

  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 25, marginBottom: 20, borderWidth:1, borderColor:'#334155' },
  cardLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform:'uppercase' },
  
  waitingContainer: { alignItems: 'center', marginVertical: 20 },
  bigNumber: { color: '#ffffff', fontSize: 64, fontWeight: 'bold', lineHeight: 70 },
  bigNumberSub: { color: '#64748b', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40 },
  statItem: { alignItems: 'center' },
  statVal: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 12 },

  infoStrip: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(56, 189, 248, 0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth:1, borderColor:'rgba(56, 189, 248, 0.3)' },
  infoText: { color: '#cbd5e1', fontSize: 13 },

  sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase' },

  boatsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  boatCard: { 
    width: '48%', 
    backgroundColor: '#1e293b', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    borderWidth: 1.5,
    height: 150, 
    justifyContent: 'center'
  },
  
  boatName: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 5, textAlign:'center' },
  capacityText: { color: '#94a3b8', fontSize: 13, fontWeight:'600' },

  progressBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, width: '100%', position:'absolute', bottom: 20 },
  progressBarFill: { height: '100%', borderRadius: 3 },
});
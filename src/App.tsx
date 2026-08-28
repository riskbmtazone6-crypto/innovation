import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Step1Info } from './components/Step1Info';
import { Step2Inspection } from './components/Step2Inspection';
import { Step3Dashboard } from './components/Step3Dashboard';
import { VideoTutorialModal } from './components/VideoTutorialModal';
import { InspectorUser, InspectionRecord } from './types';
import { DEFAULT_INSPECTOR } from './data/initialData';
import {
  subscribeToInspections,
  saveInspectionRecord,
  subscribeToAuth,
  seedSampleDataIfEmpty
} from './firebase/config';

export default function App() {
  // Navigation State: 'info' (Step 1), 'inspect' (Step 2), 'dashboard' (Step 3) - Start at Step 1
  const [activeTab, setActiveTab] = useState<'info' | 'inspect' | 'dashboard'>('info');

  // Inspector User State
  const [currentInspector, setCurrentInspector] = useState<InspectorUser>(DEFAULT_INSPECTOR);

  // Active Inspection Session
  const [activeInspectionSession, setActiveInspectionSession] = useState({
    inspectorName: '',
    operationGroup: '6-3',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
    busRoute: '',
    busNumber: ''
  });

  // Track if an inspection was just completed to highlight on Step 3
  const [justCompletedInspection, setJustCompletedInspection] = useState(false);

  // Video Tutorial Modal State
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);

  // Firestore Inspection Records
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Firebase Auth listener
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      if (user) {
        setCurrentInspector({
          uid: user.uid,
          name: user.displayName || 'ผู้ตรวจการ (Google)',
          email: user.email || undefined,
          avatar: user.photoURL || DEFAULT_INSPECTOR.avatar,
          role: 'inspector',
          badgeId: 'G-' + user.uid.substring(0, 5).toUpperCase(),
          zone: 'เขตการเดินรถที่ 6'
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Firebase Firestore real-time listener & initial seed
  useEffect(() => {
    seedSampleDataIfEmpty();

    const unsubscribe = subscribeToInspections(
      (inspectionList) => {
        setRecords(inspectionList);
        setIsFirebaseConnected(true);
      },
      (error) => {
        console.warn('Firestore offline fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Step 1 -> Step 2 transition
  const handleStartInspection = (info: {
    inspectorName: string;
    operationGroup: string;
    operationGroupName: string;
    busRoute: string;
    busNumber: string;
  }) => {
    setActiveInspectionSession(info);
    setJustCompletedInspection(false);
    setActiveTab('inspect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Save to Firestore -> Step 3 transition
  const handleSaveInspection = async (recordData: Omit<InspectionRecord, 'id'>) => {
    setIsSaving(true);
    try {
      await saveInspectionRecord(recordData);
      setJustCompletedInspection(true);
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      // Even if offline, add locally so user has instant feedback
      const localRecord: InspectionRecord = {
        ...recordData,
        id: `local-${Date.now()}`
      };
      setRecords((prev) => [localRecord, ...prev]);
      setJustCompletedInspection(true);
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset session and restart from Step 1 (เมื่อเรียบร้อยทั้ง 3 step เริ่มต้นใหม่)
  const handleStartNewInspection = () => {
    setActiveInspectionSession({
      inspectorName: '',
      operationGroup: '6-3',
      operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
      busRoute: '',
      busNumber: ''
    });
    setJustCompletedInspection(false);
    setActiveTab('info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingIssuesCount = records.filter(
    (r) => r.overallStatus === 'fail' || r.overallStatus === 'pending'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fb] text-[#121b2e]">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFirebaseConnected={isFirebaseConnected}
        onOpenTutorial={() => setShowVideoTutorial(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-24 md:pb-8">
        {activeTab === 'info' && (
          <Step1Info
            currentInspector={currentInspector}
            onStartInspection={handleStartInspection}
            savedInspectorName={activeInspectionSession.inspectorName}
            savedRoute={activeInspectionSession.busRoute}
            savedBusNumber={activeInspectionSession.busNumber}
            savedOpGroup={activeInspectionSession.operationGroup}
            onOpenTutorial={() => setShowVideoTutorial(true)}
          />
        )}

        {activeTab === 'inspect' && (
          <Step2Inspection
            currentInspector={currentInspector}
            inspectorName={activeInspectionSession.inspectorName}
            busRoute={activeInspectionSession.busRoute}
            busNumber={activeInspectionSession.busNumber}
            operationGroupName={activeInspectionSession.operationGroupName}
            onBackToStep1={() => setActiveTab('info')}
            onSaveInspection={handleSaveInspection}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'dashboard' && (
          <Step3Dashboard
            records={records}
            justCompletedInspection={justCompletedInspection}
            onStartNewInspection={handleStartNewInspection}
          />
        )}
      </main>

      {/* Interactive Video Tutorial & Walkthrough Modal */}
      <VideoTutorialModal
        isOpen={showVideoTutorial}
        onClose={() => setShowVideoTutorial(false)}
        onJumpToStep={(step) => {
          setActiveTab(step);
          setShowVideoTutorial(false);
        }}
      />

      {/* Bottom Navigation for Mobile Devices */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        badgeCounts={{
          issueCount: pendingIssuesCount > 0 ? pendingIssuesCount : undefined
        }}
      />
    </div>
  );
}

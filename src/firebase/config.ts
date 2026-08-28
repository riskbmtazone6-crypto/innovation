import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { InspectionRecord } from '../types';
import { SAMPLE_INSPECTION_RECORDS } from '../data/initialData';

// Import config
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore (with databaseId support)
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Authentication helper methods
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google sign-in popup failed, falling back to anonymous auth:', error);
    const anonResult = await signInAnonymously(auth);
    return anonResult.user;
  }
};

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Guest sign-in error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore inspection helper methods
const INSPECTIONS_COLLECTION = 'inspections';

export const subscribeToInspections = (
  callback: (records: InspectionRecord[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const colRef = collection(db, INSPECTIONS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If empty in firestore, return sample initial data
          callback(SAMPLE_INSPECTION_RECORDS);
        } else {
          const records: InspectionRecord[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              timestamp: data.timestamp || Date.now(),
              dateStr: data.dateStr || new Date().toLocaleDateString('th-TH'),
              timeStr: data.timeStr || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              inspectorName: data.inspectorName || 'สมชาย ส.',
              inspectorId: data.inspectorId || '10294',
              inspectorAvatar: data.inspectorAvatar,
              operationGroup: data.operationGroup || '6-3',
              operationGroupName: data.operationGroupName || 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
              busRoute: data.busRoute || '511',
              busNumber: data.busNumber || '3-50212',
              overallStatus: data.overallStatus || 'pass',
              passedCount: data.passedCount ?? 12,
              failedCount: data.failedCount ?? 0,
              totalCount: data.totalCount ?? 12,
              issuesSummary: data.issuesSummary || '-',
              items: data.items || [],
              supervisorNotes: data.supervisorNotes || ''
            };
          });
          callback(records);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local cache/sample data):', error);
        if (onError) onError(error);
        callback(SAMPLE_INSPECTION_RECORDS);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to firestore:', err);
    callback(SAMPLE_INSPECTION_RECORDS);
    return () => {};
  }
};

export const saveInspectionRecord = async (record: Omit<InspectionRecord, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, INSPECTIONS_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...record,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving inspection to Firestore:', error);
    throw error;
  }
};

export const updateInspectionStatus = async (
  recordId: string,
  overallStatus: 'pass' | 'fail' | 'pending',
  supervisorNotes?: string
) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, recordId);
    await updateDoc(docRef, {
      overallStatus,
      ...(supervisorNotes !== undefined ? { supervisorNotes } : {}),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating inspection status:', error);
    throw error;
  }
};

export const deleteInspection = async (recordId: string) => {
  try {
    const docRef = doc(db, INSPECTIONS_COLLECTION, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting inspection from Firestore:', error);
    throw error;
  }
};

export const seedSampleDataIfEmpty = async () => {
  try {
    const colRef = collection(db, INSPECTIONS_COLLECTION);
    const q = query(colRef, limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      for (const rec of SAMPLE_INSPECTION_RECORDS) {
        const { id, ...recData } = rec;
        await addDoc(colRef, {
          ...recData,
          createdAt: serverTimestamp()
        });
      }
      console.log('Seeded initial inspection records to Firestore successfully.');
    }
  } catch (err) {
    console.warn('Seed operation notice:', err);
  }
};

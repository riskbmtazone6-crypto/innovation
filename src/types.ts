export interface ChecklistItemTemplate {
  id: string;
  order: number;
  label: string;
  labelEn: string;
  icon: string;
  category: 'exterior' | 'lighting' | 'safety' | 'interior' | 'mechanical' | 'engine';
  description?: string;
}

export interface InspectionSubItem {
  id: string;
  order: number;
  label: string;
  labelEn: string;
  icon: string;
  category?: 'exterior' | 'lighting' | 'safety' | 'interior' | 'mechanical' | 'engine';
  description?: string;
  status: 'pass' | 'fail' | null;
  notes: string;
}

export interface InspectionGroupSet {
  id: 'exterior' | 'interior' | 'engine';
  setNumber: number;
  title: string;
  titleEn: string;
  icon: string;
  badgeColor?: string;
  photoGuide: string;
  sampleImageUrl?: string;
  imageUrl?: string;
  photoTimestamp?: number;
  items: InspectionSubItem[];
}

export interface InspectionItem {
  id: string;
  order: number;
  label: string;
  labelEn: string;
  icon: string;
  category?: 'exterior' | 'lighting' | 'safety' | 'interior' | 'mechanical' | 'engine';
  description?: string;
  status: 'pass' | 'fail' | null;
  notes: string;
  imageUrl?: string;
  setId?: 'exterior' | 'interior' | 'engine';
  setName?: string;
}

export interface InspectionRecord {
  id?: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  inspectorName: string;
  inspectorId?: string;
  inspectorAvatar?: string;
  operationGroup: string;
  operationGroupName: string;
  busRoute: string;
  busNumber: string;
  overallStatus: 'pass' | 'fail' | 'pending';
  passedCount: number;
  failedCount: number;
  totalCount: number;
  issuesSummary: string;
  items: InspectionItem[];
  sets?: InspectionGroupSet[];
  photos?: {
    exteriorUrl?: string;
    interiorUrl?: string;
    engineUrl?: string;
  };
  supervisorNotes?: string;
  createdAt?: any;
}

export interface InspectorUser {
  uid: string;
  name: string;
  email?: string;
  avatar: string;
  role: 'inspector' | 'supervisor' | 'admin';
  badgeId: string;
  zone: string;
}


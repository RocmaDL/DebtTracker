import { db, auth } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { Group, GroupActivity, Transaction } from '../types';

export const GroupService = {
  // Create a new group
  createGroup: async (name: string, type: Group['type']): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const groupRef = await addDoc(collection(db, 'groups'), {
      name,
      type,
      inviteCode,
      members: [user.uid],
      createdBy: user.uid,
      createdAt: Date.now()
    });

    return groupRef.id;
  },

  // Join a group via invite code
  joinGroup: async (inviteCode: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Code d'invitation invalide");
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;

    if (groupDoc.data().members.includes(user.uid)) {
      throw new Error("Vous êtes déjà membre de ce groupe");
    }

    await updateDoc(doc(db, 'groups', groupId), {
      members: arrayUnion(user.uid)
    });

    return groupId;
  },

  // Get user's groups
  getUserGroups: (onUpdate: (groups: Group[]) => void) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));

    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
      onUpdate(groups);
    });
  },

  // Fetch groups once (Promise based)
  fetchUserGroups: async (): Promise<Group[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
  },

  // Log activity to groups
  logActivityToGroups: async (groups: Group[], transaction: Transaction) => {
    const user = auth.currentUser;
    if (!user || groups.length === 0) return;

    // Create activity object
    const activity: Omit<GroupActivity, 'id'> = {
      groupId: '', // Will be set in loop
      userId: user.uid,
      userName: user.displayName || 'Utilisateur',
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      timestamp: Date.now()
    };

    // Add to each group's subcollection "activities"
    const promises = groups.map(group => {
       return addDoc(collection(db, `groups/${group.id}/activities`), {
         ...activity,
         groupId: group.id
       });
    });

    await Promise.all(promises);
  },

  // Stream group activity
  getGroupActivity: (groupId: string, onUpdate: (activities: GroupActivity[]) => void) => {
    const q = query(
      collection(db, `groups/${groupId}/activities`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupActivity));
      onUpdate(activities);
    });
  }
};

import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Transaction, UserSettings } from '../types';

export const useCalendarSync = () => {
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        // Find existing calendar or use default
        const debtTrackerCalendar = calendars.find(c => c.title === 'DebtTracker Sport');
        if (debtTrackerCalendar) {
          setCalendarId(debtTrackerCalendar.id);
        }
      }
    })();
  }, []);

  const createCalendar = async () => {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarSourceAsync()
        : { isLocalAccount: true, name: 'DebtTracker', type: Calendar.CalendarType.LOCAL };

    if (!defaultCalendarSource) {
       Alert.alert("Erreur", "Impossible de trouver une source de calendrier par défaut.");
       return null;
    }

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'DebtTracker Sport',
      color: '#10b981',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'internal_debt_tracker_sport',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    setCalendarId(newCalendarId);
    return newCalendarId;
  };

  const syncSessionToCalendar = async (session: Transaction, settings: UserSettings) => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Veuillez autoriser l'accès au calendrier dans les réglages.");
      return;
    }

    let targetCalendarId = calendarId;
    if (!targetCalendarId) {
      targetCalendarId = await createCalendar();
    }

    if (!targetCalendarId) return;

    try {
      // Parse date and time from settings or default
      // Find day of week for this session
      const dateObj = new Date(session.date);
      const dayIndex = dateObj.getDay() === 0 ? 7 : dateObj.getDay();

      const scheduledTime = settings.schedule.find(s => s.dayIndex === dayIndex)?.time || "18:00";
      const [hours, minutes] = scheduledTime.split(':').map(Number);

      const startDate = new Date(dateObj);
      startDate.setHours(hours, minutes);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + session.amount);

      await Calendar.createEventAsync(targetCalendarId, {
        title: `Sport: ${session.description}`,
        startDate,
        endDate,
        notes: `Durée: ${session.amount} min. Objectif DebtTracker.`,
        alarms: [{ relativeOffset: -60 }] // 1 hour before
      });

      Alert.alert("Succès", "Séance ajoutée à votre calendrier !");
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de créer l'événement.");
    }
  };

  return {
    syncSessionToCalendar
  };
};

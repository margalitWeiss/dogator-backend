import {  Response } from 'express';
import {deleteAvailabilitySlots,createAvailabilitySlot,
  updateAvailabilitySlot,getAvailabilitySlotsByUserId
} from '../services/availabilityService'; 
import { CustomRequest } from '../customes/request';

export const updateUserAvailability = async (req: CustomRequest, res: Response) => {
    if (!req.userAuth|| !req.userAuth?.userId) {
     res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
     return;
  }

  const userId = req.userAuth?.userId;
  const { slots, delete_slot_ids } = req.body;
console.log("slots"+slots)
console.log("delete_slot_ids"+delete_slot_ids)
  if (!slots && !delete_slot_ids) {
     res.status(400).json({ message: 'Request body must contain "slots" or "delete_slot_ids".' });
     return;
  }

  try {

    if (delete_slot_ids && delete_slot_ids.length > 0) {
      await deleteAvailabilitySlots( delete_slot_ids, userId);
    }

    if (slots && slots.length > 0) {
      for (const slot of slots) {
        if (!slot.start_time || !slot.end_time || typeof slot.is_recurring !== 'boolean') {
          throw new Error('Invalid slot data: Missing start_time, end_time, or is_recurring.');
        }

        if (slot.is_recurring) {
          if (typeof slot.day_of_week !== 'number' || slot.day_of_week < 0 || slot.day_of_week > 6) {
            throw new Error('Invalid recurring slot: day_of_week must be a number between 0 and 6.');
          }
          slot.specific_date = null; 
        } else {
          if (!slot.specific_date) {
            throw new Error('Invalid one-off slot: specific_date is required for non-recurring slots.');
          }
          slot.day_of_week = null; 
        }

        if (slot.slot_id) {
          const result = await updateAvailabilitySlot( slot, userId);
          if (result) {
            console.warn(`No slot updated for slot_id: ${slot.slot_id} and user_id: ${userId}`);
          }
        } else {
          await createAvailabilitySlot(slot, userId);
        }
      }
    }

    res.status(200).json({ message: 'Availability updated successfully.' });

  } catch (error: any) {
   
    console.error('Error updating user availability:', error);
    res.status(500).json({ message: 'Failed to update availability.', error: error.message });
  } 
};



export const getUserAvailability = async (req: CustomRequest, res: Response) => {
  const { userId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
        return;
     }

  try {
    const slots = await getAvailabilitySlotsByUserId(userId);
    res.status(200).json(slots);
  } catch (error: any) {
    console.error('Error fetching user availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability.', error: error.message });
  } 
};

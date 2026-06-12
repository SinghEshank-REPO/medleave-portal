import { prisma } from '../config/db';

export interface MissedClassPayload {
  courseId: string;
  date: Date;
  slotId: string;
  slotName: string;
  isPartial: boolean;
}

export class TimetableService {
  /**
   * Calculates the exact classes a student misses during a medical leave period
   * @param studentId ID of the Student profile
   * @param startDate Start date of the leave
   * @param endDate End date of the leave
   * @param options Partial day options: { startOption: 'FULL'|'AFTERNOON', endOption: 'FULL'|'MORNING' }
   */
  static async calculateMissedClasses(
    studentId: string,
    startDate: Date,
    endDate: Date,
    options: { startOption?: string; endOption?: string } = {}
  ): Promise<MissedClassPayload[]> {
    const startOpt = options.startOption || 'FULL'; // 'FULL' or 'AFTERNOON'
    const endOpt = options.endOption || 'FULL';     // 'FULL' or 'MORNING'

    // 1. Fetch student enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true, section: true }
    });

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.courseId);
    // Group sections by course
    const courseSectionMap = new Map<string, string>();
    enrollments.forEach((e) => courseSectionMap.set(e.courseId, e.section));

    // 2. Fetch all timetable slots for the enrolled courses
    const allSlots = await prisma.timetableSlot.findMany({
      where: {
        courseId: { in: courseIds }
      }
    });

    const missedClasses: MissedClassPayload[] = [];
    const currDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Keep loops bounds safe
    // Normalize time to midnight
    currDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    // Guard against infinite loop if dates are invalid
    let safetyCounter = 0;
    while (currDate <= lastDate && safetyCounter < 100) {
      safetyCounter++;
      // JavaScript getDay() returns: 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
      // Our database uses: 1 = Monday, ..., 5 = Friday
      const jsDay = currDate.getDay();
      if (jsDay !== 0 && jsDay !== 6) { // Skip weekends
        const dbDayOfWeek = jsDay;

        // Filter slots for this weekday and section
        const daySlots = allSlots.filter((slot) => {
          const section = courseSectionMap.get(slot.courseId);
          return slot.dayOfWeek === dbDayOfWeek && slot.section === section;
        });

        for (const slot of daySlots) {
          const slotHour = parseInt(slot.startTime.split(':')[0]);
          let isMissed = true;
          let isPartial = false;

          const isSameAsStart = currDate.getTime() === startDate.getTime();
          const isSameAsEnd = currDate.getTime() === lastDate.getTime();

          // Handle partial day constraints
          if (isSameAsStart && startOpt === 'AFTERNOON') {
            // Afternoon starts from 12:00 PM (12 hours)
            if (slotHour < 12) {
              isMissed = false; // Attended morning classes
            } else {
              isPartial = true;
            }
          }

          if (isSameAsEnd && endOpt === 'MORNING') {
            // Morning leave covers classes up to 1:00 PM (13 hours)
            if (slotHour >= 13) {
              isMissed = false; // Returned to class for afternoon sessions
            } else {
              isPartial = true;
            }
          }

          if (isMissed) {
            missedClasses.push({
              courseId: slot.courseId,
              date: new Date(currDate),
              slotId: slot.id,
              slotName: `${slot.type} (${slot.startTime} - ${slot.endTime})`,
              isPartial
            });
          }
        }
      }
      // Increment date by 1 day
      currDate.setDate(currDate.getDate() + 1);
    }

    return missedClasses;
  }
}

import { Task } from "@prisma/client";
import { useRef } from "react";
import { api } from "~/trpc/react";

export const useTaskLoader = () => {
    // Use ref for tracking loaded months
    const loadedMonths = useRef<Set<string>>(new Set());
    const trpc = api.useUtils();
    // Convert date to YYYY-MM format
    const getMonthKey = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
  
    // Check if a month is loaded
    const isMonthLoaded = (date: Date): boolean => {
      return loadedMonths.current.has(getMonthKey(date));
    };
  
    const getMonthsToLoad = (date: Date): string[] => {
      const months: string[] = [];
      
      // Get previous, current, and next month
      for (let i = -1; i <= 1; i++) {
        // Create new Date object for each iteration
        const targetDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
        const monthKey = getMonthKey(targetDate);
        
        if (!loadedMonths.current.has(monthKey)) {
          months.push(monthKey);
        }
      }
      
      return months;
    };
    // Function to merge tasks, preferring newer tasks
    const mergeTasks = (existingTasks: Task[], newTasks: Task[]): Task[] => {
      const taskMap = new Map<string, Task>();
      
      // Add existing tasks first
      existingTasks.forEach(task => taskMap.set(task.id, task));
      
      // Override with new tasks (they take precedence)
      newTasks.forEach(task => taskMap.set(task.id, task));
      
      return Array.from(taskMap.values());
    };
  
    // Reset loaded months (useful for task updates or refreshes)
    const resetLoadedMonths = () => {
      loadedMonths.current.clear();
    };
  
    // Load tasks for a given date
    const loadTasksForRange = async (date: Date, tasks: Task[]): Promise<Task[] | undefined> => {
      // Get months we need to load
      const monthsToLoad = getMonthsToLoad(date);
      
      if (monthsToLoad.length === 0) {
        return; // All months already loaded
      }
  
      try {
        // Calculate date range for all months we need to load
        const firstMonth = new Date(monthsToLoad[0] + '-01');
        const lastMonth = new Date(monthsToLoad[monthsToLoad.length - 1] + '-01');
        lastMonth.setMonth(lastMonth.getMonth() + 1);
        lastMonth.setDate(0); // Last day of the month
  
        const newTasks = await trpc.task.getTasksInRange.fetch({
          rangeStart: firstMonth,
          rangeEnd: lastMonth,
        });

        if (!newTasks) {
          return tasks;
        }
  
        // Mark these months as loaded
        monthsToLoad.forEach(month => {
          loadedMonths.current.add(month);
        });
  
        // Return merged tasks
        return mergeTasks(tasks, newTasks);
  
      } catch (error) {
        console.error('Failed to load tasks:', error);
        return undefined;
      }
    };
  
    return {
      loadTasksForRange,
      resetLoadedMonths,
      isMonthLoaded
    };
  };
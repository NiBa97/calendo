"use client";

import React, { useState, useEffect } from "react";
import { useTasks } from "../_contexts/task-context";

const TempTask = () => {
  const { tasks, updateTask } = useTasks();
  const taskId = "clx77yjig0001100dakrexfwc";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);

  useEffect(() => {
    if (tasks === undefined || tasks.length == 0) return;
    const task = tasks.find((t) => t?.id === taskId);
    if (task) {
      setName(task.name);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setStartDate(task.startDate ? new Date(task.startDate) : null);
      setEndDate(task.endDate ? new Date(task.endDate) : null);
      setIsAllDay(task.isAllDay);
    }
  }, [tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateTask(taskId, { name, description, status, startDate, endDate, isAllDay });
  };

  return (
    <div>
      <h2>Edit Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Status:
            <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
          </label>
        </div>
        <div>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate ? startDate.toISOString().substring(0, 10) : ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <input
              type="date"
              value={endDate ? endDate.toISOString().substring(0, 10) : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            All Day:
            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
          </label>
        </div>
        <div>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};
export default TempTask;

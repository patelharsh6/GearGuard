import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import "./MaintenanceCalendar.css"; 

export default function MaintenanceCalendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Get Data from Backend
      const response = await axios.get("http://localhost:5000/api/maintenance", config);
      
      // 2. Transform Data for FullCalendar
      // Backend: { _id, name, scheduled_date, priority }
      // Calendar Needs: { id, title, date, extendedProps }
      const formattedEvents = response.data
        .filter(task => task.scheduled_date) // Only show tasks with dates
        .map(task => ({
          id: task._id,
          title: task.name,
          date: task.scheduled_date.split("T")[0], // Remove time part
          extendedProps: { 
            priority: task.priority,
            equipment: task.equipmentName || "Unknown"
          }
        }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  }

  // Handle clicking an event (Go to Details)
  function handleEventClick(info) {
    navigate(`/maintenance/${info.event.id}`);
  }

  // Handle clicking an empty date (Go to Create New)
  function handleDateClick(info) {
    // Navigate to create page with pre-filled date (Optional feature)
    // You could pass state here: navigate("/maintenance/new", { state: { date: info.dateStr } })
    navigate("/maintenance/new"); 
  }

  // Custom "Pill" Rendering
  function renderEventContent(eventInfo) {
    const priority = eventInfo.event.extendedProps.priority;
    const style = getPriorityStyle(priority);

    return (
      <div className="fc-event-custom" style={style.css}>
        <div className="fc-event-dot" style={{ background: style.dot }}></div>
        <div className="fc-event-text">
          <span className="fc-title">{eventInfo.event.title}</span>
          <span className="fc-desc">{eventInfo.event.extendedProps.equipment}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page-container">
      {/* HEADER */}
      <div className="calendar-header-section">
        <div>
          <h1>Maintenance Schedule</h1>
          <p>Overview of upcoming preventive and corrective tasks</p>
        </div>
        
        {/* LEGEND */}
        <div className="legend-row">
          <LegendItem color="#ef4444" label="Critical" />
          <LegendItem color="#f59e0b" label="Medium" />
          <LegendItem color="#22c55e" label="Low" />
        </div>
      </div>

      {/* CALENDAR CARD */}
      <div className="calendar-card-wrapper">
        {loading ? (
          <div className="calendar-loading">
            <FiLoader className="spin" size={30} /> Loading schedule...
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek"
            }}
            height="auto"
            contentHeight="auto"
            events={events}
            eventClick={handleEventClick} // ✅ Click event -> Details
            dateClick={handleDateClick}   // ✅ Click date -> Create
            eventContent={renderEventContent}
            dayMaxEventRows={3}
            fixedWeekCount={false} 
            firstDay={1} // Start week on Monday
          />
        )}
      </div>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function LegendItem({ color, label }) {
  return (
    <div className="legend-item">
      <span className="legend-dot" style={{ background: color }}></span>
      {label}
    </div>
  );
}

function getPriorityStyle(priority) {
  // Map DB Values (0,1,2,3) to Colors
  let color = "green"; // Default Low
  
  if (priority === '1' || priority === 'Medium') color = "orange";
  if (priority === '2' || priority === 'High') color = "red";
  if (priority === '3' || priority === 'Critical') color = "darkred";

  const styles = {
    green:   { css: { background: "#dcfce7", color: "#14532d", borderLeft: "3px solid #22c55e" }, dot: "#22c55e" },
    orange:  { css: { background: "#ffedd5", color: "#7c2d12", borderLeft: "3px solid #f97316" }, dot: "#f97316" },
    red:     { css: { background: "#fee2e2", color: "#7f1d1d", borderLeft: "3px solid #ef4444" }, dot: "#ef4444" },
    darkred: { css: { background: "#7f1d1d", color: "#ffffff", borderLeft: "3px solid #450a0a" }, dot: "#ffffff" },
  };

  return styles[color] || styles.green;
}
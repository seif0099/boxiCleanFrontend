import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./calendarView.css"; // Optional for your custom styles

const CalendarView = ({ reservations }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const formatted = reservations.filter((r) => {
      const resDate = new Date(r.date);
      return (
        resDate.getFullYear() === selectedDate.getFullYear() &&
        resDate.getMonth() === selectedDate.getMonth() &&
        resDate.getDate() === selectedDate.getDate()
      );
    });
    setFilteredEvents(formatted);
  }, [selectedDate, reservations]);

  return (
    <div className="calendar-container">
      <h3 className="calendar-title">📅 Sélectionnez une date :</h3>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        locale="fr"
        inline
      />

      <div className="calendar-events">
        <h4>
          Prestations pour le{" "}
          <span className="calendar-date">
            {selectedDate.toLocaleDateString("fr-FR")}
          </span>
          :
        </h4>

        {filteredEvents.length > 0 ? (
          <ul className="calendar-event-list">
            {filteredEvents.map((r) => (
              <li key={r.id} className="calendar-event-item">
                <p>
                  <strong>Service:</strong>{" "}
                  {r.Service?.nom_service || "Service inconnu"}
                </p>
                <p>
                  <strong>Client:</strong>{" "}
                  {r.Client?.fullName || "Client inconnu"}
                </p>
                <p>
                  <strong>Heure:</strong> {r.heure || "Non spécifiée"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="calendar-empty">Aucune prestation ce jour-là.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarView;

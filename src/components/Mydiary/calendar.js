import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = ({ selectedDate, calendarViewDate, onDateSelect, onViewDateChange }) => {
  const [showFutureWarning, setShowFutureWarning] = useState(false);
  const [journalDates, setJournalDates] = useState(new Set());
  const [isLoadingJournalDates, setIsLoadingJournalDates] = useState(false);

  // Fetch journal dates for the current month
  const fetchJournalDatesForMonth = async (viewDate) => {
    try {
      setIsLoadingJournalDates(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth() + 1;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/journals/month/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datesWithJournals = new Set();
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(journal => {
          if (journal.journaldate) {
            const date = new Date(journal.journaldate);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            datesWithJournals.add(dateString);
          }
        });
      }

      setJournalDates(datesWithJournals);
    } catch (error) {
      console.error('Error fetching journal dates:', error);
      setJournalDates(new Set());
    } finally {
      setIsLoadingJournalDates(false);
    }
  };

  useEffect(() => {
    fetchJournalDatesForMonth(calendarViewDate);
  }, [calendarViewDate]);

  const handleToday = () => {
    const today = new Date();
    onDateSelect(today);
    onViewDateChange(today);
  };

  const handleDateClick = (currentDate, isFutureDate) => {
    if (isFutureDate) {
      setShowFutureWarning(true);
      setTimeout(() => setShowFutureWarning(false), 2000);
    } else {
      onDateSelect(currentDate);
    }
  };

  const hasJournalEntry = (date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return journalDates.has(dateString);
  };

  const renderCalendarDays = () => {
    const firstDay = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1);
    const lastDay = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
      days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isFutureDate = currentDate > today;
      const hasJournal = hasJournalEntry(currentDate);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(currentDate, isFutureDate)}
          style={{
            ...styles.dayButton,
            ...(isSelected ? styles.selectedDay : {}),
            ...(isToday ? styles.todayDay : {}),
            ...(isFutureDate ? styles.futureDay : {}),
            ...(hasJournal ? styles.journalDay : {})
          }}
          disabled={isFutureDate}
        >
          <span style={styles.dayNumber}>{day}</span>
          {hasJournal && <div style={styles.journalDot}></div>}
          {isToday && <div style={styles.todayUnderline}></div>}
        </button>
      );
    }

    return days;
  };

  const handleMonthNavigation = (direction) => {
    const newDate = new Date(
      calendarViewDate.getFullYear(), 
      calendarViewDate.getMonth() + direction, 
      1
    );
    onViewDateChange(newDate);
  };

  const monthName = calendarViewDate.toLocaleString('default', { month: 'long' });
  const year = calendarViewDate.getFullYear();

  return (
    <div style={styles.container}>
      {/* Spiral binding holes */}
      <div style={styles.spiralBinding}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={styles.spiralHole}></div>
        ))}
      </div>

      <div style={styles.calendarPage}>
        {/* Red margin line */}
        <div style={styles.marginLine}></div>
        
        {/* Future date warning */}
        {showFutureWarning && (
          <div style={styles.warningPopup}>
            <div style={styles.warningContent}>
              ⚠️ Can't write in future dates!
              <div style={styles.warningSubtext}>Time hasn't caught up yet...</div>
            </div>
          </div>
        )}

        {/* Calendar header with handwritten style */}
        <div style={styles.calendarHeader}>
          <button onClick={() => handleMonthNavigation(-1)} style={styles.navButton}>
            ←
          </button>
          
          <div style={styles.monthTitle}>
            <h2 style={styles.monthText}>{monthName} {year}</h2>
            {isLoadingJournalDates && (
              <span style={styles.loadingText}>checking entries...</span>
            )}
          </div>
          
          <button onClick={() => handleMonthNavigation(1)} style={styles.navButton}>
            →
          </button>
        </div>

        {/* Selected date display */}
        <div style={styles.selectedDateDisplay}>
          <div style={styles.selectedDateText}>
            📅 {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Calendar grid */}
        <div style={styles.calendarGrid}>
          {/* Day headers */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
            <div key={i} style={styles.dayHeader}>
              {day.substring(0, 3)}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>

        {/* Today button */}
        <div style={styles.todayButtonContainer}>
          <button onClick={handleToday} style={styles.todayButton}>
            ✨ Jump to Today
          </button>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={styles.legendDot}></div>
            <span style={styles.legendText}>Has journal entry</span>
          </div>
          <div style={styles.legendItem}>
            <div style={styles.legendToday}></div>
            <span style={styles.legendText}>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f4f0',
    fontFamily: '"Kalam", "Comic Sans MS", cursive',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative'
  },

  spiralBinding: {
    position: 'absolute',
    left: '50%',
    top: '2rem',
    marginLeft: '-320px',
    height: '600px',
    width: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '60px',
    paddingTop: '60px'
  },

  spiralHole: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #ddd',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  },

  calendarPage: {
    width: '500px',
    minHeight: '300px',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px #e5e5e5',
    position: 'relative',
    padding: '40px 40px 40px 80px',
    marginLeft: '3rem',
    backgroundImage: `
      repeating-linear-gradient(
        transparent,
        transparent 31px,
        #e8f4f8 32px
      )
    `,
    backgroundSize: '100% 32px'
  },

  marginLine: {
    position: 'absolute',
    left: '70px',
    top: '0',
    bottom: '0',
    width: '2px',
    background: '#ff6b6b',
    opacity: 0.3
  },

  warningPopup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '20px 30px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    zIndex: 1000,
    animation: 'shake 0.5s ease-in-out'
  },

  warningContent: {
    textAlign: 'center',
    color: '#856404',
    fontSize: '16px',
    fontWeight: '600'
  },

  warningSubtext: {
    fontSize: '12px',
    fontStyle: 'italic',
    marginTop: '5px',
    opacity: 0.8
  },

  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 1
  },

  navButton: {
    background: 'none',
    border: '2px solid #e8f4f8',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#666',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    background: '#fff'
  },

  monthTitle: {
    textAlign: 'center',
    flex: 1
  },

  monthText: {
    fontSize: '28px',
    color: '#2c3e50',
    margin: '0',
    fontWeight: '600',
    textDecoration: 'underline',
    textDecorationColor: '#e8f4f8',
    textUnderlineOffset: '8px'
  },

  loadingText: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic',
    display: 'block',
    marginTop: '5px'
  },

  selectedDateDisplay: {
    background: '#f8f9fa',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    padding: '15px 20px',
    marginBottom: '25px',
    position: 'relative',
    zIndex: 1
  },

  selectedDateText: {
    fontSize: '16px',
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center'
  },

  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 1
  },

  dayHeader: {
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    borderBottom: '2px solid #e8f4f8'
  },

  emptyDay: {
    height: '45px'
  },

  dayButton: {
    height: '45px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    color: '#333'
  },

  selectedDay: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontWeight: '600',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },

  todayDay: {
    background: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
    color: '#2d3436',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(250, 177, 160, 0.4)'
  },

  futureDay: {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.5,
    background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #f8f9fa 2px, #f8f9fa 4px)'
  },

  journalDay: {
    background: 'linear-gradient(135deg, #81ecec, #74b9ff)',
    color: '#2d3436',
    fontWeight: '500'
  },

  dayNumber: {
    position: 'relative',
    zIndex: 2
  },

  journalDot: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '6px',
    height: '6px',
    background: '#00b894',
    borderRadius: '50%',
    zIndex: 3
  },

  todayUnderline: {
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '2px',
    background: '#e17055',
    borderRadius: '1px'
  },

  todayButtonContainer: {
    textAlign: 'center',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },

  todayButton: {
    background: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: 'inherit',
    fontWeight: '600',
    color: '#2d3436',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(253, 121, 168, 0.3)'
  },

  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    fontSize: '12px',
    color: '#666',
    position: 'relative',
    zIndex: 1
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  legendDot: {
    width: '8px',
    height: '8px',
    background: '#00b894',
    borderRadius: '50%'
  },

  legendToday: {
    width: '12px',
    height: '8px',
    background: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
    borderRadius: '4px'
  },

  legendText: {
    fontStyle: 'italic'
  }
};

// Add keyframe animation for shake effect
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
    25% { transform: translate(-50%, -50%) rotate(1deg); }
    75% { transform: translate(-50%, -50%) rotate(-1deg); }
  }
`;

// Inject the keyframes into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shakeKeyframes;
  document.head.appendChild(styleSheet);
}

export default Calendar;
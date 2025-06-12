import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSelectedDayStore from '../../stores/dataStore';

const Calendar = ({ selectedDate, calendarViewDate, onDateSelect, onViewDateChange }) => {
  const setSelectedDay = useSelectedDayStore((state) => state.setSelectedDay);
  const selectedDay = useSelectedDayStore((state) => state.selectedDay);
  const [showFutureWarning, setShowFutureWarning] = useState(false);
  const [journalDates, setJournalDates] = useState(new Set());
  const [isLoadingJournalDates, setIsLoadingJournalDates] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (isMobile) setIsModalOpen(false);
  };

  const handleDateClick = (currentDate, isFutureDate) => {
    if (isFutureDate) {
      setShowFutureWarning(true);
      setTimeout(() => setShowFutureWarning(false), 2000);
    } else {
      setSelectedDay(currentDate);
      onDateSelect(currentDate);
      if (isMobile) setIsModalOpen(false);
    }
  };

useEffect(() => {
  console.log('Selected date updated:', selectedDay);
}, [selectedDay]);

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
      days.push(<div key={`empty-${i}`} style={isMobile ? mobileStyles.emptyDay : styles.emptyDay}></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isFutureDate = currentDate > today;
      const hasJournal = hasJournalEntry(currentDate);

      const dayButtonStyle = isMobile ? 
        {
          ...mobileStyles.dayButton,
          ...(isSelected ? mobileStyles.selectedDay : {}),
          ...(isToday ? mobileStyles.todayDay : {}),
          ...(isFutureDate ? mobileStyles.futureDay : {}),
          ...(hasJournal ? mobileStyles.journalDay : {})
        } :
        {
          ...styles.dayButton,
          ...(isSelected ? styles.selectedDay : {}),
          ...(isToday ? styles.todayDay : {}),
          ...(isFutureDate ? styles.futureDay : {}),
          ...(hasJournal ? styles.journalDay : {})
        };

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(currentDate, isFutureDate)}
          style={dayButtonStyle}
          disabled={isFutureDate}
        >
          <span style={isMobile ? mobileStyles.dayNumber : styles.dayNumber}>{day}</span>
          {hasJournal && <div style={isMobile ? mobileStyles.journalDot : styles.journalDot}></div>}
          {isToday && <div style={isMobile ? mobileStyles.todayUnderline : styles.todayUnderline}></div>}
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

  // Mobile Calendar Icon
  if (isMobile) {
    return (
      <>
        {/* Calendar Icon Button */}
        <div style={mobileStyles.iconContainer}>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={mobileStyles.calendarIcon}
            aria-label="Open Calendar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={mobileStyles.selectedDateShort}>
              {selectedDate.getDate()}/{selectedDate.getMonth() + 1} - Change date
            </span>
          </button>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div style={mobileStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={mobileStyles.modalContent} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={mobileStyles.modalHeader}>
                <h3 style={mobileStyles.modalTitle}>Select Date</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={mobileStyles.closeButton}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Calendar Content */}
              <div style={mobileStyles.calendarContainer}>
                {/* Future date warning */}
                {showFutureWarning && (
                  <div style={mobileStyles.warningPopup}>
                    <div style={mobileStyles.warningContent}>
                      ⚠️ Can't select future dates!
                    </div>
                  </div>
                )}

                {/* Calendar header */}
                <div style={mobileStyles.calendarHeader}>
                  <button onClick={() => handleMonthNavigation(-1)} style={mobileStyles.navButton}>
                    ←
                  </button>
                  
                  <div style={mobileStyles.monthTitle}>
                    <h4 style={mobileStyles.monthText}>{monthName} {year}</h4>
                    {isLoadingJournalDates && (
                      <span style={mobileStyles.loadingText}>Loading...</span>
                    )}
                  </div>
                  
                  <button onClick={() => handleMonthNavigation(1)} style={mobileStyles.navButton}>
                    →
                  </button>
                </div>

                {/* Calendar grid */}
                <div style={mobileStyles.calendarGrid}>
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} style={mobileStyles.dayHeader}>
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {renderCalendarDays()}
                </div>

                {/* Today button */}
                <div style={mobileStyles.todayButtonContainer}>
                  <button onClick={handleToday} style={mobileStyles.todayButton}>
                    Today
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop version (original layout)
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

// Mobile styles
const mobileStyles = {
  iconContainer: {
    display: 'inline-block'
  },

  calendarIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  selectedDateShort: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6c757d'
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '320px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef'
  },

  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6c757d',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  calendarContainer: {
    padding: '16px 20px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  warningPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '12px',
    zIndex: 1001,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },

  warningContent: {
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500'
  },

  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },

  navButton: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#495057',
    transition: 'all 0.2s ease'
  },

  monthTitle: {
    textAlign: 'center',
    flex: 1
  },

  monthText: {
    fontSize: '16px',
    color: '#212529',
    margin: 0,
    fontWeight: '600'
  },

  loadingText: {
    fontSize: '10px',
    color: '#6c757d',
    fontStyle: 'italic',
    display: 'block',
    marginTop: '2px'
  },

  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    marginBottom: '16px'
  },

  dayHeader: {
    padding: '8px 4px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d'
  },

  emptyDay: {
    height: '36px'
  },

  dayButton: {
    height: '36px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: '#495057'
  },

  selectedDay: {
    background: '#007bff',
    color: '#fff',
    fontWeight: '600'
  },

  todayDay: {
    background: '#ffc107',
    color: '#212529',
    fontWeight: '600'
  },

  futureDay: {
    color: '#ced4da',
    cursor: 'not-allowed',
    opacity: 0.5
  },

  journalDay: {
    background: '#28a745',
    color: '#fff',
    fontWeight: '500'
  },

  dayNumber: {
    position: 'relative',
    zIndex: 2
  },

  journalDot: {
    position: 'absolute',
    bottom: '3px',
    right: '3px',
    width: '4px',
    height: '4px',
    background: '#fff',
    borderRadius: '50%',
    zIndex: 3
  },

  todayUnderline: {
    position: 'absolute',
    bottom: '2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '16px',
    height: '2px',
    background: '#e17055',
    borderRadius: '1px'
  },

  todayButtonContainer: {
    textAlign: 'center'
  },

  todayButton: {
    background: '#17a2b8',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

// Desktop styles (original styles)
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
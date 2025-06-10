  // components/MyDiary/MyDiaryPage.js
  import React, { useEffect, useState } from 'react';
  import '../css/Mydiary.css';
  import axios from 'axios';

  // Components
  import Calendar from './Mydiary/calendar';
  import ActionButtons from './Mydiary/actionbuttons';
  import JournalForm from './Mydiary/journalForm';
  import JournalDisplay from './Mydiary/journalDisplay';
  import VisibilitySelector from './Mydiary/visibilitySelector';



  const MyDiaryPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('private');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [currentJournal, setCurrentJournal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingJournal, setIsLoadingJournal] = useState(false);

    const visibilityOptions = [
      { value: 'private', label: 'Private', icon: '🔒', description: 'Only you can see this' },
      { value: 'close-circle', label: 'Me & my friends', icon: '👥', description: 'Your close friends can see' }
    ];



    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImage(URL.createObjectURL(file));
        setImageFile(file);
      }
    };

    const handleRemoveImage = () => {
      setImage(null);
      setImageFile(null);
      const fileInput = document.querySelector('.photo-input');
      if (fileInput) fileInput.value = '';
    };

    const handleVisibilityChange = (newVisibility) => {
      setVisibility(newVisibility);
      if (newVisibility === 'private') {
        setIsAnonymous(false);
      }
    };

    const fetchJournalForDate = async (date) => {
      try {
        setIsLoadingJournal(true);
        setError('');
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/journals/date/${dateString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data) {
          setCurrentJournal(response.data);
          if (!isEditing) {
            clearForm();
          }
        } else {
          setCurrentJournal(null);
          clearForm();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setCurrentJournal(null);
          clearForm();
        } else {
          console.error('Error fetching journal:', error);
          setError('Failed to fetch journal for this date');
        }
      } finally {
        setIsLoadingJournal(false);
      }
    };

    const clearForm = () => {
      setTitle('');
      setContent('');
      setImage(null);
      setImageFile(null);
      setVisibility('private');
      setIsAnonymous(false);
    };

    const handleEdit = () => {
      if (currentJournal) {
        setTitle(currentJournal.title);
        setContent(currentJournal.content);
        setVisibility(currentJournal.visibility);
        setIsAnonymous(currentJournal.isAnonymous);
        if (currentJournal.images && currentJournal.images.length > 0) {
          setImage(currentJournal.images[0]);
        }
        setIsEditing(true);
      }
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      clearForm();
    };

    const handleUpdateJournal = async () => {
      try {
        setIsLoading(true);
        setError('');

        if (!title.trim() || !content.trim()) {
          throw new Error('Both title and content are required.');
        }

        if (!currentJournal) {
          throw new Error('No journal selected for update.');
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated.');
        
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('visibility', visibility);
        formData.append('isAnonymous', isAnonymous);

        if (!image && currentJournal.images && currentJournal.images.length > 0) {
          formData.append('removeImage', 'true');
        } else if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/journals/${currentJournal._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          setIsSaved(true);
          setIsEditing(false);
          
          
          await fetchJournalForDate(selectedDate);
          clearForm();
          
          setTimeout(() => setIsSaved(false), 3000);
        } else {
          throw new Error('Update failed. Try again.');
        }
      } catch (error) {
        console.error('Update error:', error);
        setError(error?.response?.data?.message || error.message || 'Failed to update journal.');
        setTimeout(() => setError(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    const handleCreateJournal = async () => {
      try {
        setIsLoading(true);
        setError('');

        if (!title.trim() || !content.trim()) {
          throw new Error('Both title and content are required.');
        }

        const token = localStorage.getItem('token');
        if (!token) throw new Error('User is not authenticated.');
        
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('visibility', visibility);
        formData.append('isAnonymous', isAnonymous);

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        formData.append('journaldate', dateString);

        if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/journals`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 201) {
          setIsSaved(true);
          
          
          await fetchJournalForDate(selectedDate);
          clearForm();
          
          setTimeout(() => setIsSaved(false), 3000);
        } else {
          throw new Error('Save failed. Try again.');
        }
      } catch (error) {
        console.error('Create error:', error);
        setError(error?.response?.data?.message || error.message || 'Something went wrong.');
        setTimeout(() => setError(''), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSave = async () => {
      if (isEditing && currentJournal) {
        await handleUpdateJournal();
      } else {
        await handleCreateJournal();
      }
    };

    useEffect(() => {
      fetchJournalForDate(selectedDate);
    }, [selectedDate]);

    return (
      <div className="diary-container">
        <div className="floating-bg-1" />
        <div className="floating-bg-2" />

        <div className="content-wrapper">
          <div className="main-grid">
            {/* Sidebar */}
            <div className="sidebar">
              <Calendar
                selectedDate={selectedDate}
                calendarViewDate={calendarViewDate}
                onDateSelect={setSelectedDate}
                onViewDateChange={setCalendarViewDate}
              />

              <ActionButtons
                title={title}
                content={content}
                isLoading={isLoading}
                isSaved={isSaved}
                isEditing={isEditing}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
                onImageChange={handleImageChange}
              />
            </div>

            {/* Main Content */}
            <div>
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {isLoadingJournal ? (
                <div className="loading-message">
                  📖 Loading journal for {selectedDate.toDateString()}...
                </div>
              ) : currentJournal && !isEditing ? (
                <JournalDisplay 
                  journal={currentJournal}
                  visibilityOptions={visibilityOptions}
                  onEdit={handleEdit}
                />
              ) : (
                <JournalForm
                  title={title}
                  content={content}
                  visibility={visibility}
                  isAnonymous={isAnonymous}
                  image={image}
                  isEditing={isEditing}
                  isSaved={isSaved}
                  visibilityOptions={visibilityOptions}
                  onTitleChange={setTitle}
                  onContentChange={setContent}
                  onVisibilityChange={handleVisibilityChange}
                  onIsAnonymousChange={setIsAnonymous}
                  onRemoveImage={handleRemoveImage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default MyDiaryPage;
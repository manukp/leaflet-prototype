import { useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { useAppContext } from '../../context/AppContext';
import 'react-datepicker/dist/react-datepicker.css';
import './TimelineControls.css';

export function TimelineControls() {
  const { filters, setDateRange, setCurrentTimePoint } = useAppContext();
  const { dateRange, currentTimePoint } = filters;

  // Calculate slider value and range
  const sliderRange = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return { min: 0, max: 100, value: 100 };

    const start = dateRange.start.getTime();
    const end = dateRange.end.getTime();
    const current = currentTimePoint ? currentTimePoint.getTime() : end;

    return {
      min: 0,
      max: 100,
      value: ((current - start) / (end - start)) * 100
    };
  }, [dateRange, currentTimePoint]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dateRange.start || !dateRange.end) return;

    const percent = parseFloat(e.target.value);
    const start = dateRange.start.getTime();
    const end = dateRange.end.getTime();
    const newTime = start + ((end - start) * percent) / 100;

    setCurrentTimePoint(new Date(newTime));
  };

  const handleStartDateChange = (date: Date | null) => {
    setDateRange(date, dateRange.end);
    if (date && currentTimePoint && currentTimePoint < date) {
      setCurrentTimePoint(date);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setDateRange(dateRange.start, date);
    if (date && currentTimePoint && currentTimePoint > date) {
      setCurrentTimePoint(date);
    }
  };

  const formatCurrentDate = () => {
    if (!currentTimePoint) return 'Select a date';
    return currentTimePoint.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="timeline-controls">
      <div className="date-picker-container">
        <label>Start Date</label>
        <DatePicker
          selected={dateRange.start}
          onChange={handleStartDateChange}
          selectsStart
          startDate={dateRange.start}
          endDate={dateRange.end}
          maxDate={dateRange.end || undefined}
          dateFormat="MMM d, yyyy"
          className="date-input"
          placeholderText="Select start date"
        />
      </div>

      <div className="slider-container">
        <div className="current-time-display">{formatCurrentDate()}</div>
        <input
          type="range"
          min={sliderRange.min}
          max={sliderRange.max}
          value={sliderRange.value}
          onChange={handleSliderChange}
          className="timeline-slider"
        />
      </div>

      <div className="date-picker-container">
        <label>End Date</label>
        <DatePicker
          selected={dateRange.end}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={dateRange.start}
          endDate={dateRange.end}
          minDate={dateRange.start || undefined}
          dateFormat="MMM d, yyyy"
          className="date-input"
          placeholderText="Select end date"
        />
      </div>
    </div>
  );
}

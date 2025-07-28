import React, { useState, useEffect, useCallback } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import "./calendar.component.css";
import { daysOfWeekShort, daysOfWeek, emotionCode } from "../../shared";
import JoyfulImage from "../../assets/img/Joyful.png";
import MotivatedImage from "../../assets/img/Motivated.png";
import CalmImage from "../../assets/img/Calm.png";
import AnxiousImage from "../../assets/img/Anxious.png";
import SadImage from "../../assets/img/Sad.png";
import FrustratedImage from "../../assets/img/Frustrated.png";
import logo from "../../assets/img/paik-logo.png";

const CalendarComponent = ({ data, onDateRangeChange }) => {
  const [view, setView] = useState("month"); // 'month' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDateRange = useCallback(() => {
    let start, end;
    if (view === "month") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      start = new Date(startOfWeek);
      end = new Date(startOfWeek);
      end.setDate(startOfWeek.getDate() + 6);
    }
    onDateRangeChange(start, end);
    return { start, end };
  }, [currentDate, view, onDateRangeChange]);

  useEffect(() => {
    getDateRange();
  }, [getDateRange]);

  useEffect(() => {
    getDateRange();
  }, [currentDate, view, getDateRange]);

  const handlePrev = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.setMonth(currentDate.getMonth() - 1))
      );
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.setMonth(currentDate.getMonth() + 1))
      );
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const days = [];
    for (let i = 1; i <= lastDay.getUTCDate(); i++) {
      days.push(new Date(Date.UTC(year, month, i)));
    }
    const startDay = firstDay.getUTCDay();
    const daysToDisplay = [];
    for (let i = 0; i < startDay; i++) {
      daysToDisplay.push(null);
    }
    daysToDisplay.push(...days);
    const endDay = lastDay.getUTCDay();
    if (endDay < 6) {
      for (let i = 1; i <= 6 - endDay; i++) {
        daysToDisplay.push(null);
      }
    }
    return daysToDisplay;
  };

  const getDayColor = (day) => {
    const dateStr = day.toISOString().split("T")[0];
    const entry = data.find((data) => data.date.startsWith(dateStr));
    if (entry) {
      switch (entry.mood.code) {
        case emotionCode.JOY.code:
          return "yellow";
        case emotionCode.MOTIVATED.code:
          return "green";
        case emotionCode.CALM.code:
          return "blue";
        case emotionCode.ANXIOUS.code:
          return "orange";
        case emotionCode.SAD.code:
          return "gray";
        case emotionCode.FRUSTRATED.code:
          return "red";
        default:
          return "default";
      }
    }
    return "default";
  };

  const getEmotionImage = (moodCode) => {
    switch (moodCode) {
      case emotionCode.JOY.code:
        return JoyfulImage;
      case emotionCode.MOTIVATED.code:
        return MotivatedImage;
      case emotionCode.CALM.code:
        return CalmImage;
      case emotionCode.ANXIOUS.code:
        return AnxiousImage;
      case emotionCode.SAD.code:
        return SadImage;
      case emotionCode.FRUSTRATED.code:
        return FrustratedImage;
      default:
        return logo;
    }
  };

  const getDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const renderDays = () => {
    const days =
      view === "month"
        ? getDaysInMonth(currentDate)
        : getDaysInWeek(currentDate);

    return days.map((day, index) => {
      if (day) {
        const dateStr = day.toISOString().split("T")[0];
        const entry = data.find((data) => data.date.startsWith(dateStr));

        return (
          <div
            key={index}
            className={`calendar-day calendar-day-${getDayColor(day)}`}
          >
            <div className="day-number">{day.getDate()}</div>
            {view === "week" && (
              <>
                <div className="day-name">{daysOfWeek[day.getDay()]}</div>
                {entry && (
                  <div className="emotion-info">
                    <div className="emotion-description">
                      {entry.mood.description}
                    </div>
                    <img
                      src={getEmotionImage(entry.mood.code)} // Use the getEmotionImage function here
                      alt={entry.mood.code}
                      className="emotion-icon"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      } else {
        return <div key={index} className="calendar-day-empty"></div>;
      }
    });
  };

  const renderCalendar = () => {
    if (view === "month") {
      return (
        <div className="calendar-month">
          {daysOfWeekShort.map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
          {renderDays()}
        </div>
      );
    } else if (view === "week") {
      return <div className="calendar-week">{renderDays()}</div>;
    }
  };

  const getMonthYearHeader = () => {
    const options = { year: "numeric", month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(currentDate);
  };

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header className="background-white" as="h3">
        Mood Colors
      </Popover.Header>
      <Popover.Body>
        <div className="d-flex align-items-center mb-2">
          <div className="info-dot calendar-day-yellow me-2"></div> Joyful
        </div>
        <div className="d-flex align-items-center mb-2">
          <div className="info-dot calendar-day-green me-2"></div> Motivated
        </div>
        <div className="d-flex align-items-center mb-2">
          <div className="info-dot calendar-day-blue me-2"></div> Calm
        </div>
        <div className="d-flex align-items-center mb-2">
          <div className="info-dot calendar-day-orange me-2"></div> Anxious
        </div>
        <div className="d-flex align-items-center mb-2">
          <div className="info-dot calendar-day-gray me-2"></div> Sad
        </div>
        <div className="d-flex align-items-center">
          <div className="info-dot calendar-day-red me-2"></div> Frustrated
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="custom-calendar">
      <div className="calendar-view-controls d-flex align-items-center">
        <button
          className={view === "month" ? "active" : ""}
          onClick={() => setView("month")}
        >
          Monthly
        </button>
        <button
          className={view === "week" ? "active" : ""}
          onClick={() => setView("week")}
        >
          Weekly
        </button>
      </div>

      <div className="calendar-header-month">
        <h2>{getMonthYearHeader()}</h2>
        <div className="calendar-controls">
          <OverlayTrigger trigger="click" placement="right" overlay={popover}>
            <Button variant="info" className="calendar-info-btn">
              ?
            </Button>
          </OverlayTrigger>
          <button onClick={handlePrev}>
            <i className="fas fa-angle-double-left"></i>
          </button>
          <button onClick={handleToday}>Today</button>
          <button onClick={handleNext}>
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>

      <div className="calendar-content">{renderCalendar()}</div>
    </div>
  );
};

export default CalendarComponent;

import React, { useRef } from "react";
import { InputGroup, FormControl } from "react-bootstrap";
import "./date-picker.component.css";

const DatePicker = ({
  selectedDate,
  handleDateChange,
  minDate,
  errorMessage,
}) => {
  const dateInputRef = useRef(null);

  const handleInputClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker(); // Automatically show date picker on click
    }
  };

  return (
    <div className="date-picker">
      <label>
        <strong>Select Date:</strong>
      </label>
      <InputGroup>
        <FormControl
          type="date"
          ref={dateInputRef}
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate}
          onClick={handleInputClick}
          style={{ cursor: "pointer" }}
        />
      </InputGroup>
      {errorMessage && <div className="text-danger">{errorMessage}</div>}
    </div>
  );
};

export default DatePicker;

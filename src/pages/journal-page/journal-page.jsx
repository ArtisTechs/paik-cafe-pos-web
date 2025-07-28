import React, { useEffect, useState } from "react";
import "./journal-page.css";
import {
  useGlobalContext,
  toastService,
  createJournal,
  EErrorMessages,
  fetchJournalsByUser,
  deleteJournal,
  formatDate,
  fetchJournalById,
  updateJournal,
  modalService,
  ESuccessMessages,
} from "../../shared";
import { Form } from "react-bootstrap";
import DatePicker from "../../components/date-picker/date-picker.component";
import { DateFormat } from "../../shared/enum/date-format.enum";

const JournalPage = ({ setFullLoadingHandler }) => {
  const { currentUserDetails } = useGlobalContext();
  const [journals, setJournals] = useState([]);
  const [formState, setFormState] = useState({
    id: null,
    title: "",
    message: "",
    entryDate: "",
  });
  const [originalFormState, setOriginalFormState] = useState(null); // Added to store original state
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [originalSelectedDate, setOriginalSelectedDate] = useState(""); // Added to store original selected date
  const [isUpdating, setIsUpdating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    message: "",
    entryDate: "",
  });

  useEffect(() => {
    if (currentUserDetails?.id) {
      loadJournals();
    }
  }, [currentUserDetails]);

  const loadJournals = async () => {
    try {
      setFullLoadingHandler(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (currentUserDetails?.id) {
        const journalData = await fetchJournalsByUser({
          userId: currentUserDetails.id,
          sortBy: "entryDate",
          asc: true,
        });
        setJournals(journalData);
      }
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (!formState.title) {
      validationErrors.title = "Title is required.";
    }
    if (!formState.message) {
      validationErrors.message = "Message is required.";
    }
    if (!selectedDate) {
      validationErrors.entryDate = "Entry date is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setFullLoadingHandler(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      let savedJournal;
      if (isUpdating) {
        savedJournal = await updateJournal(formState.id, {
          ...formState,
          entryDate: selectedDate,
        });
        toastService.show(
          `Journal titled: "${formState.title}" successfully updated.`,
          "success-toast"
        );
      } else {
        savedJournal = await createJournal(currentUserDetails.id, {
          ...formState,
          entryDate: selectedDate,
        });
        toastService.show(
          `Journal titled: "${formState.title}" successfully created.`,
          "success-toast"
        );
      }
      setFormState({
        id: savedJournal.id,
        title: savedJournal.title,
        message: savedJournal.message,
        entryDate: savedJournal.entryDate,
      });
      setIsViewing(true);
      setIsUpdating(false);
    } catch (error) {
      if (error?.data?.errorCode === "DATE_ALREADY_TAKEN") {
        let validationErrors = {};
        validationErrors.entryDate = error?.data?.message;
        setErrors(validationErrors);
      } else {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      }
    } finally {
      loadJournals();
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setFormState((prevState) => ({
      ...prevState,
      entryDate: date,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      entryDate: "",
    }));
  };

  const handleView = async (journalId) => {
    try {
      const journal = await fetchJournalById(journalId);
      setFormState({
        id: journal.id,
        title: journal.title,
        message: journal.message,
        entryDate: journal.entryDate,
      });
      setSelectedDate(journal.entryDate);
      setIsViewing(true);
      setIsUpdating(false);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    }
  };

  const handleEdit = (journal) => {
    setOriginalFormState(journal);
    setOriginalSelectedDate(journal.entryDate.substring(0, 10));
    setFormState({
      id: journal.id,
      title: journal.title,
      message: journal.message,
      entryDate: journal.entryDate.substring(0, 10),
    });
    setSelectedDate(journal.entryDate.substring(0, 10));
    setIsUpdating(true);
    setIsViewing(false);
  };

  const handleDelete = async (journal) => {
    modalService.show({
      title: "Delete Journal?",
      message: `Are you sure you want to delete ${journal.title}?`,
      onConfirm: async () => {
        try {
          setFullLoadingHandler(true);
          await deleteJournal(journal.id);
          toastService.show(
            `Journal ${journal.title} successfully deleted.`,
            "success-toast"
          );
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          loadJournals();
        }
      },
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
    });
  };

  const handleNewJournal = () => {
    setIsUpdating(false);
    setIsViewing(false);
    setFormState({ id: null, title: "", message: "", entryDate: "" });
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setErrors({ title: "", message: "", entryDate: "" });
  };

  const handleCancelClicked = () => {
    if (isUpdating) {
      setFormState(originalFormState);
      setSelectedDate(originalSelectedDate);
    }
    setIsViewing(true);
    setIsUpdating(false);
  };

  return (
    <div className="journal-page">
      <div className="journal-list-section">
        <h1>My Journal Entries</h1>
        <div className="button-container">
          <button
            className="white-button shadow mb-3"
            onClick={() => {
              handleNewJournal();
            }}
          >
            New
          </button>
        </div>
        {journals.length === 0 ? (
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <p>No journal entries found.</p>
          </div>
        ) : (
          <ul className="journal-list">
            {journals.map((journal) => (
              <li key={journal.id} className="journal-item">
                <div className="journal-item-label text-capitalize">
                  <h3>{journal.title}</h3>
                  <p>
                    {formatDate(journal.entryDate, DateFormat.MONTH_DAY_YEAR)}
                  </p>
                </div>
                <div className="dropdown journal-item-dropdown">
                  <button
                    className="ellipsis-btn"
                    type="button"
                    id={`dropdownMenuButton${journal.id}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby={`dropdownMenuButton${journal.id}`}
                  >
                    <li>
                      <button
                        onClick={() => handleView(journal?.id)}
                        className="dropdown-item"
                      >
                        View
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleEdit(journal)}
                        className="dropdown-item"
                      >
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleDelete(journal)}
                        className="dropdown-item"
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="journal-form-section">
        {isViewing ? (
          <div className="journal-view-section">
            <div className="journal-view-header">
              <h2>View Journal</h2>
              <button
                className="edit-journal-button"
                onClick={() => handleEdit(formState)}
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
            <div className="journal-view-title text-capitalize">
              <h1>{formState.title}</h1>
              <p>
                {formatDate(formState.entryDate, DateFormat.MONTH_DAY_YEAR)}
              </p>
            </div>
            <div className="journal-view-message">
              <p>{formState.message}</p>
            </div>
            <button
              className="secondary-button shadow"
              onClick={() => {
                handleNewJournal();
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="journal-edit-section">
            <h2>{isUpdating ? "Update Journal" : "Create Journal"}</h2>
            <form onSubmit={handleSubmit} className="journal-form">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control primary-input"
                  id="title"
                  name="title"
                  placeholder="Enter Title..."
                  value={formState.title || ""}
                  onChange={handleInputChange}
                  maxLength={64}
                  style={{ width: "100%" }}
                />
                <label htmlFor="title">
                  Title<span className="text-danger">*</span>
                </label>
                {errors.title && (
                  <div className="text-danger">{errors.title}</div>
                )}
              </div>
              <div className="form-group m-0">
                <DatePicker
                  selectedDate={selectedDate}
                  handleDateChange={handleDateChange}
                  dateError={errors.entryDate}
                  errorMessage={errors.entryDate}
                />
              </div>
              <div className="form-floating mb-3 journal-textarea">
                <textarea
                  className="form-control primary-input"
                  id="message"
                  name="message"
                  placeholder="Enter Journal Message..."
                  value={formState.message || ""}
                  onChange={handleInputChange}
                  maxLength={2000}
                  style={{ height: "90%", resize: "none", width: "100%" }}
                />
                <label htmlFor="message">
                  Message<span className="text-danger">*</span>
                </label>
                {errors.message && (
                  <div className="text-danger">{errors.message}</div>
                )}
              </div>
              <div className="button-container">
                {isUpdating && (
                  <button
                    type="button"
                    className="secondary-button shadow"
                    onClick={() => {
                      handleCancelClicked();
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="white-button shadow">
                  {isUpdating ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;

import React, { useState, useEffect } from "react";
import "./emotion-picker.component.css";

// Importing emotion images
import JoyfulImage from "../../assets/img/Joyful.png";
import MotivatedImage from "../../assets/img/Motivated.png";
import CalmImage from "../../assets/img/Calm.png";
import AnxiousImage from "../../assets/img/Anxious.png";
import SadImage from "../../assets/img/Sad.png";
import FrustratedImage from "../../assets/img/Frustrated.png";
import {
  addMood,
  getMoods,
  emotionCode,
  updateMoodById,
  useGlobalContext,
  toastService,
  EErrorMessages,
} from "../../shared";

const emotions = [
  { image: JoyfulImage, ...emotionCode.JOY },
  { image: MotivatedImage, ...emotionCode.MOTIVATED },
  { image: CalmImage, ...emotionCode.CALM },
  { image: AnxiousImage, ...emotionCode.ANXIOUS },
  { image: SadImage, ...emotionCode.SAD },
  { image: FrustratedImage, ...emotionCode.FRUSTRATED },
];

const EmotionPicker = () => {
  const { currentUserDetails } = useGlobalContext();
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [todayMoodId, setTodayMoodId] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (currentUserDetails.id) {
      const fetchUserMood = async () => {
        const today = getTodayDate();
        try {
          const moods = await getMoods({
            userId: currentUserDetails.id,
            startDate: today,
            endDate: today,
          });

          if (moods.length > 0) {
            const todayMood = moods[0]; // Assuming there is only one mood for today
            setSelectedEmotion(todayMood.mood.description);
            setTodayMoodId(todayMood.id); // Store the ID of today's mood
          }
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      };

      fetchUserMood();
    }
  }, [currentUserDetails]);

  const handleEmotionClick = async (emotion) => {
    setSelectedEmotion(emotion.description);

    const moodDetails = {
      userId: currentUserDetails.id,
      date: getTodayDate(),
      mood: {
        code: emotion.code,
        description: emotion.description,
      },
    };

    try {
      if (todayMoodId) {
        // If the user already has a mood for today, update it
        const updatedMood = await updateMoodById(todayMoodId, moodDetails);
        toastService.show(
          `You have successfully change your mood today to "${moodDetails.mood.description}".`,
          "success-toast"
        );
      } else {
        // If no mood exists, add a new one
        const addedMood = await addMood(moodDetails);
        toastService.show(
          `You have successfully choose your mood today to "${moodDetails.mood.description}".`,
          "success-toast"
        );
      }
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    }
  };

  return (
    <div className="emotion-picker">
      <h1>How are you feeling today?</h1>

      <div className="emotion-list">
        {emotions.map((emotion, index) => (
          <div
            key={index}
            className={`emotion-btn ${
              selectedEmotion === emotion.description ? "selected" : ""
            }`}
            onClick={() => handleEmotionClick(emotion)}
          >
            <img
              src={emotion.image}
              alt={emotion.description}
              className="emotion-image"
            />
            <p className="emotion-name">{emotion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionPicker;

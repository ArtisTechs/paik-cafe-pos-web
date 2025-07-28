import React from "react";
import slideImage1 from "../../assets/img/carousel-1.png";
import slideImage2 from "../../assets/img/carousel-2.png";
import slideImage3 from "../../assets/img/carousel-3.png";
import slideImage4 from "../../assets/img/carousel-4.png";
import "./intro-carousel.css";

const IntroCarouselComponent = () => {
  return (
    <div
      id="carouselExampleIndicators"
      className="carousel slide carousel-login"
      data-bs-ride="carousel"
    >
      <ol className="carousel-indicators">
        <li
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="0"
          className="active"
        ></li>
        <li
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="1"
        ></li>
        <li
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="2"
        ></li>
        <li
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide-to="3"
        ></li>
      </ol>
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img className="d-block w-100" src={slideImage1} alt="First slide" />
          <div className="carousel-caption text-black">
            <h5>Welcome!</h5>
          </div>
        </div>
        <div className="carousel-item">
          <img className="d-block w-100" src={slideImage2} alt="Second slide" />
          <div className="carousel-caption text-black">
            <h5>Track Your Mood</h5>
            <p>Log your feelings daily using simple emojis.</p>
          </div>
        </div>
        <div className="carousel-item">
          <img className="d-block w-100" src={slideImage3} alt="Third slide" />
          <div className="carousel-caption text-black">
            <h5>Live Chat</h5>
            <p>Instantly connect with counselors for real-time support.</p>
          </div>
        </div>
        <div className="carousel-item">
          <img className="d-block w-100" src={slideImage4} alt="Fourth slide" />
          <div className="carousel-caption text-black">
            <h5>Appointments</h5>
            <p>Schedule one-on-one sessions with school counselors.</p>
          </div>
        </div>
      </div>
      <a
        className="carousel-control-prev prev-next-login"
        href="#carouselExampleIndicators"
        role="button"
        data-bs-slide="prev"
      >
        <span
          className="carousel-control-prev-icon shadow-black"
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Previous</span>
      </a>
      <a
        className="carousel-control-next"
        href="#carouselExampleIndicators"
        role="button"
        data-bs-slide="next"
      >
        <span
          className="carousel-control-next-icon shadow-black"
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Next</span>
      </a>
    </div>
  );
};

export default IntroCarouselComponent;

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export default function Profile() {

  const navigate =
    useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    const userId =
      localStorage.getItem(
        "userId"
      );

    if (storedUser) {
      setProfile(
        JSON.parse(storedUser)
      );
    }

    if (!userId) {
      return;
    }

    loadProfile(userId);

  }, []);

  const loadProfile = async (
    userId
  ) => {

    try {

      const res =
        await axios.get(
          `${API}/api/profile/${userId}`
        );

      setProfile(res.data);

    } catch (error) {

      console.log(error);

      setError(
        "Could not load full profile details."
      );
    }
  };

  if (!profile) {
    return (
      <div className="profile-page">

        <div className="profile-card glass">

          <h2>
            Profile
          </h2>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  const initial =
    (profile.username || profile.email || "U")
      .charAt(0)
      .toUpperCase();

  return (
    <div className="profile-page">

      <div className="profile-card glass">

        <div className="avatar">

          {initial}

        </div>

        <h1>
          {profile.username || "Profile"}
        </h1>

        <p>
          {profile.email}
        </p>

        <p>
          Created:
          {" "}
          {profile.created_at ? (
            new Date(
              profile.created_at
            )
            .toLocaleDateString()
          ) : (
            "Not available"
          )}
        </p>

        {error && (
          <small>
            {error}
          </small>
        )}

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          Back
        </button>

      </div>

    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/HomePage/Sidebar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    bio: "",
  });

  const navigate = useNavigate();

  // =========================
  // Fetch Profile
  // =========================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status) {
        setUser(data.data);
        setFormData({
          name: data.data.name,
          skills: Array.isArray(data.data.skills)
            ? data.data.skills.join(", ")
            : data.data.skills,
          bio: data.data.bio,
        });
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================
  // Handle Input Change
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Update Profile
  // =========================
  const handleUpdate = async () => {
  try {
    const token = localStorage.getItem("token");

    // Convert comma string → array before sending
    const updatedData = {
      ...formData,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const response = await fetch("http://localhost:5000/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (data.status) {
      setUser(data.data);
      setEditMode(false);
    }
  } catch (error) {
    console.error(error);
  }
};

  // =========================
  // Delete Account
  // =========================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/user/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user)
    return (
      <div className="bg-neutral-950 min-h-screen text-white flex items-center justify-center">
        Loading...
      </div>
    );

  // Convert skills safely to array
  const skillsArray =
  Array.isArray(user.skills) &&
  user.skills.length === 1 &&
  typeof user.skills[0] === "string" &&
  user.skills[0].includes(",")
    ? user.skills[0].split(",").map((s) => s.trim()).filter(Boolean)
    : Array.isArray(user.skills)
    ? user.skills
    : [];

  return (
    <div className="flex bg-neutral-950 text-white min-h-screen">
      <Sidebar user={user} />

      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-semibold text-orange-500 mb-8">
          My Profile
        </h1>

        {/* Removed max-w-2xl */}
        <div className="bg-neutral-900 p-10 rounded-xl border border-neutral-800 w-full lg:w-4/5">

          {/* Name */}
          <div className="mb-6">
            <p className="text-neutral-400">Name</p>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-neutral-800 p-3 rounded mt-2"
              />
            ) : (
              <p className="text-lg">{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <p className="text-neutral-400">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <p className="text-neutral-400">Bio</p>
            {editMode ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-neutral-800 p-3 rounded mt-2"
              />
            ) : (
              <p className="text-lg">{user.bio}</p>
            )}
          </div>

          {/* Skills */}
          <div className="mb-8">
            <p className="text-neutral-400">Skills</p>

            {editMode ? (
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="C++, React, Node..."
                className="w-full bg-neutral-800 p-3 rounded mt-2"
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {skillsArray.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm 
                               border border-orange-500 
                               text-orange-400 
                               rounded-lg 
                               bg-neutral-800 
                               text-center"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 px-6 py-2 rounded-lg hover:opacity-90"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-orange-600 px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 px-6 py-2 rounded-lg hover:opacity-90 cursor-pointer"
                >
                  Delete Account
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
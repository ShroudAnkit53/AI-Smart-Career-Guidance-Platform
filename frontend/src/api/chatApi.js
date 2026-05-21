const API = "http://localhost:5000/chat";

const getToken = () => {
  return localStorage.getItem("token");
};

export const createSession = async () => {

  const res = await fetch(`${API}/session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
};

export const getSessions = async () => {

  const res = await fetch(`${API}/sessions`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
};

export const deleteSession = async (id) => {

  await fetch(`${API}/session/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

};

export const getMessages = async (id) => {

  const res = await fetch(`${API}/messages/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  return res.json();
};

export const sendMessage = async (data) => {

  const res = await fetch(`${API}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error("Server error");
  }

  return res.json();
};
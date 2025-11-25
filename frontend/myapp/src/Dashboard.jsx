import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]); 

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/get_tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTasks(res.data.tasks || []); // FIXED
    } catch (err) {
      console.log("Error fetching tasks", err);
    }
  };

  const handletasks = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/tasks",
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setError("Task Added!");
        setTitle(""); 
        setDescription(""); 
        fetchTasks();
      }
    } catch (err) {
      setError("Failed to add task");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      <aside className="w-64 bg-black text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

        <nav className="space-y-4">
          <button className="block w-full text-left hover:text-gray-300 hover-underline">
            Overview
          </button>
          <button className="block w-full text-left hover:text-gray-300 hover-underline">
            Profile
          </button>
          <button className="block w-full text-left hover:text-gray-300 hover-underline">
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </nav>
      </aside>

   
      <div className="flex-1 p-6">
       
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome Back👋</h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-700 text-lg font-medium">Total Users</h3>
            <p className="text-3xl font-bold mt-2">1,234</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-700 text-lg font-medium">
              Active Sessions
            </h3>
            <p className="text-3xl font-bold mt-2">87</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-700 text-lg font-medium">New Signups</h3>
            <p className="text-3xl font-bold mt-2">42</p>
          </div>
        </div>

        
        <div className="mt-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>

          <form onSubmit={handletasks}>
            {error && (
              <p className="text-red-500 text-sm text-center mb-3">{error}</p>
            )}

            <label className="text-2xl">Tasks</label>
            <br />

            <input
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              placeholder="Enter Task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" className="bg-green-400 p-2 rounded">
              + Add Task
            </button>
          </form>

     
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Tasks</h3>

            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li key={t.id} className="p-3 bg-gray-100 rounded">
                    <p className="font-bold">{t.title}</p>
                    <p className="text-sm text-gray-700">{t.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

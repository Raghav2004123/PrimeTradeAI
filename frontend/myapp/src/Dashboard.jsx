import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const[profile,setProfile]=useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    fetchTasks();
    fetchprofile();
  }, []);

  const fetchprofile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(res.data.user);

    } catch (err) {
      console.log("Error fetching tasks", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/get_tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTasks(res.data.tasks || []);
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


  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchTasks();
    } catch (err) {
      console.log("Failed to delete", err);
    }
  };


  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };


  const updateTask = async () => {
    try {
      await axios.put(
        `http://localhost:3000/tasks/${editId}`,
        {
          title: editTitle,
          description: editDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEditId(null);
      fetchTasks();
    } catch (err) {
      console.log("Error updating task", err);
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
          <button className="block w-full text-left hover:text-gray-300">Overview</button>
          <button className="block w-full text-left hover:text-gray-300">Profile</button>
          <button className="block w-full text-left hover:text-gray-300">Settings</button>
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
          <h1 className="text-2xl font-semibold">Welcome Back {profile.name} 👋</h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

        {profile && (
  <div className="bg-white p-5 rounded-lg shadow mb-6">
    <h2 className="text-xl font-semibold mb-3">Your Profile</h2>

    <p><span className="font-bold">Name:</span> {profile.name}</p>
    <p><span className="font-bold">Email:</span> {profile.email}</p>
    <p><span className="font-bold">User ID:</span> {profile.id}</p>

    {profile.created_at && (
      <p>
        <span className="font-bold">Joined:</span>{" "}
        {new Date(profile.created_at).toLocaleDateString()}
      </p>
    )}
  </div>
)}


        <div className="mt-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>

          <form onSubmit={handletasks}>
            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <label className="text-xl">Add Task</label>
            <br />

            <input
              className="w-full px-4 py-2 border rounded-lg mb-2"
              placeholder="Enter Task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full px-4 py-2 border rounded-lg mb-2"
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
                    {editId === t.id ? (
                      <>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border p-1 mb-2"
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border p-1 mb-2"
                        />

                        <button
                          onClick={updateTask}
                          className="bg-blue-500 text-white px-3 py-1 mr-2 rounded"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-bold">{t.title}</p>
                        <p className="text-sm text-gray-700">{t.description}</p>

                        <button
                          onClick={() => startEdit(t)}
                          className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteTask(t.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

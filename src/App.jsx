import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = () => {
    if (!title || !amount || !date) return;

    if (editId) {
      setExpenses(
        expenses.map((exp) =>
          exp.id === editId
            ? { ...exp, title, amount: Number(amount), date }
            : exp
        )
      );
      setEditId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        title,
        amount: Number(amount),
        date,
      };
      setExpenses([...expenses, newExpense]);
    }

    setTitle("");
    setAmount("");
    setDate("");
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const handleEdit = (exp) => {
    setTitle(exp.title);
    setAmount(exp.amount);
    setDate(exp.date);
    setEditId(exp.id);
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const filteredExpenses = expenses.filter((exp) =>
    exp.title.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 Chart Data
  const data = Object.values(
    filteredExpenses.reduce((acc, curr) => {
      const key = curr.title;
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += curr.amount;
      return acc;
    }, {})
  );

  // 📆 Monthly Summary with items
  const monthlyData = Object.values(
    filteredExpenses.reduce((acc, curr) => {
      const month = new Date(curr.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!acc[month]) {
        acc[month] = { month, total: 0, items: [] };
      }

      acc[month].total += curr.amount;
      acc[month].items.push(curr);

      return acc;
    }, {})
  );

  const theme = {
    background: darkMode ? "#121212" : "#ffffff",
    text: darkMode ? "#ffffff" : "#000000",
    box: darkMode ? "#1e1e1e" : "#f9f9f9",
  };

  return (
    <div
      style={{
        padding: "20px",
        background: theme.background,
        color: theme.text,
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Expense Tracker 💰</h1>

      {/* 🌙 Dark Mode */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* 🔍 Search */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search expense..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* FORM */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            background: theme.box,
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>{editId ? "Edit Expense" : "Add Expense"}</h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />

          <button
            onClick={handleAddExpense}
            style={{ width: "100%", padding: "10px" }}
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        {/* LIST */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            background: theme.box,
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Total: ₹{total}</h3>

          {filteredExpenses.length === 0 ? (
            <p>No matching expenses</p>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: darkMode ? "#2a2a2a" : "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {exp.title} - ₹{exp.amount} <br />
                  <small>{exp.date}</small>
                </span>

                <div>
                  <button
                    onClick={() => handleEdit(exp)}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(exp.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📊 Chart */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* 📆 Monthly Summary */}
      <div style={{ marginTop: "40px" }}>
        <h3>Monthly Summary 📅</h3>

        {monthlyData.map((item, index) => (
          <div
            key={index}
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "8px",
              background: theme.box,
            }}
          >
            <strong>
              {item.month} → ₹{item.total}
            </strong>

            {item.items.map((exp) => (
              <div key={exp.id} style={{ marginLeft: "10px", marginTop: "5px" }}>
                - {exp.title} ₹{exp.amount}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
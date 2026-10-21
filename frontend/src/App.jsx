import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://student-record-management-system-by6h.onrender.com/api/students';
const EMPTY_FORM = { name: '', rollNumber: '', branch: '', marks: '' };

async function api(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Can’t reach the API. Make sure the Spring Boot backend is running on port 8080.');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}). Please try again.`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch { /* Keep the status message if the response is not JSON. */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadStudents() {
    setLoading(true);
    try {
      setStudents(await api());
      setNotice(null);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStudents(); }, []);

  const query = search.trim().toLowerCase();
  const filteredStudents = students.filter((student) =>
    student.rollNumber.toLowerCase().includes(query),
  );

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function editStudent(student) {
    setEditingId(student.id);
    setForm({ name: student.name, rollNumber: student.rollNumber, branch: student.branch, marks: String(student.marks) });
    setNotice(null);
    document.getElementById('student-form')?.scrollIntoView({ block: 'start' });
  }

  async function submit(event) {
    event.preventDefault();
    const textFields = ['name', 'rollNumber', 'branch'];
    if (textFields.some((key) => !form[key].trim())) {
      setNotice({ type: 'error', text: 'Please fill in the name, roll number, and branch.' });
      return;
    }
    const marks = Number(form.marks);
    if (form.marks === '' || !Number.isInteger(marks) || marks < 0 || marks > 100) {
      setNotice({ type: 'error', text: 'Marks must be a whole number between 0 and 100.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    const payload = { ...form, name: form.name.trim(), rollNumber: form.rollNumber.trim(), branch: form.branch.trim(), marks };
    try {
      if (editingId === null) {
        const created = await api('', { method: 'POST', body: JSON.stringify(payload) });
        setStudents((current) => [...current, created]);
        setNotice({ type: 'success', text: `${created.name} was added to the roster.` });
      } else {
        const updated = await api(`/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        setStudents((current) => current.map((student) => student.id === editingId ? updated : student));
        setNotice({ type: 'success', text: `${updated.name}’s record was updated.` });
      }
      clearForm();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    setDeletingId(student.id);
    setNotice(null);
    try {
      await api(`/${student.id}`, { method: 'DELETE' });
      setStudents((current) => current.filter((item) => item.id !== student.id));
      if (editingId === student.id) clearForm();
      setNotice({ type: 'success', text: `${student.name}’s record was deleted.` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="container">
      <h1>Student Record Management System</h1>

      {notice && (
        <div className={`message ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          {notice.type === 'error' && (
            <button className="message-button" type="button" onClick={loadStudents}>
              Try again
            </button>
          )}
          <button
            className="message-close"
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="panel" id="student-form">
        <h2>{editingId === null ? 'Add Student' : 'Update Student'}</h2>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                maxLength="120"
                value={form.name}
                onChange={changeField}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                maxLength="60"
                value={form.rollNumber}
                onChange={changeField}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="branch">Branch</label>
              <input
                id="branch"
                name="branch"
                type="text"
                maxLength="100"
                value={form.branch}
                onChange={changeField}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="marks">Marks (0-100)</label>
              <input
                id="marks"
                name="marks"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.marks}
                onChange={changeField}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId === null ? 'Add Student' : 'Update'}
            </button>
            {editingId !== null && (
              <button className="button secondary" type="button" onClick={clearForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel records-panel">
        <div className="records-heading">
          <h2>Student Records</h2>
          <p>Total students: <strong>{students.length}</strong></p>
        </div>

        <div className="search-field">
          <label htmlFor="roll-search">Search by Roll Number</label>
          <input
            id="roll-search"
            type="search"
            placeholder="Enter a roll number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Roll Number</th>
                <th scope="col">Branch</th>
                <th scope="col">Marks</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-message">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-message">
                    {search ? 'No students match that roll number.' : 'No student records found.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.branch}</td>
                    <td>{student.marks}</td>
                    <td className="actions-cell">
                      <button
                        className="button small"
                        type="button"
                        onClick={() => editStudent(student)}
                      >
                        Update
                      </button>
                      <button
                        className="button small"
                        type="button"
                        disabled={deletingId === student.id}
                        onClick={() => deleteStudent(student)}
                      >
                        {deletingId === student.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
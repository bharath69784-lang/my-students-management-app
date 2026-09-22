const API = 'http://localhost:5000/api/students';
const form = document.getElementById('studentForm');
const tbody = document.getElementById('tbody');
const modal = document.getElementById('modal');
const editForm = document.getElementById('editForm');
const message = document.getElementById('message');

// Load students on page load
document.addEventListener('DOMContentLoaded', loadStudents);

// Close modal
document.querySelector('.close').addEventListener('click', () => {
  modal.style.display = 'none';
});

// Add student
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const age = document.getElementById('age').value;

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, age: age ? parseInt(age) : null })
    });
    
    if (!res.ok) throw new Error('Failed to add student');
    
    showMessage('✅ Student added!', 'success');
    form.reset();
    loadStudents();
  } catch (err) {
    showMessage('❌ ' + err.message, 'error');
  }
});

// Load all students
async function loadStudents() {
  try {
    const res = await fetch(API);
    const students = await res.json();
    
    tbody.innerHTML = '';
    students.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.name}</td>
          <td>${s.email}</td>
          <td>${s.phone || '-'}</td>
          <td>${s.age || '-'}</td>
          <td>
            <button class="btn-edit" onclick="editStudent(${s.id}, '${s.name}', '${s.email}', '${s.phone}', ${s.age})">Edit</button>
            <button class="btn-delete" onclick="deleteStudent(${s.id})">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    showMessage('❌ Failed to load students. Is backend running?', 'error');
  }
}

// Edit student
function editStudent(id, name, email, phone, age) {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editEmail').value = email;
  document.getElementById('editPhone').value = phone;
  document.getElementById('editAge').value = age;
  modal.style.display = 'block';
}

// Update student
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value;
  const email = document.getElementById('editEmail').value;
  const phone = document.getElementById('editPhone').value;
  const age = document.getElementById('editAge').value;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, age: age ? parseInt(age) : null })
    });
    
    if (!res.ok) throw new Error('Failed to update');
    
    modal.style.display = 'none';
    showMessage('✅ Student updated!', 'success');
    loadStudents();
  } catch (err) {
    showMessage('❌ ' + err.message, 'error');
  }
});

// Delete student
async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    
    showMessage('✅ Student deleted!', 'success');
    loadStudents();
  } catch (err) {
    showMessage('❌ ' + err.message, 'error');
  }
}

// Show message
function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
  message.style.display = 'block';
  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}
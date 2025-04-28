const form = document.getElementById('userForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const dob = document.getElementById('dob').value;

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, dob }),
    });

    const data = await res.json();
    if (res.ok) {
      message.textContent = data.message;
      form.reset();
    } else {
      message.textContent = data.message;
      message.style.color = 'red';
    }
  } catch (err) {
    console.error(err);
    message.textContent = 'Error submitting form';
    message.style.color = 'red';
  }
});

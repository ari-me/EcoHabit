document.addEventListener("DOMContentLoaded", () => {
  const ecoQuotes = [
    { q: "The Earth is what we all have in common.", a: "Wendell Berry" },
    { q: "We won’t have a society if we destroy the environment.", a: "Margaret Mead" },
    { q: "The environment is where we all meet.", a: "Lady Bird Johnson" },
    { q: "He that plants trees loves others besides himself.", a: "Thomas Fuller" },
    { q: "Nature provides a free lunch, but only if we control our appetites.", a: "William Ruckelshaus" },
    { q: "What we are doing to the forests is but a mirror reflection of what we are doing to ourselves.", a: "Mahatma Gandhi" },
    { q: "One of the first conditions of happiness is that the link between man and nature shall not be broken.", a: "Leo Tolstoy" }
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quoteData = ecoQuotes[dayOfYear % ecoQuotes.length];
  const quoteText = `"${quoteData.q}" — ${quoteData.a}`;

  const quoteBox = document.getElementById('eco-quote');
  if (quoteBox) {
    quoteBox.innerText = quoteText;
  }
});
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json(); // 💥 only works if response is JSON

    if (response.ok) {
      document.getElementById('errorMessage').textContent = 'Login successful! Redirecting...';
      setTimeout(() => {
        window.location.href = '/landing';
      }, 1000);
    } else {
      document.getElementById('errorMessage').textContent = data.error || 'Login failed.';
    }
  } catch (err) {
    document.getElementById('errorMessage').textContent = 'Server error. Try again later.';
    console.error('Login error:', err);
  }
});

// content.js - Injects CHAI verification status into LinkedIn profiles

async function fetchVerificationStatus(profileName) {
  try {
    const response = await fetch(`https://chai.example.com/verify?profile=${encodeURIComponent(profileName)}`);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    return data.verified;
  } catch (err) {
    console.error('Verification check failed:', err);
    return null;
  }
}

function insertStatus(status) {
  const container = document.createElement('div');
  container.style.fontWeight = 'bold';
  container.style.marginTop = '8px';
  if (status === true) {
    container.textContent = 'CHAI Verified';
    container.style.color = 'green';
  } else if (status === false) {
    container.textContent = 'Not CHAI Verified';
    container.style.color = 'red';
  } else {
    container.textContent = 'CHAI verification unavailable';
    container.style.color = 'gray';
  }
  const anchor = document.querySelector('.pv-top-card');
  if (anchor) {
    anchor.appendChild(container);
  }
}

function getProfileName() {
  const element = document.querySelector('h1');
  return element ? element.textContent.trim() : null;
}

document.addEventListener('DOMContentLoaded', async () => {
  const profileName = getProfileName();
  if (!profileName) return;
  const status = await fetchVerificationStatus(profileName);
  insertStatus(status);
});

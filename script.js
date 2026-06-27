const STORAGE_KEY = 'maincraft_submissions';

function getSubmissions() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

function saveSubmissions(list) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addSubmission(entry) {
	const list = getSubmissions();
	list.push(entry);
	saveSubmissions(list);
}

function formatDate(ts) {
	const d = new Date(ts);
	return d.toLocaleString();
}

function renderSubmissions() {
	const container = document.getElementById('submissionsList');
	if (!container) return;
	const list = getSubmissions();
	if (list.length === 0) {
		container.innerHTML = '<p>No submissions yet.</p>';
		return;
	}

	container.innerHTML = '';
	list.slice().reverse().forEach((item, idx) => {
		const el = document.createElement('div');
		el.className = 'submission';
		el.innerHTML = `
			<div class="submission-header">
				<strong>${escapeHtml(item.name)}</strong>
				<span class="muted">${formatDate(item.timestamp)}</span>
			</div>
			<div class="submission-email">${escapeHtml(item.email)}</div>
			<p class="submission-message">${escapeHtml(item.message)}</p>
		`;
		container.appendChild(el);
	});
}

function escapeHtml(str) {
	if (!str) return '';
	return str.replace(/[&<>\"']/g, function (c) {
		return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contactForm');
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const name = (document.getElementById('name').value || '').trim();
			const email = (document.getElementById('email').value || '').trim();
			const message = (document.getElementById('message').value || '').trim();
			const msgEl = document.getElementById('formMessage');
			const submitBtn = form.querySelector('button[type="submit"]');

			// simple validation
			if (!name || !email || !message) {
				msgEl.classList.remove('hidden');
				msgEl.textContent = 'Please fill in all fields.';
				msgEl.classList.add('error');
				showToast('Please complete all fields', true);
				return;
			}

			// basic email check
			const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRe.test(email)) {
				msgEl.classList.remove('hidden');
				msgEl.textContent = 'Please enter a valid email address.';
				msgEl.classList.add('error');
				showToast('Invalid email address', true);
				return;
			}

			const entry = { name, email, message, timestamp: Date.now() };
			// UX: disable button briefly while saving
			if (submitBtn) submitBtn.disabled = true;
			try {
				addSubmission(entry);
				msgEl.classList.remove('hidden');
				msgEl.classList.remove('error');
				msgEl.textContent = 'Submission saved locally. Thank you!';
				showToast('Saved — view on Submissions page');
				form.reset();
			} finally {
				if (submitBtn) setTimeout(() => submitBtn.disabled = false, 350);
			}
		});
	}

	const submissionsContainer = document.getElementById('submissionsList');
	if (submissionsContainer) {
		renderSubmissions();
		const clearBtn = document.getElementById('clearAll');
		if (clearBtn) {
			clearBtn.addEventListener('click', () => {
				if (!confirm('Clear all saved submissions?')) return;
				localStorage.removeItem(STORAGE_KEY);
				renderSubmissions();
			});
		}
	}
});

// small toast utility
function showToast(text, isError) {
	let t = document.createElement('div');
	t.className = 'toast';
	if (isError) t.style.background = '#b91c1c';
	t.textContent = text;
	document.body.appendChild(t);
	// force reflow for animation
	void t.offsetWidth;
	t.classList.add('show');
	setTimeout(() => { t.classList.remove('show'); t.addEventListener('transitionend', () => t.remove()); }, 3500);
}


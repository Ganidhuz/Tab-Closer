// Save a new keyword
function addKeyword() {
  const input = document.getElementById('keyword-input');
  const keyword = input.value.trim();

  if (!keyword) return;

  chrome.storage.sync.get(['keywords'], function(result) {
    const keywords = result.keywords || [];
    
    // Avoid duplicates
    if (!keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
      keywords.push(keyword);
      
      chrome.storage.sync.set({ keywords: keywords }, function() {
        displayKeywords(keywords);
        input.value = '';
        showStatus('Keyword added.');
      });
    } else {
        showStatus('Keyword already exists.');
    }
  });
}

// Remove a keyword
function removeKeyword(keywordToRemove) {
  chrome.storage.sync.get(['keywords'], function(result) {
    let keywords = result.keywords || [];
    keywords = keywords.filter(k => k !== keywordToRemove);

    chrome.storage.sync.set({ keywords: keywords }, function() {
      displayKeywords(keywords);
      showStatus('Keyword removed.');
    });
  });
}

// Theme Management
function setTheme(theme) {
  const html = document.documentElement;
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  if (theme === 'dark') {
    html.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
  chrome.storage.sync.set({ theme: theme });
}

function toggleTheme() {
  chrome.storage.sync.get(['theme'], function(result) {
    const currentTheme = result.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

// Render the list of keywords using Shadcn-style badges
function displayKeywords(keywords) {
  const list = document.getElementById('keyword-list');
  const emptyState = document.getElementById('empty-state');
  list.innerHTML = '';

  if (keywords.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  keywords.forEach(keyword => {
    // Badge Container
    const badge = document.createElement('div');
    badge.className = 'badge flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-default';
    
    // Keyword Text
    const text = document.createElement('span');
    text.textContent = keyword;
    text.className = 'text-sm font-medium';
    
    // Remove Button (Small X)
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `
      <svg class="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    removeBtn.className = 'flex items-center justify-center p-0.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors';
    removeBtn.onclick = function() {
      removeKeyword(keyword);
    };

    badge.appendChild(text);
    badge.appendChild(removeBtn);
    list.appendChild(badge);
  });
}

// Show a status message
function showStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  setTimeout(() => {
    status.textContent = '';
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Load keywords
  chrome.storage.sync.get(['keywords', 'theme'], function(result) {
    displayKeywords(result.keywords || []);
    // Initialize theme
    if (result.theme) {
      setTheme(result.theme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  });

  document.getElementById('add-btn').addEventListener('click', addKeyword);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Allow pressing Enter to add
  document.getElementById('keyword-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addKeyword();
    }
  });
});

/**
 * Hyeswin Singisetty - Portfolio Application Engine
 * Vanilla JavaScript
 */

// --- LOCALSTORAGE KEYS FOR CLIENT PREFERENCES ---
const STORAGE_KEYS = {
  BOOKMARKS: 'hyeswin_portfolio_bookmarks',
  VISITOR_LOG: 'hyeswin_visitor_count'
};

const PERSONAL_EMAIL = 'hyeswinsingisetty2612@gmail.com';
const INSTITUTE_EMAIL = 'b26ee029@iitbhilai.ac.in';

let currentFilter = 'all';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Ensure the page always starts at the top on initial load / refresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Record visitor visit
  incrementVisitorCount();

  // Setup components
  initNavigation();
  initProjectFiltering();
  initProjectBookmarks();
  initTerminal();
  initContactForm();
  initCopyButtons();

  // Low-lying responsive scroll animations & visual hooks
  initScrollProgress();
  initScrollReveal();
  initCardSpotlight();
  initBackToTop();
});

// Extra safeguard to guarantee scroll resets to top after layout paint
window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

// --- LOCALSTORAGE UTILITIES ---
function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

function incrementVisitorCount() {
  const count = (getStoredData(STORAGE_KEYS.VISITOR_LOG, 0) || 0) + 1;
  setStoredData(STORAGE_KEYS.VISITOR_LOG, count);
  const visitorBadge = document.getElementById('visitor-count-badge');
  if (visitorBadge) {
    visitorBadge.textContent = count;
  }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    info: 'bg-slate-900 border-sky-500 text-sky-200',
    success: 'bg-slate-900 border-emerald-500 text-emerald-200',
    warning: 'bg-slate-900 border-amber-500 text-amber-200',
    error: 'bg-slate-900 border-rose-500 text-rose-200'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm transition-all duration-300 transform translate-y-4 opacity-0 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span class="inline-block w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : type === 'warning' ? 'bg-amber-400' : type === 'error' ? 'bg-rose-400' : 'bg-sky-400'}"></span>
    <p class="font-medium">${message}</p>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 4000);
  }, 4000);
}

// --- NAVIGATION & BUTTER-SMOOTH SCROLLING ---
function initNavigation() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close on clicking mobile links
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Smooth scroll handler for all internal anchor links with sticky header offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight + 16 : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // High-performance requestAnimationFrame scroll spy
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight + 50 : 110;

        sections.forEach(current => {
          const sectionHeight = current.offsetHeight;
          const sectionTop = current.offsetTop - headerOffset;
          const sectionId = current.getAttribute('id');
          const matchingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('text-sky-400', 'font-semibold'));
            if (matchingLink) {
              matchingLink.classList.add('text-sky-400', 'font-semibold');
            }
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// --- PROJECT FILTERING & BOOKMARKS ---
function initProjectFiltering() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');
        b.classList.add('bg-slate-800/60', 'text-slate-400', 'border-slate-700/60');
      });

      btn.classList.add('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');
      btn.classList.remove('bg-slate-800/60', 'text-slate-400', 'border-slate-700/60');

      const filter = btn.getAttribute('data-filter');
      currentFilter = filter;

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

function initProjectBookmarks() {
  const bookmarks = getStoredData(STORAGE_KEYS.BOOKMARKS, []);
  
  // Set initial state
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const projectId = btn.getAttribute('data-project');
    if (bookmarks.includes(projectId)) {
      btn.classList.add('text-amber-400');
      btn.innerHTML = `<i data-lucide="bookmark-check" class="w-4 h-4 text-amber-400 fill-amber-400"></i>`;
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let currentBookmarks = getStoredData(STORAGE_KEYS.BOOKMARKS, []);
      if (currentBookmarks.includes(projectId)) {
        currentBookmarks = currentBookmarks.filter(id => id !== projectId);
        btn.classList.remove('text-amber-400');
        btn.innerHTML = `<i data-lucide="bookmark" class="w-4 h-4"></i>`;
        showToast(`Removed from saved projects`, 'info');
      } else {
        currentBookmarks.push(projectId);
        btn.classList.add('text-amber-400');
        btn.innerHTML = `<i data-lucide="bookmark-check" class="w-4 h-4 text-amber-400 fill-amber-400"></i>`;
        showToast(`Saved to bookmarked projects`, 'success');
      }
      setStoredData(STORAGE_KEYS.BOOKMARKS, currentBookmarks);
      if (window.lucide) lucide.createIcons();
    });
  });
}

// --- INTERACTIVE TERMINAL UI ---
function initTerminal() {
  const terminalInput = document.getElementById('terminal-cli-input');
  const terminalOutput = document.getElementById('terminal-cli-output');
  if (!terminalInput || !terminalOutput) return;

  const history = [];
  let historyIdx = -1;

  const COMMANDS = {
    help: () => `
<span class="text-sky-300 font-bold">AVAILABLE COMMANDS:</span>
  <span class="text-amber-300">whoami</span>       - High level bio & background
  <span class="text-amber-300">projects</span>     - List all showcased Web3, IoT & Software projects
  <span class="text-amber-300">skills</span>       - Core languages, databases & developer toolchain
  <span class="text-amber-300">clubs</span>        - Campus leadership, E-Cell & Electromos roles
  <span class="text-amber-300">bizzaro</span>      - Big-O Anti-Impulse Wallet pitch summary
  <span class="text-amber-300">contact</span>      - Direct communication channels & email
  <span class="text-amber-300">email</span>        - Quick copy personal & institute mail
  <span class="text-amber-300">stats</span>        - Local session visits & saved bookmarks
  <span class="text-amber-300">clear</span>        - Clear terminal history
    `,
    whoami: () => `
<span class="text-emerald-400 font-bold">Hyeswin Singisetty</span>
&bull; B.Tech Electrical Engineering undergrad @ Indian Institute of Technology (IIT) Bhilai
&bull; Origin: Bengaluru, Karnataka
&bull; Passions: Machine Learning, Data Analytics, embedded systems, UEFA Champions League
&bull; Tagline: Exploring Machine Learning and Data analytics
    `,
    projects: () => `
<span class="text-sky-300 font-bold">CORE PROJECTS:</span>
1. <span class="text-white font-semibold">ClubTreasury DAO</span> (DAO Treasury Governance)
   Live: <a href="https://hyeswin1.github.io/ClubTreasury/" target="_blank" class="underline text-sky-400">https://hyeswin1.github.io/ClubTreasury/</a>
2. <span class="text-white font-semibold">EduFund</span> (Decentralized Escrow Crowdfunding)
   Live: <a href="https://hyeswin1.github.io/EduFund/" target="_blank" class="underline text-sky-400">https://hyeswin1.github.io/EduFund/</a>
3. <span class="text-white font-semibold">AuditLog</span> (Immutable Security Trail)
   Live: <a href="https://hyeswin1.github.io/AuditLog/" target="_blank" class="underline text-sky-400">https://hyeswin1.github.io/AuditLog/</a>
4. <span class="text-white font-semibold">Dual-Axis Solar Tracker</span> (Electromos Hardware Prototyping)
   LDR Array + Microcontroller + Dual Servo Azimuth/Elevation
5. <span class="text-white font-semibold">DailyGoals</span> (Personal Workflow & Habit Tracker)
   Live: <a href="https://hyeswin1.github.io/DailyGoals/" target="_blank" class="underline text-sky-400">https://hyeswin1.github.io/DailyGoals/</a>
    `,
    skills: () => `
<span class="text-sky-300 font-bold">CORE COMPETENCIES:</span>
&bull; <span class="text-amber-300">Programming Languages:</span> C, C++, Python, Java
&bull; <span class="text-amber-300">Databases & Data:</span> MySQL, NumPy, Data Analytics
&bull; <span class="text-amber-300">Developer Toolchain:</span> VS Code, Git, Google Antigravity
    `,
    clubs: () => `
<span class="text-sky-300 font-bold">LEADERSHIP & CAMPUS INVOLVEMENT:</span>
&bull; <span class="text-emerald-400">E-Cell IIT Bhilai:</span> Management & Events team. Volunteered in managing Deal or No Deal Event in Meraz Fest.
&bull; <span class="text-emerald-400">SETU Club:</span> Mental Wellness Club of IIT Bhilai. Volunteered for Suicide Prevention Day Slogan Writing.
&bull; <span class="text-emerald-400">Electromos:</span> Electronics Club active member (Dual-Axis Solar Tracker).
&bull; <span class="text-emerald-400">Blockchain at IIT Bhilai (BIB):</span> Campus student developer & research.
&bull; <span class="text-emerald-400">Competitions:</span> VibeChain Live Chain Coding, Smart Contract Vulnerability Discovery (Meraz 7.0), Bizzaro Sales Pitching.
    `,
    bizzaro: () => `
<span class="text-amber-300 font-bold">BIG-O ANTI-IMPULSE WALLET (Bizzaro Pitch Architecture):</span>
&bull; <span class="text-white">The Problem:</span> Frictionless tap-to-pay and one-click buying trigger chronic impulse purchases.
&bull; <span class="text-white">Impact & Solution:</span> Injects deliberate algorithmic friction. Halts emotional spending and sharpens Big-O CS analysis daily.
&bull; <span class="text-white">Hardware:</span> Arduino Nano + micro-servo mechanical lock + E-ink display + D-pad. Correct Big-O time complexity unlocks card; wrong triggers an exponential O(2ⁿ) penalty timer!
    `,
    contact: () => `
<span class="text-sky-300 font-bold">CHANNELS:</span>
&bull; Personal Mail : <span class="text-emerald-300">${PERSONAL_EMAIL}</span>
&bull; Institute Mail: <span class="text-emerald-300">${INSTITUTE_EMAIL}</span>
&bull; GitHub        : <a href="https://github.com/hyeswin1" target="_blank" class="underline text-sky-400">https://github.com/hyeswin1</a>
&bull; LinkedIn      : <a href="https://www.linkedin.com/in/hyeswin-singisetty-445369370/" target="_blank" class="underline text-sky-400">LinkedIn Profile</a>
&bull; Instagram     : <a href="https://www.instagram.com/hyeswin1/" target="_blank" class="underline text-sky-400">@hyeswin1</a>
    `,
    email: () => {
      navigator.clipboard.writeText(PERSONAL_EMAIL);
      return `<span class="text-emerald-400">✓ Copied ${PERSONAL_EMAIL} to clipboard!</span>`;
    },
    stats: () => {
      const visits = getStoredData(STORAGE_KEYS.VISITOR_LOG, 1);
      const bookmarks = getStoredData(STORAGE_KEYS.BOOKMARKS, []).length;
      return `
<span class="text-sky-300 font-bold">SESSION STATS:</span>
&bull; Portfolio Visits: ${visits}
&bull; Bookmarks saved: ${bookmarks}
      `;
    },
    clear: () => {
      terminalOutput.innerHTML = '';
      return '';
    }
  };

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const inputVal = terminalInput.value.trim().toLowerCase();
      if (!inputVal) return;

      history.push(inputVal);
      historyIdx = history.length;

      // Print prompt and command
      const cmdLine = document.createElement('div');
      cmdLine.className = 'flex items-center gap-2 mt-2';
      cmdLine.innerHTML = `
        <span class="text-emerald-400 font-bold">guest@hyeswin-portfolio</span><span class="text-slate-400">:</span><span class="text-sky-400">~</span><span class="text-slate-400">$</span>
        <span class="text-white">${terminalInput.value}</span>
      `;
      terminalOutput.appendChild(cmdLine);

      // Handle command
      const responseDiv = document.createElement('div');
      responseDiv.className = 'text-slate-300 pl-4 py-1 border-l border-slate-700/50 my-1 font-mono-code text-xs leading-relaxed';

      if (COMMANDS[inputVal]) {
        const result = COMMANDS[inputVal]();
        if (inputVal !== 'clear') {
          responseDiv.innerHTML = result;
          terminalOutput.appendChild(responseDiv);
        }
      } else {
        responseDiv.innerHTML = `<span class="text-rose-400">zsh: command not found: ${inputVal}.</span> Type <span class="text-amber-300 cursor-pointer font-bold underline" onclick="runCliCmd('help')">help</span> to view commands.`;
        terminalOutput.appendChild(responseDiv);
      }

      terminalInput.value = '';
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIdx > 0) {
        historyIdx--;
        terminalInput.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx < history.length - 1) {
        historyIdx++;
        terminalInput.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        terminalInput.value = '';
      }
    }
  });
}

function runCliCmd(cmd) {
  const terminalInput = document.getElementById('terminal-cli-input');
  if (terminalInput) {
    terminalInput.value = cmd;
    terminalInput.focus();
    terminalInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  }
}

// --- CONTACT FORM: DIRECT DELIVERY TO PERSONAL EMAIL ---
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim() || 'Portfolio Collaboration Inquiry';
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    // Construct formatted mailto body
    const formattedSubject = encodeURIComponent(`[Portfolio] ${subject} - ${name}`);
    const formattedBody = encodeURIComponent(
      `Hello Hyeswin,\n\n` +
      `You received a new message via your portfolio website:\n\n` +
      `----------------------------------------\n` +
      `Sender Name : ${name}\n` +
      `Sender Email: ${email}\n` +
      `Subject     : ${subject}\n` +
      `----------------------------------------\n\n` +
      `Message:\n${message}\n\n` +
      `----------------------------------------\n` +
      `Sent to: ${PERSONAL_EMAIL}`
    );

    const mailtoUrl = `mailto:${PERSONAL_EMAIL}?subject=${formattedSubject}&body=${formattedBody}`;

    // Launch email client to send to personal mail
    window.location.href = mailtoUrl;

    showToast(`Dispatching directly to ${PERSONAL_EMAIL}...`, 'success');
    form.reset();
  });
}

// --- EMAIL / CLIPBOARD UTILITIES ---
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`, 'success');
        }).catch(() => {
          showToast('Failed to copy. Please manually copy the address.', 'error');
        });
      }
    });
  });
}

// --- TOP SCROLL PROGRESS BAR ---
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.pageYOffset / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// --- INTERSECTION OBSERVER SCROLL REVEAL ---
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not available
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

// --- SUBTLE INTERACTIVE SPOTLIGHT ON GLASS CARDS ---
function initCardSpotlight() {
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', '-999px');
      card.style.setProperty('--mouse-y', '-999px');
    });
  });
}

// --- FLOATING BACK TO TOP BUTTON ---
function initBackToTop() {
  const btn = document.getElementById('scroll-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 380) {
      btn.classList.remove('opacity-0', 'translate-y-6', 'pointer-events-none');
      btn.classList.add('opacity-100', 'translate-y-0');
    } else {
      btn.classList.add('opacity-0', 'translate-y-6', 'pointer-events-none');
      btn.classList.remove('opacity-100', 'translate-y-0');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

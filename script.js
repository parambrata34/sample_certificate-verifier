document.addEventListener('DOMContentLoaded', () => {
  const verifyForm = document.getElementById('verify-form');
  const identifierInput = document.getElementById('identifier');
  const resultBox = document.getElementById('result');
  const spinner = document.querySelector('.spinner');
  const toast = document.getElementById('toast');
  const navLinks = document.querySelectorAll('.main-nav a');
  const contentSections = document.querySelectorAll('.content-section');
  const contactForm = document.getElementById('contact-form');

  const studentDatabase = {
    "john@example.com": {
      name: "John Doe",
      email: "john@example.com",
      mobile: "9876543210",
      domain: "Web Development",
      college: "Global Tech University",
      start: "01 June 2024",
      duration: "1 Month",
      photo: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      assignments: [true, true, true, true, true],
      certificate: "https://www.google.com/search?q=VaultofCodes+certificate+john+doe"
    },
    "jane.doe@email.com": {
      name: "Jane Doe",
      email: "jane.doe@email.com",
      mobile: "0123456789",
      domain: "Data Science",
      college: "City Polytechnic",
      start: "15 May 2024",
      duration: "2 Months",
      photo: "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      assignments: [true, false, true, false, true, false],
      certificate: null
    },
    "nonexistent@email.com": null
  };

  function showToast(msg, type = 'info') {
    toast.innerText = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.className = 'toast';
    }, 3500);
  }

  function showSpinner(show) {
    spinner.classList.toggle('hidden', !show);
  }

  function renderStudentCard(student) {
    const allAssignmentsCompleted = student.assignments.every(Boolean);
    const statusText = allAssignmentsCompleted ? 'Completed' : 'In Progress';
    const statusEmoji = allAssignmentsCompleted ? '🎓' : '📚';

    const assignmentHtml = student.assignments.map((done, i) => `
      <span class="${done ? 'completed' : 'pending'}">A${i + 1}: ${done ? '✅' : '❌'}</span>
    `).join('');

    const certificateLinkHtml = student.certificate !== null ?
      `<a href="${student.certificate}" target="_blank" rel="noopener noreferrer">View Certificate <i class="fas fa-external-link-alt"></i></a>` :
      `<p class="no-certificate">Certificate not yet issued ⏳</p>`;

    const html = `
      <div class="card student-data">
        <img src="${student.photo}" alt="${student.name}'s Photo" />
        <h3>${student.name}</h3>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Mobile:</strong> ${student.mobile}</p>
        <p><strong>Domain:</strong> ${student.domain}</p>
        <p><strong>College:</strong> ${student.college}</p>
        <p><strong>Start Date:</strong> ${student.start}</p>
        <p><strong>Duration:</strong> ${student.duration}</p>
        <h4>${statusEmoji} Assignment Status</h4>
        <div class="assignment-status">
          ${assignmentHtml}
        </div>
        <p><strong>Overall Status:</strong> ${statusText}</p>
        ${certificateLinkHtml}
      </div>
    `;
    resultBox.innerHTML = html;
  }

  function renderNoResultCard(type, identifierOrName) {
    let title = '';
    let message = '';
    let icon = '';
    let buttonText = 'Try Another Search';

    if (type === 'notFound') {
      icon = '<i class="fas fa-frown icon-large"></i>';
      title = 'Student Not Found';
      message = `No record found for "<strong>${identifierOrName}</strong>". Please double-check the entered ID or email and try again.`;
    } else if (type === 'noCertificate') {
      icon = '<i class="fas fa-hourglass-half icon-large"></i>';
      title = 'Certificate Not Ready Yet';
      message = `We found a record for "<strong>${identifierOrName}</strong>", but their certificate is not yet issued or is still in progress. Please check back later or contact support for more details.`;
      buttonText = 'Search Again';
    }

    const html = `
      <div class="card no-result">
        ${icon}
        <h3>${title}</h3>
        <p>${message}</p>
        <a href="#" onclick="document.getElementById('identifier').focus(); return false;" class="btn-retry">${buttonText}</a>
      </div>
    `;
    resultBox.innerHTML = html;
  }

  async function fetchStudentData(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const student = studentDatabase[id.toLowerCase()];
        if (student === undefined || student === null) {
          resolve(null);
        } else {
          resolve(student);
        }
      }, 1500);
    });
  }

  async function verifyStudent(e) {
    e.preventDefault();
    const identifier = identifierInput.value.trim();
    resultBox.innerHTML = '';

    if (!identifier) {
      showToast('❗ Please enter a student email or ID to verify.', 'error');
      return;
    }

    showSpinner(true);
    try {
      const student = await fetchStudentData(identifier);

      if (student === null) {
        renderNoResultCard('notFound', identifier);
        showToast('⚠️ No student found with that identifier.', 'warning');
      } else if (student.certificate === null) {
        renderNoResultCard('noCertificate', student.email || student.name || identifier);
        showToast('⏳ Student found, but certificate not yet issued.', 'info');
      } else {
        renderStudentCard(student);
        showToast('✅ Student data loaded successfully!', 'success');
      }
    } catch (error) {
      console.error("Verification failed:", error);
      showToast('❌ An error occurred during verification. Please try again.', 'error');
      resultBox.innerHTML = `
        <div class="card no-result">
          <i class="fas fa-exclamation-triangle icon-large"></i>
          <h3>Verification Error</h3>
          <p>Something went wrong on our end. Please try again later.</p>
          <a href="#" onclick="document.getElementById('identifier').focus(); return false;" class="btn-retry">Try Again</a>
        </div>
      `;
    } finally {
      showSpinner(false);
    }
  }

  function handleNavClick(e) {
    e.preventDefault();
    const targetSectionId = e.target.dataset.section + '-section';

    contentSections.forEach(section => section.classList.add('hidden'));

    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      if (targetSectionId === 'verifier-section') {
        resultBox.innerHTML = '';
        identifierInput.value = '';
      }
    }

    navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    showToast('✉️ Message sent! We will get back to you soon.', 'success');
    contactForm.reset();
  }

  verifyForm.addEventListener('submit', verifyStudent);
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });
  contactForm.addEventListener('submit', handleContactSubmit);
});

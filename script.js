const startBtn = document.querySelector('.start-btn');
const loginInfo = document.querySelector('#loginPage');
const mainInfo = document.querySelector('.container');
const contactInfo = document.querySelector('#contactPage');
const studyInfo = document.querySelector('#studyPage');
const loginBtn = document.querySelector('.login-btn');
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const studyForm = document.getElementById("study-form");
const schedulePage = document.getElementById("schedulePage");
const scheduleOutput = document.getElementById("scheduleOutput");
const homeLink = document.getElementById("homeLink");
const contactLink = document.getElementById("contactLink");
const logoLink = document.getElementById("logo");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const addBtn = document.querySelector(".add-btn");
const sendBtn = document.querySelector("#send-btn");

// Helper functions
function hideAll() {
  mainInfo.classList.remove("active");
  loginInfo.classList.remove("active");
  studyInfo.classList.remove("active");
  schedulePage.classList.remove("active");
  contactInfo.classList.remove("active");
}
function showSection(section) {
  hideAll();
  section.classList.add("active");
}

// Navigation
if(contactLink) {
    contactLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(contactInfo);
    });
}
if(homeLink) {
    homeLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(mainInfo);
    });
}
if(logoLink) {
    logoLink.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(mainInfo);
    });
}

//Contact
sendBtn.addEventListener("click", () => {
    alert("Message sent successfully!");
});

// Start → login
startBtn.addEventListener("click", () => {
  showSection(loginInfo);
});

// Login
loginBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password) {
    alert("⚠️ Fill both Username and Password.");
    return;
  }
  localStorage.setItem("currentUser", username);
  showSection(studyInfo);
  // 🔔 Ask for notification permission here
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});
const subjectsContainer = document.getElementById("subjects-container");

addBtn.addEventListener("click", () => {
    const newPlan = document.createElement("div");
    newPlan.classList.add("subject-group");
    newPlan.innerHTML = `
        <div class="input-box1">
            <label>Subject</label>
            <input type="text" name="subject" placeholder="eg., Science" required>
        </div>
        <div class="input-box1">
            <label>Start Date</label>
            <input type="date" name="sdate" required>
        </div>
        <div class="input-box1">
            <label>End Date</label>
            <input type="date" name="edate" required>
        </div>
        <div class="input-box1">
            <label>Start Time</label>
            <input type="time" name="stime" required>
        </div>
        <div class="input-box1">
            <label>End Time</label>
            <input type="time" name="etime" required>
        </div>
        <button class="remove-subject-btn">Remove Subject</button>
        <hr>
    `;
    subjectsContainer.appendChild(newPlan);
    // Attach remove functionality
    newPlan.querySelector(".remove-subject-btn").addEventListener("click", () => {
        newPlan.remove();
    });
});

// Study form → Generate schedule
studyForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const goal = document.getElementById("goal").value.trim();

    // Collect all subject groups
    const subjectGroups = document.querySelectorAll(".subject-group");

    let tilesHTML = `<p><b>Name:</b> ${name}</p>
                     <p><b>Goal:</b> ${goal}</p>`;

    subjectGroups.forEach(group => {
        const subject = group.querySelector('input[name="subject"]')?.value.trim();
        const sdateValue = new Date(group.querySelector('input[name="sdate"]').value);
        const edateValue = new Date(group.querySelector('input[name="edate"]').value);
        const stime = group.querySelector('input[name="stime"]').value;
        const etime = group.querySelector('input[name="etime"]').value;

        if (!subject || !sdateValue || !edateValue || !stime || !etime) return;
        const sdate = new Date(sdateValue);
        const edate = new Date(edateValue);

        tilesHTML += `<p><b>Subject:</b> ${subject}</p>
                      <div class="schedule-tiles">`;

        let currentDate = new Date(sdate);
        while (currentDate <= edate) {
            const dateStr = currentDate.toDateString();
            const taskId = `${subject}-${dateStr}-${stime}-${etime}`;
            const isCompleted = localStorage.getItem(taskId) === "true";

            tilesHTML += `
            <div class="tile ${isCompleted ? "completed" : ""}">
                <span>${subject}</span><br>
                <span>${dateStr}<br>${stime} - ${etime}</span>
                <button onclick="markComplete('${taskId}', this)" ${isCompleted ? "disabled" : ""}>
                ${isCompleted ? "✔ Completed" : "Mark as Complete"}
                </button>
            </div>
            `;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        tilesHTML += "</div>";
  });
  scheduleOutput.innerHTML = tilesHTML;
  // now loop again to set reminders
  subjectGroups.forEach(group => {
      const subject = group.querySelector('input[name="subject"]')?.value.trim();
      const sdateValue = new Date(group.querySelector('input[name="sdate"]').value);
      const edateValue = new Date(group.querySelector('input[name="edate"]').value);
      const stime = group.querySelector('input[name="stime"]').value;
      const etime = group.querySelector('input[name="etime"]').value;

      if (!subject || !sdateValue || !edateValue || !stime || !etime) return;

      let currentDate = new Date(sdateValue);
      while (currentDate <= edateValue) {
          const dateStr = currentDate.toDateString();
          const taskId = `${subject}-${dateStr}-${stime}-${etime}`;

          // calculate reminder time (5 min before start time)
          const reminderTime = new Date(`${dateStr} ${stime}`).getTime() - 5 * 60 * 1000;
          const now = Date.now();

          if (reminderTime > now) {
              const delay = reminderTime - now;
              setTimeout(() => {
                  alert(`Reminder: ${subject} study starts in 5 minutes!`);

                  if ("Notification" in window && Notification.permission === "granted") {
                      new Notification("Study Reminder", {
                          body: `${subject} study starts in 5 minutes!`,
                          icon: "https://cdn-icons-png.flaticon.com/512/2942/2942076.png"
                      });
                  }
              }, delay);
          }

          currentDate.setDate(currentDate.getDate() + 1);
      }
  });
  updateProgress();
  showSection(schedulePage);
});

// Mark complete
function markComplete(taskId, btn) {
  localStorage.setItem(taskId, "true");
  btn.innerText = "✔ Completed";
  btn.disabled = true;
  btn.parentElement.classList.add("completed");
  updateProgress();
}

// Update progress bar
function updateProgress() {
  const tiles = document.querySelectorAll(".tile");
  const completed = document.querySelectorAll(".tile.completed");
  const total = tiles.length;
  const done = completed.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.innerText = `${percent}% Completed`;
}

// Back
function goBack() {
  showSection(studyInfo);
}
function goHome() {
  showSection(mainInfo);
}

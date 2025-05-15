(async () => {
  fetch('/api/status')
    .then(res => res.json())
    .then(data => {
      if (data.status && data.result) {
        document.getElementById("total-endpoint").textContent = data.result.totalfitur || 'N/A';
        document.getElementById("total-api").textContent = data.result.totalfitur || 'N/A';
        document.getElementById("total-users").textContent = data.result.totaluser || 'N/A';
        document.getElementById("today-requests").textContent = data.result.todayreq || 'N/A';
        document.getElementById("requests-per-day").textContent = data.result.reqperday || 'N/A';
        document.getElementById("total-requests").textContent = data.result.totalreq || 'N/A';
        document.getElementById("avg-response").textContent = data.result.avgresponse || 'N/A';
        document.getElementById("success-rate").textContent = data.result.successrate || 'N/A';
        document.getElementById("error-rate").textContent = data.result.errorrate || 'N/A';
      } else {
        document.querySelectorAll('.stat-card h2').forEach(el => el.textContent = 'N/A');
      }
    })
    .catch(err => {
      console.error('Gagal mengambil data:', err);
      document.querySelectorAll('.stat-card h2').forEach(el => el.textContent = 'Error');
    });

  // Baterai
  navigator.getBattery().then(function(battery) {
    function updateBatteryStatus() {
      document.getElementById("battery-level").textContent = Math.round(battery.level * 100) + "%";
    }
    updateBatteryStatus();
    battery.addEventListener("levelchange", updateBatteryStatus);
  });

  // Waktu WIB
  function updateTime() {
    const now = new Date();
    const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const hours = String(wib.getUTCHours()).padStart(2, '0');
    const minutes = String(wib.getUTCMinutes()).padStart(2, '0');
    const seconds = String(wib.getUTCSeconds()).padStart(2, '0');
    document.getElementById("time-wib").textContent = `${hours}:${minutes}:${seconds}`;
  }
  setInterval(updateTime, 1000);
  updateTime();
  })()
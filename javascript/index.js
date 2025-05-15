  (async () => {
  const settings = await fetch("/settings.json").then(res => res.json());
  
  document.getElementById("icon").href = settings.favicon
  const head = document.head;
  
  const ogTags = [
        { property: 'og:title', content: settings.apititle },
        { property: 'og:description', content: "Simple API with easy and minimalistic integration for WhatsApp Bot Developers." },
        { property: 'og:image', content: settings.favicon },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'website' }
      ];
      
  ogTags.forEach(({ property, content }) => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        head.appendChild(meta);
      });
  
  })()
  
    document.addEventListener('DOMContentLoaded', function() {
      // Hide the main content initially
      document.querySelector('.container').style.display = 'none';
      document.querySelector('footer').style.display = 'none';
      
      // Load settings and then hide loading screen
      loadSettings().then(() => {
        setTimeout(() => {
          document.getElementById('loading-screen').style.opacity = '0';
          setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.querySelector('.container').style.display = 'block';
            document.querySelector('footer').style.display = 'block';
          }, 500);
        }, 1000);
      });
    });

    async function loadSettings() {
      const tabsContainer = document.getElementById("tabs");
      const apiList = document.getElementById("api-list");
      let currentEndpoint = "";

      const settings = await fetch("/settings.json").then(res => res.json());
      const apis = await fetch("/endpoints.json").then(res => res.json());

      const setContent = (id, property, value) => {
        const el = document.getElementById(id);
        if (el) el[property] = value;
      };

      setContent("page", "textContent", "Docs - " + settings.apititle || "Docs - Lyse API");
      setContent("credits", "textContent", `© ${new Date().getFullYear()} Powered by ${settings.creator || "Luoyisse"}`);
      setContent("apiTitle", "textContent", settings.apititle || "Lyse API");

      document.getElementById("githubLink").href = settings.github || "#";
      document.getElementById("whatsappLink").href = settings.whatsapp || "#";
      document.getElementById("information").href = settings.saluran || "#";
      document.getElementById("contactdev").href = settings.whatsapp || "#";

      // Create tabs
      Object.keys(apis).forEach((key, index) => {
        const button = document.createElement("button");
        button.className = `tab ${index === 0 ? "active" : ""}`;
        button.dataset.tab = key;
        button.innerText = key.charAt(0).toUpperCase() + key.slice(1);
        tabsContainer.appendChild(button);
      });

      // Render API cards
      function renderAPIs(category) {
        apiList.innerHTML = "";
        apis[category].sort((a, b) => a.name.localeCompare(b.name)).forEach((api, i) => {
          const card = document.createElement("div");
          card.className = "api-card";
          
          
          // Determine status class
          let statusClass = "";
          if (api.status.toLowerCase().includes("maintenance")) statusClass = "danger";
          else if (api.status.toLowerCase().includes("beta")) statusClass = "warning";
          else statusClass = "";
          
          card.innerHTML = `
            <div class="api-info">
              <h3>${api.name}</h3>
              ${api.desc ? `<p>${api.desc}</p>` : "" }
              <span class="status ${statusClass}">${api.status}</span>
            </div>
            <button class="play-button" data-endpoint="${api.path}" data-api="${api.name}" data-desc="${api.desc}">
              <i class="fa-solid fa-play"></i> Try API
            </button>
          `;
          apiList.appendChild(card);
          
          // Trigger reflow to restart animation
          setTimeout(() => {
            card.style.animation = `cardEntrance 0.6s ease-out ${i * 0.1}s forwards`;
          }, 10);
        });
      }

      // Initial render
      renderAPIs(Object.keys(apis)[0]);

      // Tab click event
      tabsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab")) {
          document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
          e.target.classList.add("active");
          renderAPIs(e.target.dataset.tab);
        }
      });

      // Event listeners
      document.addEventListener("click", (e) => {
        // Play button click
        if (e.target.closest(".play-button")) {
          const btn = e.target.closest(".play-button");
          const endpoint = btn.getAttribute("data-endpoint");
          const api = btn.getAttribute("data-api");
          const desc = btn.getAttribute("data-desc");

          const paramForm = document.getElementById("paramForm");
          const submitBtn = document.getElementById("submitParamBtn");
          const modal = document.getElementById("apiResponseModal");

          // Reset modal state
          document.getElementById("apiResponseContent").textContent = "";
          document.getElementById("apiResponseContent").classList.add("d-none");
          document.getElementById("apiResponseLoading").style.display = "none";
          paramForm.style.display = "block";
          submitBtn.style.display = "none";

          currentEndpoint = endpoint;
          paramForm.innerHTML = "";

          document.querySelector(".modal-dialog h5").innerText = api;
          document.querySelector(".modal-dialog span").innerText = desc;

          // Check if endpoint has parameters
          if (endpoint.includes("?")) {
            const queryParams = endpoint.split("?")[1].split("&");

            queryParams.forEach(param => {
              const [key, value] = param.split("=");
              paramForm.innerHTML += `
                <input type="text" id="${key}" name="${key}" value="${value || ''}" 
                       placeholder="Enter ${key}" required />
              `;
            });

            submitBtn.style.display = "block";
          } else {
            // If no parameters, fetch immediately
            fetchAPI(endpoint);
          }
          
          modal.classList.add("active");
          document.querySelector(".copy-section").classList.add("active");
          document.getElementById("copyEndpointText").innerText = window.location.origin + endpoint;
        }
        

        // Copy button click
        if (e.target.closest(".copy-button")) {
          const textToCopy = document.getElementById("copyEndpointText").innerText;
          navigator.clipboard.writeText(textToCopy).then(() => {
            const copyBtn = e.target.closest(".copy-button");
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
          });
        }
        
        // Close modal
        if (e.target.id === "btn-close" || e.target === document.getElementById("apiResponseModal")) {
          document.getElementById("apiResponseModal").classList.remove("active");
        }
      });

      // Submit parameters
      document.getElementById("submitParamBtn").addEventListener("click", () => {
        const form = document.getElementById("paramForm");
        const submitBtn = document.getElementById("submitParamBtn");
        
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        form.style.display = "none";
        submitBtn.style.display = "none";
        document.getElementById("apiResponseLoading").style.display = "block";
        
        let endpoint = currentEndpoint.split("?")[0] + "?";
        const inputs = form.querySelectorAll("input");
        
        inputs.forEach((input, index) => {
          endpoint += `${input.name}=${encodeURIComponent(input.value)}`;
          if (index < inputs.length - 1) endpoint += "&";
        });
        
        fetchAPI(endpoint);
      });
    }    

function fetchAPI(endpoint) {
  const fullURL = window.location.origin + endpoint;
  const responseEl = document.getElementById("apiResponseContent");
  const loadingEl = document.getElementById("apiResponseLoading");
  const urlsSection = document.querySelector(".copy-section");
  const modal = document.getElementById("apiResponseModal");
    const toggleBtn = document.getElementById('colorToggleBtn');
  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('btn-white');
    toggleBtn.classList.toggle('btn-black');
  });

  // Show loading state
  paramForm.style.display = "none";
  document.getElementById("submitParamBtn").style.display = "none";
  loadingEl.style.display = "block";
  responseEl.classList.add("d-none");
  responseEl.innerHTML = "";
  urlsSection.classList.add("active");
  document.getElementById("copyEndpointText").innerText = fullURL;

  fetch(fullURL)
    .then(async (res) => {
      loadingEl.style.display = "none";
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        responseEl.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      } 
      else if (contentType && contentType.startsWith("image/")) {
        const blob = await res.blob();
        const imgUrl = URL.createObjectURL(blob);
        responseEl.innerHTML = `<img src="${imgUrl}" class="image-response" alt="API Response" />`;
      } 
      else if (contentType && contentType.startsWith("video/")) {
        const blob = await res.blob();
        const videoUrl = URL.createObjectURL(blob);
        responseEl.innerHTML = `
          <video controls class="video-response" autoplay>
            <source src="${videoUrl}" type="${contentType}">
            Your browser does not support the video tag.
          </video>
        `;
      }
      else if (contentType && contentType.startsWith("audio/")) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        responseEl.innerHTML = `
          <audio controls class="audio-response" autoplay>
            <source src="${audioUrl}" type="${contentType}">
            Your browser does not support the audio tag.
          </audio>
        `;
      }
      else {
        const text = await res.text();
        responseEl.innerHTML = `<pre>${text.substring(0, 1000)}</pre>`;
      }

      responseEl.classList.remove("d-none");
    })
    .catch((err) => {
      loadingEl.style.display = "none";
      responseEl.classList.remove("d-none");
      responseEl.innerHTML = `<pre>Error: ${err.message}</pre>`;
    });
}
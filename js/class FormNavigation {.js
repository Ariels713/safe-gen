class FormNavigation {
    constructor() {
      this.currentTab = "instructions";
      this.tabs = ["instructions", "safe-type", "company", "investor", "review"];
      this.formData = {
        safeType: "",
        valuationCap: "",
        discount: "",
        proRata: "",
        proRataRights: "",
        disclaimerAccepted: false,
      };
  
      // Define SAFE types and their required fields
      this.SAFE_TYPES = {
        "Post-Money SAFE - Valuation Cap Only": {
          safeType: [
            { id: "valuation-cap-input", type: "currency", required: true },
          ],
          company: [
            { id: "company-name", type: "text", required: true },
            {
              id: "state-incorporation",
              type: "select",
              required: true,
              default: "Delaware",
            },
            { id: "signatory-name", type: "text", required: true },
            { id: "signatory-title", type: "text", required: true },
          ],
          investor: [
            { id: "investor-name", type: "text", required: true },
            { id: "investment-amount", type: "currency", required: true },
            { id: "investment-date", type: "date", required: true },
          ],
        },
        "Post-Money SAFE - Discount Only": {
          safeType: [
            { id: "discount-input", type: "percentage", required: true },
            { id: "pro-rata-select", type: "select", required: true },
          ],
        },
        "Post-Money SAFE - MFN (Most Favored Nation)": {
          safeType: [{ id: "pro-rata-select", type: "select", required: true }],
        },
        "Pre-Money SAFE - Valuation Cap Only": {
          safeType: [
            { id: "valuation-cap-input", type: "currency", required: true },
          ],
        },
        "Pre-Money SAFE - Discount Only": {
          safeType: [
            { id: "discount-input", type: "percentage", required: true },
          ],
        },
        "Pre-Money SAFE - Valuation Cap and Discount": {
          safeType: [
            { id: "valuation-cap-input", type: "currency", required: true },
            { id: "discount-input", type: "percentage", required: true },
          ],
        },
        "Pre-money SAFE - MFN (Most Favored Nation)": {
          safeType: [{ id: "pro-rata-select", type: "select", required: true }],
        },
      };
  
      this.initializeElements();
      this.setupEventListeners();
      this.updateTabAccessibility();
    }
  
    initializeElements() {
      // Get all tab buttons
      this.tabButtons = document.querySelectorAll(".safe-tab");
  
      // Get all step sections
      this.stepSections = document.querySelectorAll(".safe-step");
  
      // Get continue and back buttons
      this.continueButton = document.querySelector(".safe-continue");
      this.backButton = document.querySelector(".safe-back");
  
      // Get checkbox element
      this.acknowledgeCheckbox = document.getElementById("acknowledge-checkbox");
  
      // Safe Type tab elements
      this.safeTypeSelect = document.getElementById("safe-type-select");
      this.valuationCapWrapper = document.getElementById("valuation-cap-wrapper");
      this.discountWrapper = document.getElementById("discount-wrapper");
      this.proRataWrapper = document.getElementById("pro-rata-wrapper");
      this.valuationCapInput = document.getElementById("valuation-cap-input");
      this.discountInput = document.getElementById("discount-input");
      this.proRataSelect = document.getElementById("pro-rata-select");
  
      // Get continue buttons for each section
      this.safeTypeContinueButton = document.getElementById("safe-type-continue");
      this.companyContinueButton = document.getElementById("company-continue");
      this.investorContinueButton = document.getElementById("investor-continue");
      this.reviewOutput = document.getElementById("review-output");
      this.downloadButton = document.getElementById('download-btn');
    }
  
    setupEventListeners() {
      // Checkbox event listener
      this.acknowledgeCheckbox.addEventListener("change", (e) =>
        this.handleCheckboxChange(e)
      );
  
      // Continue button event listener
      this.continueButton.addEventListener("click", () => {
        if (this.validateCurrentTab()) {
          this.navigateToNextTab();
        }
      });
  
      // Back button event listeners
      const backButtons = document.querySelectorAll(".safe-back");
      backButtons.forEach((button) => {
        button.addEventListener("click", () => this.navigateToPreviousTab());
      });
  
      // Safe Type tab event listeners
      this.safeTypeSelect.addEventListener("change", (e) =>
        this.handleSafeTypeChange(e)
      );
      this.valuationCapInput?.addEventListener("input", (e) =>
        this.handleValuationCapInput(e)
      );
      this.discountInput?.addEventListener("input", (e) =>
        this.handleDiscountInput(e)
      );
      this.proRataSelect?.addEventListener("change", (e) =>
        this.handleProRataChange(e)
      );
  
      // Safe Type continue button event listener
      this.safeTypeContinueButton?.addEventListener("click", () => {
        if (this.validateCurrentTab()) {
          this.navigateToNextTab();
        }
      });
  
      // Company tab event listeners
      const companyFields = [
        "company-name",
        "state-incorporation",
        "company-address",
        "signatory-name",
        "signatory-title",
        "signatory-email",
      ];
  
      companyFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.addEventListener("input", () => this.updateTabAccessibility());
        }
      });
  
      // Investor tab event listeners
      const investorFields = [
        "investor-name",
        "investment-amount",
        "investment-date",
        "entity-type",
      ];
  
      investorFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.addEventListener("input", () => this.updateTabAccessibility());
        }
      });
  
      // Add click handlers to tab buttons
      this.tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const targetTab = button.dataset.tab;
          if (this.canNavigateToTab(targetTab)) {
            this.navigateToTab(targetTab);
          }
        });
      });
  
      this.companyContinueButton?.addEventListener("click", () => {
        if (this.validateCurrentTab()) {
          this.navigateToNextTab();
        }
      });
      +(
        // Investor step Continue
        this.investorContinueButton?.addEventListener("click", () => {
          if (this.validateCurrentTab()) {
            this.navigateToNextTab();
          }
        })
      );
  
      this.downloadButton.addEventListener('click', () => this.generatePDF());
    }
  
    canNavigateToTab(targetTab) {
      const currentIndex = this.tabs.indexOf(this.currentTab);
      const targetIndex = this.tabs.indexOf(targetTab);
  
      // Can always go back to previous tabs
      if (targetIndex < currentIndex) {
        return true;
      }
  
      // For going forward, need to validate current tab
      if (targetIndex > currentIndex) {
        return this.validateCurrentTab();
      }
  
      return false;
    }
  
    updateTabAccessibility() {
      const currentIndex = this.tabs.indexOf(this.currentTab);
      const isValid = this.validateCurrentTab();
  
      // Update continue button based on current tab
      if (this.currentTab === "instructions") {
        // keep original behavior: instructions uses the top-level continueButton
        this.continueButton.disabled = !this.formData.disclaimerAccepted;
      } else if (this.currentTab === "safe-type" && this.safeTypeContinueButton) {
        // SAFE-Type step
        this.safeTypeContinueButton.disabled = !isValid;
      } else if (this.currentTab === "company" && this.companyContinueButton) {
        // Company step
        this.companyContinueButton.disabled = !isValid;
      } else if (this.currentTab === "investor" && this.investorContinueButton) {
        // Investor step
        this.investorContinueButton.disabled = !isValid;
      }
  
      // Update tab buttons
      this.tabButtons.forEach((button, index) => {
        const tabName = button.dataset.tab;
  
        if (this.currentTab === "instructions" && tabName === "safe-type") {
          button.disabled = !this.formData.disclaimerAccepted;
          button.classList.toggle("disabled", !this.formData.disclaimerAccepted);
          return;
        }
  
        if (index <= currentIndex) {
          // Enable all previous tabs and current tab
          button.disabled = false;
          button.classList.remove("disabled");
        } else if (index === currentIndex + 1) {
          // Enable next tab if current tab is valid
          button.disabled = !isValid;
          button.classList.toggle("disabled", !isValid);
        } else {
          // Disable all future tabs
          button.disabled = true;
          button.classList.add("disabled");
        }
      });
    }
  
    handleCheckboxChange(event) {
      const isChecked = event.target.checked;
      this.formData.disclaimerAccepted = isChecked;
      this.updateInstructionsTabState();
    }
  
    updateInstructionsTabState() {
      const isChecked = this.formData.disclaimerAccepted;
      const safeTypeTab = document.querySelector('[data-tab="safe-type"]');
  
      // Update checkbox state
      this.acknowledgeCheckbox.checked = isChecked;
  
      // Enable/disable continue button
      this.continueButton.disabled = !isChecked;
  
      // Enable/disable safe-type tab
      if (isChecked) {
        safeTypeTab.disabled = false;
        safeTypeTab.classList.remove("disabled");
      } else {
        safeTypeTab.disabled = true;
        safeTypeTab.classList.add("disabled");
      }
    }
  
    handleSafeTypeChange(event) {
      const selectedType = event.target.value;
      this.formData.safeType = selectedType;
  
      // Hide all wrappers first
      this.valuationCapWrapper.style.display = "none";
      this.discountWrapper.style.display = "none";
      this.proRataWrapper.style.display = "none";
  
      // Get the configuration for the selected SAFE type
      const safeConfig = this.SAFE_TYPES[selectedType];
      if (!safeConfig) return;
  
      // Show relevant inputs based on SAFE type
      switch (selectedType) {
        case "Post-Money SAFE - Valuation Cap Only":
          // Show valuation cap input
          this.valuationCapWrapper.style.display = "block";
  
          // Show company section inputs
          const companyFields = safeConfig.company || [];
          companyFields.forEach((field) => {
            const element = document.getElementById(field.id);
            if (element) {
              const wrapper = element.closest(".form-group");
              if (wrapper) {
                wrapper.style.display = "block";
              }
            }
          });
  
          // Show investor section inputs
          const investorFields = safeConfig.investor || [];
          investorFields.forEach((field) => {
            const element = document.getElementById(field.id);
            if (element) {
              const wrapper = element.closest(".form-group");
              if (wrapper) {
                wrapper.style.display = "block";
              }
            }
          });
  
          // Set Delaware as first option in state dropdown
          const stateSelect = document.getElementById("state-incorporation");
          if (stateSelect) {
            const delawareOption = Array.from(stateSelect.options).find(
              (option) => option.textContent.includes("Delaware")
            );
            if (delawareOption) {
              stateSelect.value = delawareOption.value;
            }
          }
  
          // Add event listener for investment amount formatting
          const investmentAmountInput =
            document.getElementById("investment-amount");
          if (investmentAmountInput) {
            investmentAmountInput.addEventListener("input", (e) => {
              let value = e.target.value.replace(/[^0-9]/g, "");
              if (value) {
                value = this.formatCurrency(value);
              }
              e.target.value = value;
              this.formData[field.id] = value;
              this.updateTabAccessibility();
            });
          }
          break;
        case "Post-Money SAFE - Discount Only":
          this.discountWrapper.style.display = "block";
          this.proRataWrapper.style.display = "block";
          break;
        case "Post-Money SAFE - MFN (Most Favored Nation)":
          this.proRataWrapper.style.display = "block";
          break;
        case "Pre-Money SAFE - Valuation Cap Only":
          this.valuationCapWrapper.style.display = "block";
          break;
        case "Pre-Money SAFE - Discount Only":
          this.discountWrapper.style.display = "block";
          break;
        case "Pre-Money SAFE - Valuation Cap and Discount":
          this.valuationCapWrapper.style.display = "block";
          this.discountWrapper.style.display = "block";
          break;
        case "Pre-money SAFE - MFN (Most Favored Nation)":
          this.proRataWrapper.style.display = "block";
          break;
      }
  
      this.updateTabAccessibility();
    }
  
    hideAllFields() {
      // Hide all form groups and safe-field-wrappers
      document
        .querySelectorAll(".form-group, .safe-field-wrapper")
        .forEach((group) => {
          group.style.display = "none";
        });
    }
  
    handleValuationCapInput(event) {
      let value = event.target.value.replace(/[^0-9]/g, "");
      if (value) {
        value = this.formatCurrency(value);
      }
      event.target.value = value;
      this.formData.valuationCap = value;
      this.updateTabAccessibility();
    }
  
    handleDiscountInput(event) {
      const input = event.target;
      const errorElement = document.getElementById("discount-error");
      const helperElement = input.parentElement.nextElementSibling;
  
      // Get the raw input value and remove any non-numeric characters
      let value = input.value.replace(/[^0-9]/g, "");
  
      // If we have a value, check if it's within range
      if (value) {
        const numValue = parseInt(value);
        if (numValue >= 0 && numValue <= 50) {
          // Valid input - store just the number
          input.value = value;
          this.formData.discount = value;
          errorElement.style.display = "none";
          helperElement.style.color = "#747c78";
        } else {
          // Invalid input - keep last valid value
          const lastValidValue = this.formData.discount || "";
          input.value = lastValidValue;
          helperElement.style.color = "#cc0000";
        }
      } else {
        // Allow empty input (for backspace/delete)
        input.value = "";
        this.formData.discount = "";
        helperElement.style.color = "#747c78";
      }
  
      this.updateTabAccessibility();
    }
  
    handleProRataChange(event) {
      this.formData.proRata = event.target.value;
      this.formData.proRataRights =
        event.target.value === "Includes Pro Rata Rights";
      this.updateTabAccessibility();
    }
  
    formatCurrency(value) {
      return "$" + parseInt(value).toLocaleString();
    }
  
    formatPercentage(value) {
      return value + "%";
    }
  
    navigateToNextTab() {
      const currentIndex = this.tabs.indexOf(this.currentTab);
      if (currentIndex < this.tabs.length - 1) {
        const nextTab = this.tabs[currentIndex + 1];
        if (this.validateCurrentTab()) {
          this.navigateToTab(nextTab);
        }
      }
    }
  
    navigateToPreviousTab() {
      const currentIndex = this.tabs.indexOf(this.currentTab);
      if (currentIndex > 0) {
        this.navigateToTab(this.tabs[currentIndex - 1]);
      }
    }
  
    navigateToTab(tabName) {
      // Update current tab
      this.currentTab = tabName;
  
      // Show relevant fields for company/investor tabs
      if (tabName === "company" || tabName === "investor") {
        this.showFieldsForCurrentTab();
      }
  
      // Update tab buttons
      this.tabButtons.forEach((button) => {
        if (button.dataset.tab === tabName) {
          button.classList.add("selected");
        } else {
          button.classList.remove("selected");
        }
      });
  
      // Update step sections
      this.stepSections.forEach((section) => {
        if (section.dataset.step === tabName) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
  
      // If navigating to instructions tab, update its state
      if (tabName === "instructions") {
        this.updateInstructionsTabState();
      }
  
      // Update tab accessibility
      this.updateTabAccessibility();
  
      // Update continue button state
      this.validateCurrentTab();
  
      if (tabName === "review") {
        this.populateReview();
      }
    }
  
    showFieldsForCurrentTab() {
      const safeConfig = this.SAFE_TYPES[this.formData.safeType];
      if (!safeConfig) return;
  
      const tabFields = safeConfig[this.currentTab];
      if (!tabFields) return;
  
      // First hide all inputs in the current section
      const section = document.querySelector(
        `.safe-step[data-step="${this.currentTab}"]`
      );
      if (!section) return;
  
      const allInputs = section.querySelectorAll("input, select");
      allInputs.forEach((input) => {
        const wrapper =
          input.closest("label") || input.closest(".safe-field-wrapper");
        if (wrapper) {
          wrapper.style.display = "none";
        }
      });
  
      // Then show only the relevant inputs
      tabFields.forEach((field) => {
        const input = document.getElementById(field.id);
        if (input) {
          const wrapper =
            input.closest("label") || input.closest(".safe-field-wrapper");
          if (wrapper) {
            wrapper.style.display = "flex";
          }
        }
      });
    }
  
    validateCurrentTab() {
      if (this.currentTab === "instructions") {
        return this.formData.disclaimerAccepted;
      }
  
      const safeConfig = this.SAFE_TYPES[this.formData.safeType];
      if (!safeConfig) return false;
  
      if (this.currentTab === "safe-type") {
        const safeTypeFields = safeConfig.safeType || [];
        return safeTypeFields.every((field) => {
          const element = document.getElementById(field.id);
          return element && element.value;
        });
      }
  
      if (this.currentTab === "company") {
        const companyFields = safeConfig.company || [];
        return companyFields.every((field) => {
          const element = document.getElementById(field.id);
          return element && element.value;
        });
      }
  
      if (this.currentTab === "investor") {
        const investorFields = safeConfig.investor || [];
        return investorFields.every((field) => {
          const element = document.getElementById(field.id);
          return element && element.value;
        });
      }
  
      return true;
    }
  
    showError(elementId, message) {
      const errorElement = document.getElementById(elementId);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
      }
    }
  
    /**
     * Gather all the inputs/selections and
     * render them into the Review pane.
     */
    populateReview() {
      // 1) clear out any prior content
      this.reviewOutput.innerHTML = "";
  
      // 2) grab the config for the chosen SAFE
      const safeKey = this.formData.safeType;
      const safeConfig = this.SAFE_TYPES[safeKey] || {};
  
      // 3) ALWAYS show the selected SAFE Document name
      const docSection = document.createElement("div");
      docSection.classList.add("section");
      docSection.innerHTML = `
            <h3>SAFE Document</h3>
            <ul>
              <li>SAFE Document: ${safeKey || "—"}</li>
            </ul>
          `;
      this.reviewOutput.appendChild(docSection);
  
      // 4) Define the sections you want to render and their titles
      const sections = [
        { key: "safeType", title: "Terms" },
        { key: "company", title: "Company Information" },
        { key: "investor", title: "Investor Information" },
      ];
  
      // 5) Loop over each section, look up its field list in safeConfig,
      //    then render only those fields that exist and have values.
      sections.forEach(({ key, title }) => {
        const fields = safeConfig[key];
        if (!fields || !fields.length) return;
  
        const sectionEl = document.createElement("div");
        sectionEl.classList.add("section");
        const ul = document.createElement("ul");
        sectionEl.innerHTML = `<h3>${title}</h3>`;
        sectionEl.appendChild(ul);
  
        fields.forEach((fieldDef) => {
          const inputEl = document.getElementById(fieldDef.id);
          if (!inputEl || !inputEl.value) return;
          // grab label text if possible
          const wrapper = inputEl.closest("label");
          const labelText = wrapper
            ? wrapper.firstChild.textContent.trim()
            : fieldDef.id;
          ul.innerHTML += `<li>${labelText}: ${inputEl.value}</li>`;
        });
  
        this.reviewOutput.appendChild(sectionEl);
      });
    }
  
    generatePDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
    
      // 1) Title
      doc.setFontSize(16);
      doc.text('YC SAFE Agreement', 20, 20);
    
      // 2) Pull your review-output list items
      //    (or build from this.formData and this.SAFE_TYPES[safeType])
      const lines = [];
      document.querySelectorAll('#review-output li').forEach(li => {
        lines.push(li.textContent);
      });
    
      // 3) Render them line-by-line
      doc.setFontSize(12);
      let y = 30;
      lines.forEach(line => {
        doc.text(line, 20, y);
        y += 8;
        // optional: add page breaks if y > 280
      });
    
      // 4) Save
      doc.save(`${this.formData.safeType.replace(/\s+/g,'_')}_SAFE.pdf`);
    }
  }
  
  // Initialize the form navigation
  const formNavigation = new FormNavigation();
  
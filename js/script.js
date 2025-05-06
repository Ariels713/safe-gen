{/* <script type="module" src="js/script.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> */}


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
      dateOfSafe: this.getCurrentDate()
    };

    // Common field configurations
    this.COMMON_FIELDS = {
      company: [
        { id: "company-name", type: "text", required: true },
        { id: "state-incorporation", type: "select", required: true, default: "Delaware" },
        { id: "state-governance", type: "select", required: true, default: "Delaware" },
        { id: "company-address", type: "text", required: true },
        { id: "signatory-name", type: "text", required: true },
        { id: "signatory-title", type: "text", required: true },
        { id: "signatory-email", type: "email", required: true }
      ],
      investor: [
        { id: "investor-name", type: "text", required: true },
        { id: "investment-amount", type: "currency", required: true },
        { id: "investment-date", type: "date", required: true },
        { id: "entity-type", type: "select", required: true },
        { id: "entity-signatory-name", type: "text", required: false, dependsOn: "entity-type" },
        { id: "entity-signatory-title", type: "text", required: false, dependsOn: "entity-type" },
        { id: "entity-signatory-email", type: "email", required: false, dependsOn: "entity-type" },
        { id: "invest-by-lines", type: "text", required: true }
      ]
    };

    // Define SAFE types and their required fields
    this.SAFE_TYPES = {
      "Post-Money SAFE - Valuation Cap Only": {
        safeType: [
          { id: "valuation-cap-input", type: "currency", required: true },
          { id: "pro-rata-select", type: "select", required: true }
        ],
        company: [
          { id: "company-name", type: "text", required: true },
          { id: "state-incorporation", type: "select", required: true, default: "Delaware" },
          { id: "state-governance", type: "select", required: true, default: "Delaware" },
          { id: "company-address", type: "text", required: true },
          { id: "signatory-name", type: "text", required: true },
          { id: "signatory-title", type: "text", required: true },
          { id: "signatory-email", type: "email", required: true }
        ],
        investor: [
          { id: "investor-name", type: "text", required: true },
          { id: "investment-amount", type: "currency", required: true },
          { id: "investment-date", type: "date", required: true },
          { id: "entity-type", type: "select", required: true },
          { id: "entity-signatory-name", type: "text", required: false, dependsOn: "entity-type" },
          { id: "entity-signatory-title", type: "text", required: false, dependsOn: "entity-type" },
          { id: "entity-signatory-email", type: "email", required: false, dependsOn: "entity-type" },
          { id: "invest-by-lines", type: "text", required: true }
        ]
      },
      "Post-Money SAFE - Discount Only": {
        safeType: [
          { id: "discount-input", type: "percentage", required: false },
          { id: "pro-rata-select", type: "select", required: false }
        ],
        company: [
          { id: "company-name", type: "text", required: true },
          { id: "state-incorporation", type: "select", required: true, default: "Delaware" },
          { id: "state-governance", type: "select", required: true, default: "Delaware" },
          { id: "company-address", type: "text", required: false },
          { id: "signatory-name", type: "text", required: false },
          { id: "signatory-title", type: "text", required: false },
          { id: "signatory-email", type: "email", required: false }
        ],
        investor: [
          { id: "investor-name", type: "text", required: true },
          { id: "investment-amount", type: "currency", required: true },
          { id: "entity-type", type: "select", required: false },
          { id: "entity-signatory-title", type: "text", required: false, dependsOn: "entity-type" },
          { id: "entity-signatory-email", type: "email", required: false, dependsOn: "entity-type" },
        ]
      },
      "Post-Money SAFE - MFN (Most Favored Nation)": {
        safeType: [
          { id: "pro-rata-select", type: "select", required: true }
        ],
        ...this.COMMON_FIELDS
      },
      "Pre-Money SAFE - Valuation Cap Only": {
        safeType: [
          { id: "valuation-cap-input", type: "currency", required: true }
        ],
        ...this.COMMON_FIELDS
      },
      "Pre-Money SAFE - Discount Only": {
        safeType: [
          { id: "discount-input", type: "percentage", required: true }
        ],
        ...this.COMMON_FIELDS
      },
      "Pre-Money SAFE - Valuation Cap and Discount": {
        safeType: [
          { id: "valuation-cap-input", type: "currency", required: true },
          { id: "discount-input", type: "percentage", required: true }
        ],
        ...this.COMMON_FIELDS
      },
      "Pre-money SAFE - MFN (Most Favored Nation)": {
        safeType: [
          // { id: "pro-rata-select", type: "select", required: true }
        ],
        ...this.COMMON_FIELDS
      }
    };
      
    this.initializeElements();
    this.setupEventListeners();
    this.updateTabAccessibility();
  }

  /**
   * Generates a .doc (Word) file from the selected legal template and triggers download.
   * @param {string} templateId - The ID of the template to use.
   * @param {string} filename - The filename for the downloaded .doc (default: SAFE_Document.doc)
   */
  generateDOC(templateId, filename = "SAFE_Document.doc") {
    const htmlContent = this.getLegalTemplate(templateId);
    const docHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>`;
    const docFooter = "</body></html>";
    const fullDoc = docHeader + htmlContent + docFooter;

    const blob = new Blob(['\ufeff', fullDoc], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a .doc (Word) file from the selected legal template and triggers download.
   * @param {string} templateId - The ID of the template to use.
   * @param {string} filename - The filename for the downloaded .doc (default: SAFE_Document.doc)
   */
  generateDOC(templateId, filename = "SAFE_Document.doc") {
    const htmlContent = this.getLegalTemplate(templateId);
    const docHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head><body>`;
    const docFooter = "</body></html>";
    const fullDoc = docHeader + htmlContent + docFooter;

    const blob = new Blob(['\ufeff', fullDoc], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    this.proRataDownloadButton = document.getElementById('download-pro-rata-btn');

    // Initialize proRata and proRataRights from the preselected option, only if SAFE type uses pro-rata-select
    if (this.proRataSelect) {
      const safeConfig = this.SAFE_TYPES[this.formData.safeType] || {};
      const usesProRata = safeConfig.safeType?.some(f => f.id === "pro-rata-select");
      if (usesProRata) {
        const selectedValue = this.proRataSelect.value;
        this.formData.proRata = selectedValue;
        this.formData.proRataRights = selectedValue === "Includes Pro Rata Rights";
      } else {
        this.formData.proRata = null;
        this.formData.proRataRights = false;
      }
    }

    // Prevent cursor flicker by ensuring buttons use pointer cursor explicitly
    ["download-btn", "download-pro-rata-btn", "download-doc-btn"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.cursor = "pointer";
      }
    });
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
      "state-governance",
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
      "invest-by-lines",
    ];

    investorFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", () => this.updateTabAccessibility());
        field.addEventListener("change", () => this.updateTabAccessibility());
      }
    });

    // Email format validation for signatory-email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const companyEmailField = document.getElementById("signatory-email");
    const companyEmailError = document.getElementById("signatory-email-error");
    if (companyEmailField) {
      companyEmailField.addEventListener("input", () => {
        const isValid = emailRegex.test(companyEmailField.value.trim());
        if (companyEmailError) {
          companyEmailError.textContent = isValid ? "" : "Please enter a valid email address.";
          companyEmailError.style.display = isValid ? "none" : "block";
        }
        this.updateTabAccessibility();
      });
    }
    // Email format validation for investor entity-signatory-email
    const investorEmailField = document.getElementById("entity-signatory-email");
    const investorEmailError = document.getElementById("entity-signatory-email-error");
    if (investorEmailField) {
      investorEmailField.addEventListener("input", () => {
        const isValid = emailRegex.test(investorEmailField.value.trim());
        if (investorEmailError) {
          investorEmailError.textContent = isValid ? "" : "Please enter a valid email address.";
          investorEmailError.style.display = isValid ? "none" : "block";
        }
        this.updateTabAccessibility();
      });
    }

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
    // Investor step Continue
    this.investorContinueButton?.addEventListener("click", () => {
      if (this.validateCurrentTab()) {
        this.navigateToNextTab();
      }
    });

    this.proRataDownloadButton?.addEventListener('click', () => {
      this.generateDOC("template-pro-rata", "Pro_Rata_Letter.doc");
    });

    // DOC download button event listener (restored logic)
    const docDownloadBtn = document.getElementById("download-doc-btn");
    if (docDownloadBtn) {
      docDownloadBtn.addEventListener("click", () => {
        const safeType = this.formData.safeType;
        const templateMap = {
          "Post-Money SAFE - Valuation Cap Only": "template-post-money-cap",
          "Post-Money SAFE - Discount Only": "template-post-money-discount",
          "Post-Money SAFE - MFN (Most Favored Nation)": "template-post-money-mfn",
          "Pre-Money SAFE - Valuation Cap Only": "template-pre-money-cap",
          "Pre-Money SAFE - Discount Only": "template-pre-money-discount",
          "Pre-Money SAFE - Valuation Cap and Discount": "template-pre-money-both",
          "Pre-money SAFE - MFN (Most Favored Nation)": "template-post-money-mfn",
          "Pro Rata Side Letter": "template-pro-rata" 
        };
        const templateId = templateMap[safeType];
        if (!templateId) {
          alert("Template not found.");
          return;
        }
        this.generateDOC(templateId, `${safeType.replace(/\s+/g, "_")}.doc`);
      });
    }

    // Add investment amount input handler
    const investmentAmountInput = document.getElementById("investment-amount");
    if (investmentAmountInput) {
      investmentAmountInput.addEventListener("input", (e) =>
        this.handleCurrencyInput(e, 'investmentAmount')
      );
    }

    // --- Prevent repeated DOM reflows and cursor flicker for .safe-download buttons
    // Remove any hover-triggered display toggling for download buttons
    // (Assure: download buttons are only shown/hidden in review logic, not on hover events)
    // (No hover listeners or mouseover/mouseout events should be attached here)
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

    // Set initial value of the pro-rata field and its related flag
    const proRataEl = document.getElementById("pro-rata-select");
    if (proRataEl) {
      const selectedValue = proRataEl.value;
      this.formData.proRata = selectedValue;
      this.formData.proRataRights = selectedValue === "Includes Pro Rata Rights";
    }

    // Get the configuration for the selected SAFE type
    const safeConfig = this.SAFE_TYPES[selectedType];
    if (!safeConfig) return;

    // Hide any previously shown fields
    this.hideAllFields();
    // Show relevant inputs based on SAFE_TYPES config
    Object.values(safeConfig).forEach(fieldsArray => {
      fieldsArray.forEach(fieldDef => {
        const el = document.getElementById(fieldDef.id);
        if (el) {
          const wrapper = el.closest(".form-group") || el.closest(".safe-field-wrapper");
          if (wrapper) {
            wrapper.style.display = "block";
          }
        }
      });
    });

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

  handleCurrencyInput(event, fieldName) {
    let value = event.target.value.replace(/[^0-9]/g, "");
    if (value) {
      value = this.formatCurrency(value);
    }
    event.target.value = value;
    this.formData[fieldName] = value;
    this.updateTabAccessibility();
  }

  handleValuationCapInput(event) {
    this.handleCurrencyInput(event, 'valuationCap');
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
      if (numValue >= 0 && numValue <= 100) {
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

    // SAFE Type step: all fields in safeConfig.safeType are required
    if (this.currentTab === "safe-type") {
      return safeConfig.safeType.every(field => {
        const el = document.getElementById(field.id);
        return el && el.offsetParent !== null && el.value.trim() !== "";
      });
    }

    // Company step: only the truly required company fields
    if (this.currentTab === "company") {
      return (safeConfig.company || [])
        .filter(field => field.required)
        .every(field => {
          const el = document.getElementById(field.id);
          return el && el.offsetParent !== null && el.value.trim() !== "";
        });
    }

    // Investor step: only the truly required investor fields, with proper dependsOn logic
    if (this.currentTab === "investor") {
      return (safeConfig.investor || [])
        .filter(field => {
          if (!field.required) return false;
          if (field.dependsOn) {
            const trigger = document.getElementById(field.dependsOn);
            return trigger && trigger.value && trigger.value.trim() !== "";
          }
          return true;
        })
        .every(field => {
          const el = document.getElementById(field.id);
          return el && el.offsetParent !== null && el.value.trim() !== "";
        });
    }

    // Review and any other tabs
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

    // 4) Define the sections you want to render
    const sections = [
      { key: "safeType" },
      { key: "company" },
      { key: "investor" },
    ];

    // 5) Loop over each section, look up its field list in safeConfig,
    //    then render only those fields that exist and have values.
    sections.forEach(({ key }) => {
      const fields = safeConfig[key];
      if (!fields || !fields.length) return;

      const sectionEl = document.createElement("div");
      sectionEl.classList.add("section");
      const ul = document.createElement("ul");
      sectionEl.appendChild(ul);

      fields.forEach((fieldDef) => {
        const inputEl = document.getElementById(fieldDef.id);
        if (!inputEl || !inputEl.value) return;
        // grab label text if possible
        const wrapper = inputEl.closest("label");
        const labelText = wrapper
          ? wrapper.firstChild.textContent.trim()
          : fieldDef.id;
        ul.innerHTML += `<li>${labelText}: <strong>${inputEl.value}</strong></li>`;
      });

      this.reviewOutput.appendChild(sectionEl);
    });

    // --- Updated logic for Pro Rata template and download buttons
    const hasProRataRights = this.formData.proRata === "Includes Pro Rata Rights";
    const isProRataLetterOnly = this.formData.safeType === "Pro Rata Side Letter";

    // Toggle buttons
    this.proRataDownloadButton.style.display = (hasProRataRights || isProRataLetterOnly) ? 'inline-block' : 'none';

    // Do not render the Pro Rata letter in the review view — only allow downloading it
  }

  getLegalTemplate(templateId) {
    const { valuationCap, discount, dateOfSafe } = this.formData;
    const discountPercent = parseFloat(discount) || 0;
    const discountRate = 100 - discountPercent;
    const templateEl = document.getElementById(templateId);
    if (!templateEl) return "<p>Template not found.</p>";
    let html = templateEl.innerHTML;

    // Helper function to safely get input value
    const getInputValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value.trim() : "";
    };

    // Replace all placeholders with actual values or empty strings
    html = html.replace(/\[dateOfSafe\]/g, dateOfSafe || "");
    html = html.replace(/\[valuationCap\]/g, valuationCap || "");
    html = html.replace(/\[discount\]/g, discount || "");
    html = html.replace(/\[companyName\]/g, getInputValue("company-name") || "");
    html = html.replace(/\[stateIncorporation\]/g, getInputValue("state-incorporation") || "");
    html = html.replace(/\[stateGovernance\]/g, getInputValue("state-governance") || "");
    html = html.replace(/\[companyAddress\]/g, getInputValue("company-address") || "");
    html = html.replace(/\[signatoryName\]/g, getInputValue("signatory-name") || "");
    html = html.replace(/\[signatoryTitle\]/g, getInputValue("signatory-title") || "");
    html = html.replace(/\[signatoryEmail\]/g, getInputValue("signatory-email") || "");
    html = html.replace(/\[investorName\]/g, getInputValue("investor-name") || "");
    html = html.replace(/\[investmentAmount\]/g, getInputValue("investment-amount") || "");
    html = html.replace(/\[investmentDate\]/g, getInputValue("investment-date") || "");
    html = html.replace(/\[entityType\]/g, getInputValue("entity-type") || "");
    html = html.replace(/\[entitySignatoryName\]/g, getInputValue("entity-signatory-name") || "");
    html = html.replace(/\[entitySignatoryTitle\]/g, getInputValue("entity-signatory-title") || "");
    html = html.replace(/\[entitySignatoryEmail\]/g, getInputValue("entity-signatory-email") || "");
    html = html.replace(/\[investByLines\]/g, getInputValue("invest-by-lines") || "");
    html = html.replace(/\[investorAddress\]/g, getInputValue("investor-address") || "");
    html = html.replace(/\[investorEmail\]/g, getInputValue("investor-email") || "");
    html = html.replace(/\[Governing Law Jurisdiction\]/g, getInputValue("state-governance") || "");
    // Add replacement for [discountRate]
    html = html.replace(/\[discountRate\]/g, `${discountRate}%`);

    return html;
  }

  generatePDF() {
    const jsPDF = window.jspdf.jsPDF;
    const safeType = this.formData.safeType;

    const map = {
      "Post-Money SAFE - Valuation Cap Only": "template-post-money-cap",
      "Post-Money SAFE - Discount Only": "template-post-money-discount",
      "Post-Money SAFE - MFN (Most Favored Nation)": "template-post-money-mfn",
      "Pre-Money SAFE - Valuation Cap Only": "template-pre-money-cap",
      "Pre-Money SAFE - Discount Only": "template-pre-money-discount",
      "Pre-Money SAFE - Valuation Cap and Discount": "template-pre-money-both",
      "Pre-money SAFE - MFN (Most Favored Nation)": "template-post-money-mfn",
      "Pro Rata Side Letter": "template-pro-rata"
    };

    const safeTemplateId = map[safeType];
    if (!safeTemplateId) {
      alert("Could not find a template for the selected SAFE type.");
      return;
    }

    const htmlSafe = this.getLegalTemplate(safeTemplateId);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlSafe;
    document.body.appendChild(tempDiv);

    const doc = new jsPDF();
    doc.html(tempDiv, {
      callback: () => {
        const pageCount = doc.getNumberOfPages();
        const safeTitle = safeType;

        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() - 30,
            doc.internal.pageSize.getHeight() - 10
          );
          doc.text(safeTitle, 10, 10);
        }

        doc.save(`${safeType.replace(/\s+/g, "_")}_SAFE.pdf`);
        tempDiv.remove();
      },
      x: 10,
      y: 20,
      width: 190
    });
  }

  generateProRataPDF() {
    const jsPDF = window.jspdf.jsPDF;
    const htmlProRata = this.getLegalTemplate("template-pro-rata");
    const tempProRata = document.createElement("div");
    tempProRata.innerHTML = htmlProRata;
    document.body.appendChild(tempProRata);

    const doc = new jsPDF();
    doc.html(tempProRata, {
      callback: () => {
        doc.save("Pro_Rata_Letter.pdf");
        tempProRata.remove();
      },
      x: 10,
      y: 10,
      width: 190
    });
  }

  // Helper method to setup field event listeners
  setupFieldListeners(fields, callback) {
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener("input", callback);
      }
    });
  }

  // Helper method to validate fields
  validateFields(fields) {
    return fields.every(field => {
      const el = document.getElementById(field.id);
      return el && el.value;
    });
  }

  // Helper method to toggle element visibility
  toggleElementVisibility(element, isVisible) {
    if (element) {
      element.style.display = isVisible ? "block" : "none";
    }
  }

  // Helper method to update tab state
  updateTabState(tab, isValid) {
    const button = document.querySelector(`[data-tab="${tab}"]`);
    if (button) {
      button.disabled = !isValid;
      button.classList.toggle("disabled", !isValid);
    }
  }

  // Helper method to show/hide form fields
  updateFormFields(fields, isVisible) {
    fields.forEach(field => {
      const element = document.getElementById(field.id);
      if (element) {
        const wrapper = element.closest(".form-group") || element.closest(".safe-field-wrapper");
        if (wrapper) {
          wrapper.style.display = isVisible ? "flex" : "none";
        }
      }
    });
  }

  getCurrentDate() {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
}

// Initialize the form navigation
const formNavigation = new FormNavigation();

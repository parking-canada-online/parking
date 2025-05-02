document.addEventListener("DOMContentLoaded", function () {
    // Елементи сторінки
    const getQuoteButton = document.querySelector(".css-1gub0x");
    const addVehicleButton = document.querySelector("#addVehicleButton");
    const addVehicleContainer = document.querySelector("#labelthisclass");
    const licensePlateText = document.querySelector("#labelthisclass .css-1yjk7hy");
    const addReceiptButton = document.querySelector("#Receipt-header .css-yib0zg");
    const addPaymentButton = document.querySelector("#addPaymentButton");
    const paymentTabPanel = document.querySelector("#full-width-tabpanel-0");

    // Змінні для зберігання стану
    let selectedHours = 0;
    let selectedMinutes = 0;
    let selectedPrice = 0.0;
    let enteredText = "";
    let enteredEmail = "";
    let currentPaypalLink = ""; // Додано змінну для поточного посилання PayPal

    // Ціни за години та відповідні посилання PayPal
    const priceRanges = {
        "0-1": {price: 5.0, paypalLink: "https://www.paypal.com/ncp/payment/3BBWEFQRHDSAL"},
        "2": {price: 9.0, paypalLink: "https://www.paypal.com/ncp/payment/VREVMYVEXTF4G"},
        "3-5": {price: 13.0, paypalLink: "https://www.paypal.com/ncp/payment/KJUDP9FWAQJ8E"},
        "5-13": {price: 16.0, paypalLink: "https://www.paypal.com/ncp/payment/NRQ3PVV6FXZ4L"},
        "13-20": {price: 22.0, paypalLink: "https://www.paypal.com/ncp/payment/USV2LH79C67X4"},
        "20-36": {price: 28.0, paypalLink: "https://www.paypal.com/ncp/payment/NSX8KU3DK2V4Q"}
    };

    // Створюємо блок "Total" динамічно
    const quoteContainer = document.createElement("div");
    quoteContainer.classList.add("css-1il2nwv");
    quoteContainer.innerHTML = `
        <p class="MuiTypography-root MuiTypography-body1 css-ubdx1u">Total</p>
        <p class="MuiTypography-root MuiTypography-body1 css-ptmwmh">CA$0.00</p>
    `;
    quoteContainer.style.display = "none"; // Спочатку прихований

    // Додаємо блок "Total" до контейнера з класом .css-isbt42
    const targetBlock = document.querySelector(".css-isbt42");
    if (targetBlock) {
        targetBlock.appendChild(quoteContainer);
    }

    // Функція для приховування блоку "Total" з анімацією
    function hideTotalBlock() {
        if (quoteContainer) {
            quoteContainer.classList.add("fade-out");
            setTimeout(() => {
                quoteContainer.style.display = "none";
                quoteContainer.classList.remove("fade-out");
            }, 300); // Час анімації
        }
    }

    // Функція для показу блоку "Total" з анімацією
    function showTotalBlock() {
        if (quoteContainer) {
            quoteContainer.style.display = "flex";
            quoteContainer.classList.add("fade-in");
            setTimeout(() => {
                quoteContainer.classList.remove("fade-in");
            }, 300); // Час анімації
        }
    }

    // Функція для оновлення часу завершення оренди
    function updateEndTime(hours, minutes) {
        const now = new Date();
        const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
        const options = { month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
        const formattedEndTime = endTime.toLocaleDateString("en-US", options);

        const hoursDisplay = document.querySelector("#hoursDisplay");
        const minutesDisplay = document.querySelector("#minutesDisplay");
        const endTimeDisplay = document.querySelector("#endTimeDisplay");

        if (hoursDisplay) hoursDisplay.textContent = hours;
        if (minutesDisplay) minutesDisplay.textContent = minutes;
        if (endTimeDisplay) endTimeDisplay.textContent = formattedEndTime;
    }

    // Функція для отримання ціни за години та посилання PayPal
    function getPriceDataForHours(hours) {
        if (hours === 0 || hours === 1) return priceRanges["0-1"];
        if (hours === 2) return priceRanges["2"];
        if (hours  >= 3 && hours <= 5) return priceRanges["3-5"];
        if (hours >= 5 && hours <= 13) return priceRanges["5-13"];
        if (hours >= 13 && hours <= 20) return priceRanges["13-20"];
        if (hours >= 20 && hours <= 36) return priceRanges["20-36"];
        return { price: 0.0, paypalLink: "#" };
    }

    // Функція для розрахунку загальної ціни та посилання
    function calculateTotalPrice(hours, minutes) {
        if (hours === 0 && minutes > 0) {
            return priceRanges["0-1"];
        } else {
            return getPriceDataForHours(hours);
        }
    }

    // Функція для оновлення стану "Total" та кнопки "Get Quote"
    function updateUI() {
        const buttonContainer = document.querySelector(".css-1hgrvpk");

        if (selectedHours === 0 && selectedMinutes === 0) {
            if (getQuoteButton) {
                getQuoteButton.disabled = true;
                getQuoteButton.classList.add("css-1iv6cj9");
            }
            if (buttonContainer) {
                buttonContainer.style.display = "block";
            }
        } else {
            if (getQuoteButton) {
                getQuoteButton.disabled = false;
                getQuoteButton.classList.remove("css-1iv6cj9");
            }
            if (buttonContainer) {
                buttonContainer.style.display = "block";
            }
        }
    }

    function setupDropdown(buttonSelector, menuSelector, isHoursMenu = false) {
        const button = document.querySelector(buttonSelector);
        const menu = document.querySelector(menuSelector);
    
        if (!button || !menu) return;
    
        const options = menu.querySelectorAll(".MuiMenuItem-root");
        // Знаходимо span з цифрою (замість selectedSpan)
        const numberSpan = button.querySelector(".css-17flx8");
    
        // Відкриття/закриття меню (залишаємо оригінальну логіку позиціонування)
        button.addEventListener("click", function (event) {
            event.stopPropagation();
    
            document.querySelectorAll(".MuiMenu-paper").forEach((m) => {
                if (m !== menu) m.style.display = "none";
            });
    
            const rect = button.getBoundingClientRect();
            menu.style.width = `${rect.width}px`;
            menu.style.top = `${rect.bottom + window.scrollY}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
    
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        });
    
        // Вибір елемента меню
        options.forEach((option) => {
            option.addEventListener("click", function (event) {
                event.stopPropagation();
    
                options.forEach((opt) => opt.classList.remove("Mui-selected", "css-1li7s9q"));
                option.classList.add("Mui-selected", "css-1li7s9q");
    
                if (isHoursMenu) {
                    selectedHours = parseInt(option.getAttribute("data-value"), 10);
                } else {
                    selectedMinutes = parseInt(option.getAttribute("data-value"), 10);
                }
    
                const priceData = calculateTotalPrice(selectedHours, selectedMinutes);
                selectedPrice = priceData.price;
                currentPaypalLink = priceData.paypalLink;
    
                // Змінюємо ТІЛЬКИ цифру (не чіпаємо "Heures"/"Minutes")
                if (numberSpan) {
                    numberSpan.textContent = option.getAttribute("data-value");
                }
    
                menu.style.display = "none";
                updateUI();
                hideTotalBlock();
    
                // Решта вашого коду залишається без змін...
                const licensePlateInput = document.querySelector("#licensePlateInput");
                if (licensePlateInput) {
                    licensePlateInput.closest(".MuiFormControl-root").remove();
                }
    
                const emailInput = document.querySelector("#receiptemail");
                if (emailInput) {
                    emailInput.closest(".MuiFormControl-root").remove();
                }
    
                if (addVehicleButton) {
                    addVehicleButton.disabled = true;
                    addVehicleButton.classList.add("Mui-disabled");
                }
    
                if (addReceiptButton) {
                    addReceiptButton.disabled = true;
                    addReceiptButton.classList.add("Mui-disabled");
                }
                if (addPaymentButton) {
                    addPaymentButton.disabled = true;
                    addPaymentButton.classList.add("Mui-disabled");
                }
            });
        });
    
        // Закриття меню при кліку поза ним
        document.addEventListener("click", function (event) {
            if (!button.contains(event.target)) {
                menu.style.display = "none";
            }
        });
    }
    
    // Ініціалізація меню
    setupDropdown("#hours-button", "#hours-menu", true);
    setupDropdown("#minutes-button", "#minutes-menu", false);
    // Обробка кнопки "Get Quote"
    if (getQuoteButton) {
        getQuoteButton.addEventListener("click", function () {
            if (selectedHours > 0 || selectedMinutes > 0) {
                updateEndTime(selectedHours, selectedMinutes);

                const timeDisplayBlock = document.querySelector("#LengthofStay-header .css-pb69ky");
                if (timeDisplayBlock) {
                    timeDisplayBlock.style.display = "block";
                    timeDisplayBlock.style.opacity = "1";
                }

                const buttonContainer = document.querySelector(".css-1hgrvpk");
                if (buttonContainer) {
                    buttonContainer.style.display = "none";
                }

                // Показуємо блок "Total" з анімацією
                if (quoteContainer) {
                    quoteContainer.querySelector(".css-ptmwmh").textContent = `CA$${selectedPrice.toFixed(2)}`;
                    showTotalBlock();
                }

                // Активуємо кнопку "Add" для Vehicle
                if (addVehicleButton) {
                    addVehicleButton.disabled = false;
                    addVehicleButton.classList.remove("Mui-disabled");
                }

                if (addReceiptButton) {
                    addReceiptButton.disabled = false;
                    addReceiptButton.classList.remove("Mui-disabled");
                }
                if (addPaymentButton) {
                    addPaymentButton.disabled = false;
                    addPaymentButton.classList.remove("Mui-disabled");
                }
            }
        });
    }

    // Функція для створення поля введення номеру автомобіля
    function createLicensePlateField() {
        return `
            <div class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root css-fu1bpk license-plate-field">
                <div class="MuiInputBase-root MuiFilledInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-14mvz8k">
                    <input
                        aria-invalid="false"
                        aria-describedby="licensePlateInput-helper-text"
                        id="licensePlateInput"
                        placeholder="par exemple WDS4562"
                        type="text"
                        enterkeyhint="enter"
                        class="MuiInputBase-input MuiFilledInput-input css-2bxn45"
                        value="${enteredText}"
                    />
                </div>
                <p class="MuiFormHelperText-root MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-x3bti0" id="licensePlateInput-helper-text">
                    Doit contenir de 2 à 8 caractères
                </p>
            </div>
        `;
    }

    // Обробник події для кнопки "Add" або "Edit" номеру автомобіля
    if (addVehicleButton) {
        addVehicleButton.addEventListener("click", function () {
            const existingLicensePlateInput = document.querySelector("#licensePlateInput");
            if (existingLicensePlateInput) {
                const fieldContainer = existingLicensePlateInput.closest(".license-plate-field");
                fieldContainer.classList.remove("visible");
                setTimeout(() => fieldContainer.remove(), 300);
            }

            const licensePlateField = createLicensePlateField();

            if (addVehicleContainer) {
                addVehicleContainer.insertAdjacentHTML("beforeend", licensePlateField);

                setTimeout(() => {
                    const field = document.querySelector(".license-plate-field");
                    if (field) {
                        field.classList.add("visible");
                    }
                }, 10);

                const licensePlateInput = document.querySelector("#licensePlateInput");
                if (licensePlateInput) {
                    licensePlateInput.focus();
                }

                addVehicleButton.disabled = true;
                addVehicleButton.classList.add("Mui-disabled");

                licensePlateInput.addEventListener("blur", function () {
                    enteredText = licensePlateInput.value.trim();

                    if (enteredText) {
                        if (licensePlateText) {
                            licensePlateText.textContent = enteredText;
                        }

                        const helperText = document.querySelector("#licensePlateInput-helper-text");
                        if (helperText) {
                            helperText.style.display = "none";
                        }

                        addVehicleButton.textContent = "Modifier";
                        addVehicleButton.disabled = false;
                        addVehicleButton.classList.remove("Mui-disabled");

                        const fieldContainer = licensePlateInput.closest(".license-plate-field");
                        if (fieldContainer) {
                            fieldContainer.classList.remove("visible");
                            setTimeout(() => fieldContainer.remove(), 300);
                        }

                        // Приховуємо блок "Total" після заповнення поля
                        hideTotalBlock();
                    }
                });
            }
        });
    }

    // Функція для створення поля введення електронної пошти
    function createEmailField() {
        return `
            <div class="MuiFormControl-root MuiFormControl-fullWidth MuiTextField-root css-fu1bpk email-field">
                <div class="MuiInputBase-root MuiFilledInput-root MuiInputBase-colorPrimary MuiInputBase-fullWidth MuiInputBase-formControl css-14mvz8k">
                    <input
                        aria-invalid="false"
                        aria-describedby="emailInput-helper-text"
                        id="emailInput"
                        placeholder="example@example.com"
                        type="email"
                        enterkeyhint="enter"
                        class="MuiInputBase-input MuiFilledInput-input css-2bxn45"
                        value="${enteredEmail}"
                    />
                </div>
                <p class="MuiFormHelperText-root MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-x3bti0" id="emailInput-helper-text">
                    Doit être une adresse e-mail valide
                </p>
            </div>
        `;
    }

    // Обробник події для кнопки "Add" або "Edit" електронної пошти
    if (addReceiptButton) {
        addReceiptButton.addEventListener("click", function () {
            const existingEmailInput = document.querySelector("#emailInput");
            if (existingEmailInput) {
                const fieldContainer = existingEmailInput.closest(".email-field");
                fieldContainer.classList.remove("visible");
                setTimeout(() => fieldContainer.remove(), 300);
            }

            const emailField = createEmailField();

            const receiptContainer = document.querySelector("#receiptemail");
            if (receiptContainer) {
                receiptContainer.insertAdjacentHTML("beforeend", emailField);

                setTimeout(() => {
                    const field = document.querySelector(".email-field");
                    if (field) {
                        field.classList.add("visible");
                    }
                }, 10);

                const emailInput = document.querySelector("#emailInput");
                if (emailInput) {
                    emailInput.focus();
                }

                addReceiptButton.disabled = true;
                addReceiptButton.classList.add("Mui-disabled");

                emailInput.addEventListener("blur", function () {
                    enteredEmail = emailInput.value.trim();

                    if (enteredEmail) {
                        const receiptText = document.querySelector("#receiptemail .css-71ar21");
                        if (receiptText) {
                            receiptText.textContent = enteredEmail;
                        }

                        const helperText = document.querySelector("#emailInput-helper-text");
                        if (helperText) {
                            helperText.style.display = "none";
                        }

                        addReceiptButton.textContent = "Modifier";
                        addReceiptButton.disabled = false;
                        addReceiptButton.classList.remove("Mui-disabled");

                        const fieldContainer = emailInput.closest(".email-field");
                        if (fieldContainer) {
                            fieldContainer.classList.remove("visible");
                            setTimeout(() => fieldContainer.remove(), 300);
                        }

                        // Приховуємо блок "Total" після заповнення поля
                        hideTotalBlock();
                    }
                });
            }
        });
    }

    if (addPaymentButton && paymentTabPanel) {
        addPaymentButton.addEventListener("click", function () {
            // Створюємо блок "Total"
            const totalBlock = document.createElement("div");
            totalBlock.classList.add("MuiBox-root", "css-1ebnygn");
            totalBlock.innerHTML = `
                <div class="MuiBox-root css-69i1ev">
                    <p class="MuiTypography-root MuiTypography-body1 css-ubdx1u">Total</p>
                    <p class="MuiTypography-root MuiTypography-body1 css-ptmwmh">CA$${selectedPrice.toFixed(2)}</p>
                </div>
            `;
    
            // Створюємо кнопку оплати з іконкою нової вкладки
            const payButtonContainer = document.createElement("div");
            payButtonContainer.classList.add("MuiBox-root", "css-1iuj73f", "fade-in-button");
            payButtonContainer.innerHTML = `
                <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-disableElevation MuiButton-fullWidth css-1gub0x" tabindex="0" type="button">
                    <div class="MuiBox-root css-sgter1">
                        <div class="MuiTypography-root MuiTypography-h6 css-edo8wy">
                            Payer et démarrer la séance
                            <svg style="margin-left: 8px; width: 16px; height: 16px; vertical-align: middle;" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                            </svg>
                        </div>
                    </div>
                </button>
            `;
    
            // Блок умов
            const agreementBlock = document.createElement("div");
            agreementBlock.classList.add("MuiBox-root", "css-1yuhvjn");
            agreementBlock.innerHTML = `
                <p class="MuiTypography-root MuiTypography-body1 css-1gok911" style="text-align: center;">
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl">En cliquant, vous acceptez notre </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/privacy-policy" target="_blank" rel="noopener">Politique de confidentialité</a>
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl"> et nos </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/terms-conditions-use" target="_blank" rel="noopener">Conditions d'utilisation</a>
                </p>
            `;
    
            // Очищення та додавання елементів
            paymentTabPanel.innerHTML = "";
            paymentTabPanel.append(totalBlock, payButtonContainer, agreementBlock);
    
            // Обробник кнопки оплати
            const payButton = payButtonContainer.querySelector("button");
            if (payButton) {
                payButton.addEventListener("click", function(event) {
                    event.preventDefault();
                    window.open(
                        currentPaypalLink, 
                        '_blank',
                        'noopener,noreferrer,width=1024,height=768'
                    );
                    
                    // Опціонально: відстеження переходу
                    console.log(`Redirection vers PayPal pour ${selectedHours} heures`);
                });
            }
    
            // Деактивація кнопки "Add"
            addPaymentButton.disabled = true;
            addPaymentButton.classList.add("Mui-disabled");
        });
    }
    // Функція для оновлення інтерфейсу після оплати (французька версія)
    function updateUIAfterPayment() {
        // Отримуємо час у французькому форматі
        const now = new Date();
        const endTime = new Date(now.getTime() + selectedHours * 60 * 60 * 1000 + selectedMinutes * 60 * 1000);
        const options = { 
            month: "long", 
            day: "numeric", 
            hour: "numeric", 
            minute: "numeric",
            timeZone: "Europe/Paris"
        };
        
        let formattedEndTime;
        try {
            formattedEndTime = endTime.toLocaleDateString("fr-FR", options);
        } catch (e) {
            formattedEndTime = endTime.toLocaleDateString("fr-CA", options);
        }

        // Оновлюємо блоки з французькими текстами
        const timeBlock = document.querySelector(".css-17h6ml9");
        if (timeBlock) {
            timeBlock.innerHTML = `
                <div class="css-do46q9">
                    <div class="css-roducp">
                        <span class="css-m81iil">${selectedHours}h ${selectedMinutes}m restantes</span>
                        <p class="css-6fz2wu">Expire à ${formattedEndTime}</p>
                    </div>
                </div>
            `;
        }

        // Vehicle block
        const vehicleHeader = document.querySelector("#Vehicle-header");
        if (vehicleHeader) {
            vehicleHeader.innerHTML = `
                <div class="css-1n11r91" style="padding: 10px;">
                    <div class="css-8atqhb">
                        <p class="css-1gh8bh5">Commande #${enteredText}</p>
                        <p class="css-71ar21">${formattedEndTime}</p>
                    </div>
                    <div class="css-k008qs">
                        <button class="edit-icon-btn" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        // Receipt block
        const receiptHeader = document.querySelector("#Receipt-header");
        if (receiptHeader) {
            receiptHeader.innerHTML = `
                <div class="css-1n11r91" style="padding: 10px;">
                    <div class="css-8atqhb">
                        <p class="css-1gh8bh5">Reçu</p>
                        <p class="css-71ar21">${enteredEmail}</p>
                    </div>
                    <div class="css-k008qs">
                        <button class="edit-icon-btn" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        // Payment block
        const paymentHeader = document.querySelector("#Payment-header");
        if (paymentHeader) {
            paymentHeader.innerHTML = `
                <div class="css-1n11r91" style="padding: 10px;">
                    <div class="css-8atqhb">
                        <p class="css-1gh8bh5">Commentaires?</p>
                        <p class="css-71ar21">Dites-nous ce que vous en pensez</p>
                    </div>
                    <div class="css-k008qs">
                        <button class="edit-icon-btn" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        // Видаляємо зайві блоки
        const paymentPanel = document.querySelector("#panel-Payment");
        if (paymentPanel) paymentPanel.remove();
        
        const lengthOfStayHeader = document.querySelector("#LengthofStay-header");
        if (lengthOfStayHeader) lengthOfStayHeader.remove();
        
        hideTotalBlock();
    }

    // Обробник кнопки оплати (відкриває в новій вкладці)
    if (addPaymentButton && paymentTabPanel) {
        addPaymentButton.addEventListener("click", function () {
            // Створення блоку оплати (французька версія)
            const payButtonContainer = document.createElement("div");
            payButtonContainer.classList.add("MuiBox-root", "css-1iuj73f");
            payButtonContainer.innerHTML = `
                <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-disableElevation MuiButton-fullWidth css-1gub0x" tabindex="0" type="button">
                    <div class="MuiBox-root css-sgter1">
                        <div class="MuiTypography-root MuiTypography-h6 css-edo8wy">
                            Payer et commencer
                            <svg style="margin-left: 8px; width: 16px; height: 16px; vertical-align: middle;" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                            </svg>
                        </div>
                    </div>
                </button>
            `;

            // Додаємо обробник кліку
            const payButton = payButtonContainer.querySelector("button");
            if (payButton) {
                payButton.addEventListener("click", function(e) {
                    e.preventDefault();
                    if (currentPaypalLink) {
                        window.open(currentPaypalLink, '_blank', 'noopener,noreferrer');
                    }
                    updateUIAfterPayment();
                });
            }

            // Додаємо блок умов (французька версія)
            const agreementBlock = document.createElement("div");
            agreementBlock.classList.add("MuiBox-root", "css-1yuhvjn");
            agreementBlock.innerHTML = `
                <p class="MuiTypography-root MuiTypography-body1 css-1gok911" style="text-align: center;">
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl">En cliquant, vous acceptez notre </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/privacy-policy" target="_blank">Politique de confidentialité</a>
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl"> et nos </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/terms-conditions-use" target="_blank">Conditions d'utilisation</a>
                </p>
            `;

            // Очищаємо та додаємо елементи
            paymentTabPanel.innerHTML = "";
            paymentTabPanel.appendChild(payButtonContainer);
            paymentTabPanel.appendChild(agreementBlock);
        });
    }

    function updateUIAfterPayment() {
        // Зберігаємо дані в localStorage
        const parkingData = {
            hours: selectedHours,
            minutes: selectedMinutes,
            plate: enteredText,
            email: enteredEmail,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('parkingSession', JSON.stringify(parkingData));
        
        // Перенаправляємо на сторінку успіху
        // window.location.href = 'success.html';
    }
    // function updateUIAfterPayment() {
    //     // Отримуємо поточний час і розраховуємо час закінчення у французькому форматі
    //     const now = new Date();
    //     const endTime = new Date(now.getTime() + selectedHours * 60 * 60 * 1000 + selectedMinutes * 60 * 1000);
        
    //     // Форматуємо дату французькою мовою
    //     const options = { 
    //         month: 'long', 
    //         day: 'numeric', 
    //         hour: 'numeric', 
    //         minute: 'numeric',
    //         hour12: false
    //     };
        
    //     let formattedEndTime;
    //     try {
    //         formattedEndTime = endTime.toLocaleDateString('fr-FR', options);
    //     } catch (e) {
    //         formattedEndTime = endTime.toLocaleDateString('fr-CA', options);
    //     }
    
    //     // 1. Оновлюємо блок з часом (французька версія)
    //     const timeBlock = document.querySelector(".css-17h6ml9");
    //     if (timeBlock) {
    //         timeBlock.innerHTML = `
    //             <div class="css-do46q9">
    //                 <div class="css-roducp">
    //                     <span class="css-m81iil">${selectedHours}h ${selectedMinutes}m restantes</span>
    //                     <p class="css-6fz2wu">Stationnement expire à ${formattedEndTime}</p>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 2. Приховуємо блок з селекторами годин/хвилин
    //     const lengthOfStaySection = document.querySelector('.MuiAccordion-root.css-1iv6cj9');
    //     if (lengthOfStaySection) {
    //         lengthOfStaySection.style.display = 'none';
    //     }
    
    //     // 3. Оновлюємо блок Vehicle (французька версія)
    //     const vehicleHeader = document.querySelector("#Vehicle-header");
    //     if (vehicleHeader) {
    //         vehicleHeader.innerHTML = `
    //             <div class="css-1n11r91" style="padding: 10px;">
    //                 <div class="css-8atqhb">
    //                     <p class="css-1gh8bh5">Commande #${enteredText}</p>
    //                     <p class="css-71ar21">${formattedEndTime}</p>
    //                 </div>
    //                 <div class="css-k008qs">
    //                     <button class="edit-icon-btn" type="button">
    //                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
    //                             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    //                         </svg>
    //                     </button>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 4. Оновлюємо блок Receipt (французька версія)
    //     const receiptHeader = document.querySelector("#Receipt-header");
    //     if (receiptHeader) {
    //         receiptHeader.innerHTML = `
    //             <div class="css-1n11r91" style="padding: 10px;">
    //                 <div class="css-8atqhb">
    //                     <p class="css-1gh8bh5">Reçu</p>
    //                     <p class="css-71ar21">${enteredEmail}</p>
    //                 </div>
    //                 <div class="css-k008qs">
    //                     <button class="edit-icon-btn" type="button">
    //                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
    //                             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    //                         </svg>
    //                     </button>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 5. Оновлюємо блок Payment (французька версія)
    //     const paymentHeader = document.querySelector("#Payment-header");
    //     if (paymentHeader) {
    //         paymentHeader.innerHTML = `
    //             <div class="css-1n11r91" style="padding: 10px;">
    //                 <div class="css-8atqhb">
    //                     <p class="css-1gh8bh5">Commentaires?</p>
    //                     <p class="css-71ar21">Dites-nous ce que vous en pensez</p>
    //                 </div>
    //                 <div class="css-k008qs">
    //                     <button class="edit-icon-btn" type="button">
    //                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
    //                             <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    //                         </svg>
    //                     </button>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 6. Повністю видаляємо блок з кнопкою оплати
    //     const paymentPanel = document.querySelector("#panel-Payment");
    //     if (paymentPanel) {
    //         paymentPanel.remove();
    //     }
    
    //     // 7. Приховуємо блок "Total"
    //     hideTotalBlock();
    // }
});
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
    let currentPaypalLink = "";

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
    quoteContainer.style.display = "none";

    // Додаємо блок "Total" до контейнера
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
            }, 300);
        }
    }

    // Функція для показу блоку "Total" з анімацією
    function showTotalBlock() {
        if (quoteContainer) {
            quoteContainer.style.display = "flex";
            quoteContainer.classList.add("fade-in");
            setTimeout(() => {
                quoteContainer.classList.remove("fade-in");
            }, 300);
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
        if (hours >= 3 && hours <= 5) return priceRanges["3-5"];
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

    // Функція для налаштування випадаючого списку
    function setupDropdown(buttonSelector, menuSelector, isHoursMenu = false) {
        const button = document.querySelector(buttonSelector);
        const menu = document.querySelector(menuSelector);

        if (!button || !menu) return;

        const options = menu.querySelectorAll(".MuiMenuItem-root");
        const selectedSpan = button.querySelector("span");

        // Відкриття/закриття меню
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

                const cleanText = option.textContent.replace(/\b(Hours|Minutes)\b/g, "").trim();
                if (selectedSpan) {
                    selectedSpan.textContent = cleanText;
                }

                menu.style.display = "none";
                updateUI();
                hideTotalBlock();

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

    // Ініціалізація меню для годин та хвилин
    setupDropdown("#hours-button", "#hours-menu", true);
    setupDropdown("#minutes-button", "#minutes-menu");

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

                if (quoteContainer) {
                    quoteContainer.querySelector(".css-ptmwmh").textContent = `CA$${selectedPrice.toFixed(2)}`;
                    showTotalBlock();
                }

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
                        placeholder="e.g. WDS4562"
                        type="text"
                        enterkeyhint="enter"
                        class="MuiInputBase-input MuiFilledInput-input css-2bxn45"
                        value="${enteredText}"
                    />
                </div>
                <p class="MuiFormHelperText-root MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-x3bti0" id="licensePlateInput-helper-text">
                    Must be 2-8 characters
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

                        addVehicleButton.textContent = "Edit";
                        addVehicleButton.disabled = false;
                        addVehicleButton.classList.remove("Mui-disabled");

                        const fieldContainer = licensePlateInput.closest(".license-plate-field");
                        if (fieldContainer) {
                            fieldContainer.classList.remove("visible");
                            setTimeout(() => fieldContainer.remove(), 300);
                        }

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
                        placeholder="e.g. example@example.com"
                        type="email"
                        enterkeyhint="enter"
                        class="MuiInputBase-input MuiFilledInput-input css-2bxn45"
                        value="${enteredEmail}"
                    />
                </div>
                <p class="MuiFormHelperText-root MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-x3bti0" id="emailInput-helper-text">
                    Must be a valid email address
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

                        addReceiptButton.textContent = "Edit";
                        addReceiptButton.disabled = false;
                        addReceiptButton.classList.remove("Mui-disabled");

                        const fieldContainer = emailInput.closest(".email-field");
                        if (fieldContainer) {
                            fieldContainer.classList.remove("visible");
                            setTimeout(() => fieldContainer.remove(), 300);
                        }

                        hideTotalBlock();
                    }
                });
            }
        });
    }

    // Обробник події для кнопки "Add Payment"
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

            // Створюємо кнопку "Pay and start session"
            const payButtonContainer = document.createElement("div");
            payButtonContainer.classList.add("MuiBox-root", "css-1iuj73f");
            payButtonContainer.innerHTML = `
                <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-disableElevation MuiButton-fullWidth css-1gub0x" tabindex="0" type="button">
                    <div class="MuiBox-root css-sgter1">
                        <div class="MuiTypography-root MuiTypography-h6 css-edo8wy">Pay and start session</div>
                        <div class="MuiTypography-root MuiTypography-body1 css-1gok911"></div>
                    </div>
                </button>
            `;
            
            // Створюємо блок з текстом про умови
            const agreementBlock = document.createElement("div");
            agreementBlock.classList.add("MuiBox-root", "css-1yuhvjn");
            agreementBlock.setAttribute("data-testid", "agreement-label-dti");
            agreementBlock.innerHTML = `
                <p class="MuiTypography-root MuiTypography-body1 css-1gok911" style="text-align: center;">
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl">By clicking "Pay and start session", you acknowledge that you have read hangTag's </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/privacy-policy" target="_blank">Privacy Policy</a>
                    <span class="MuiTypography-root MuiTypography-body2 css-efyhjl"> and agree to hangTag's </span>
                    <a class="MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways css-m2muwc" href="https://www.hangtag.io/terms-conditions-use" target="_blank">Terms of Use</a>.
                </p>
            `;

            // Очищаємо контейнер перед додаванням нових елементів
            paymentTabPanel.innerHTML = "";
            
            // Додаємо елементи до контейнера
            paymentTabPanel.appendChild(totalBlock);
            paymentTabPanel.appendChild(payButtonContainer);
            paymentTabPanel.appendChild(agreementBlock);

            // Робимо кнопку "Pay and start session" активною
            const payButton = payButtonContainer.querySelector(".css-1gub0x");
            if (payButton) {
                payButton.disabled = false;
                payButton.classList.remove("Mui-disabled");

                // Додаємо обробник події для переходу на PayPal
                payButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    
                    // Оновлюємо інтерфейс після оплати
                    updateUIAfterPayment();
                    
                    // Відкриваємо PayPal у новій вкладці
                    if (currentPaypalLink && currentPaypalLink !== "#") {
                        window.open(currentPaypalLink, '_blank');
                    } else {
                        console.error("Invalid PayPal link");
                    }
                });
            }

            // Робимо кнопку "Add" для платежу сірою і не клікабельною
            addPaymentButton.disabled = true;
            addPaymentButton.classList.add("Mui-disabled");
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
    // // Функція для оновлення інтерфейсу після оплати
    // function updateUIAfterPayment() {
    //     // Отримуємо поточний час і розраховуємо час закінчення
    //     const now = new Date();
    //     const endTime = new Date(now.getTime() + selectedHours * 60 * 60 * 1000 + selectedMinutes * 60 * 1000);
    //     const formattedEndTime = endTime.toLocaleDateString("en-US", { 
    //         month: "long", 
    //         day: "numeric", 
    //         hour: "numeric", 
    //         minute: "numeric" 
    //     });
    //     const formattedTime = formattedEndTime.replace(",", " until");

    //     // 0. Приховуємо весь блок Length of Stay з селекторами
    //     const lengthOfStaySection = document.querySelector('.MuiAccordion-root.css-1iv6cj9');
    //     if (lengthOfStaySection) {
    //         lengthOfStaySection.style.display = 'none';
    //         // Або повністю видаляємо, якщо потрібно
    //         // lengthOfStaySection.remove();
    //     }
    
    //     // 1. Оновлюємо блок з часом
    //     const timeBlock = document.querySelector(".css-17h6ml9");
    //     if (timeBlock) {
    //         timeBlock.innerHTML = `
    //             <div class="css-do46q9">
    //                 <div class="css-roducp">
    //                     <span class="css-m81iil">${selectedHours}h ${selectedMinutes}m Remaining</span>
    //                     <p class="css-6fz2wu">Parking Expires at ${formattedEndTime}</p>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 2. Оновлюємо блок Vehicle
    //     const vehicleHeader = document.querySelector("#Vehicle-header");
    //     if (vehicleHeader) {
    //         vehicleHeader.innerHTML = `
    //             <div class="css-1n11r91" style="padding: 10px;">
    //                 <div class="css-8atqhb">
    //                     <p class="css-1gh8bh5">Order #${enteredText}</p>
    //                     <p class="css-71ar21">${formattedTime}</p>
    //                 </div>
    //                 <div class="css-k008qs">
    //                     <button class="edit-icon-btn" type="button">
    //                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2" xmlns="http://www.w3.org/2000/svg">
    //                             <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/>
    //                         </svg>
    //                     </button>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 3. Оновлюємо блок Receipt
    //     const receiptHeader = document.querySelector("#Receipt-header");
    //     if (receiptHeader) {
    //         receiptHeader.innerHTML = `
    //             <div class="css-1n11r91" style="padding: 10px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
    //                 <div class="css-8atqhb">
    //                     <p class="css-1gh8bh5">Receipt</p>
    //                     <p class="css-71ar21">${enteredEmail}</p>
    //                 </div>
    //                 <div class="css-k008qs">
    //                     <button class="edit-icon-btn" type="button">
    //                         <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
    //                             <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/>
    //                         </svg>
    //                     </button>
    //                 </div>
    //             </div>
    //         `;
    //     }
    
    //     // 4. Оновлюємо блок Payment - мінімалістичний варіант
    //     const paymentHeader = document.querySelector("#Payment-header");
    //         if (paymentHeader) {
    //             paymentHeader.innerHTML = `
    //                 <div class="css-1n11r91" style="padding: 10px;">
    //                     <div class="css-8atqhb">
    //                         <p class="css-1gh8bh5">Feedback? Comments?</p>
    //                         <p class="css-71ar21">Tell us about your experience</p>
    //                     </div>
    //                     <div class="css-k008qs">
    //                         <button class="edit-icon-btn" type="button">
    //                             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    //                                 <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
    //                             </svg>
    //                         </button>
    //                     </div>
    //                 </div>
    //             `;
    //         }

    //         // 5. Повністю видаляємо блок з кнопкою оплати
    //         const paymentPanel = document.querySelector("#panel-Payment");
    //         if (paymentPanel) {
    //             paymentPanel.remove();
    //         }
    
    //     // Приховуємо блок "Total"
    //     hideTotalBlock();
        
    //     // Приховуємо блок Length of Stay
    //     const lengthOfStayHeader = document.querySelector("#LengthofStay-header");
    //     if (lengthOfStayHeader) {
    //         lengthOfStayHeader.remove();
    //     }
        

    // }
});
document.addEventListener("DOMContentLoaded", function() {
    
    debugger   
    
    // 1. Отримуємо параметри з URL
    const urlParams = new URLSearchParams(window.location.search);
    const timeParam = urlParams.get('time'); // Отримуємо параметр time з URL
    
    // 2. Отримуємо дані з localStorage (якщо є)

    let parkingData = localStorage.getItem('parkingSession')?JSON.parse(localStorage.getItem('parkingSession')):
    {
        hours: "--",
        minutes: "--",
        plate: "---",
        email: "No email provided",
        timestamp: Date.now()
    };;
    
    
    // 3. Якщо немає даних в localStorage, але є параметр time в URL
    if (timeParam && parkingData.hours == "--") {
        const totalMinutes = parseInt(timeParam) || 0; // Перетворюємо в число
        const now = new Date();
        
        parkingData = {
            ...parkingData,
            hours: Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60,
            timestamp: now.getTime()
        };
        
        // Зберігаємо в localStorage для подальшого використання
        localStorage.setItem('parkingSession', JSON.stringify(parkingData));
    }

    // 5. Розрахунок часу закінчення
    const endTime = new Date(parkingData.timestamp + 
                     parkingData.hours * 60 * 60 * 1000 + 
                     parkingData.minutes * 60 * 1000);
    
    const formattedEndTime = endTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // 6. Оновлюємо інтерфейс
    updateUI(parkingData, formattedEndTime);
    
    // 7. Запускаємо таймер (якщо дані валідні)
    if (typeof parkingData.hours === 'number' && typeof parkingData.minutes === 'number') {
        startTimer(endTime, formattedEndTime);
    }

    // Функція для оновлення інтерфейсу
    function updateUI(data, endTimeStr) {
        // Блок часу
        const timeBlock = document.querySelector(".css-roducp");
        if (timeBlock) {
            timeBlock.innerHTML = `
                <span class="css-m81iil">${data.hours}h ${data.minutes}m Remaining</span>
                <p class="css-6fz2wu">Parking Expires at ${endTimeStr}</p>
            `;
        }

        // Блок Vehicle
        const vehicleBlock = document.querySelector("#Vehicle-header .css-8atqhb");
        if (vehicleBlock) {
            vehicleBlock.innerHTML = `
                <p class="css-1gh8bh5">Order #${data.plate}</p>
                <p class="css-71ar21">${endTimeStr}</p>
            `;
        }

        // Блок Receipt
        const receiptBlock = document.querySelector("#Receipt-header .css-8atqhb");
        if (receiptBlock) {
            receiptBlock.innerHTML = `
                <p class="css-1gh8bh5">Receipt</p>
                <p class="css-71ar21">${data.email}</p>
            `;
        }
    }

    // Функція для таймера
    function startTimer(endTime, endTimeStr) {
        function update() {
            const now = new Date();
            const diff = endTime - now;
            
            const timeBlock = document.querySelector(".css-roducp");
            if (!timeBlock) return;
            
            if (diff <= 0) {
                timeBlock.innerHTML = `
                    <span class="css-m81iil">Session expired</span>
                `;
                localStorage.removeItem('parkingSession');
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timeBlock.innerHTML = `
                <span class="css-m81iil">${hours}h ${minutes}m ${seconds}s Remaining</span>
                <p class="css-6fz2wu">Parking Expires at ${endTimeStr}</p>
            `;
            
            setTimeout(update, 1000);
        }
        
        update();
    }
});
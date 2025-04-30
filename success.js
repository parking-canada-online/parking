document.addEventListener("DOMContentLoaded", function() {
    // Отримуємо дані з localStorage
    const parkingData = JSON.parse(localStorage.getItem('parkingSession'));
    
    if (!parkingData) {
        window.location.href = 'index.html';
        return;
    }

    // Розрахунок часу закінчення
    const endTime = new Date(parkingData.timestamp + 
                  parkingData.hours * 60 * 60 * 1000 + 
                  parkingData.minutes * 60 * 1000);
    
    const formattedEndTime = endTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // Оновлення блоку з часом
    const timeBlock = document.querySelector(".css-roducp");
    if (timeBlock) {
        timeBlock.innerHTML = `
            <span class="MuiTypography-root MuiTypography-body1 css-m81iil">${parkingData.hours}h ${parkingData.minutes}m Remaining</span>
            <p class="MuiTypography-root MuiTypography-body1 css-6fz2wu">Parking Expires at ${formattedEndTime}</p>
        `;
    }

    // Оновлення блоку Vehicle
    const vehicleBlock = document.querySelector("#Vehicle-header .css-8atqhb");
    if (vehicleBlock) {
        vehicleBlock.innerHTML = `
            <p class="css-1gh8bh5">Order #${parkingData.plate || 'N/A'}</p>
            <p class="css-71ar21">${formattedEndTime}</p>
        `;
    }

    // Оновлення блоку Receipt
    const receiptBlock = document.querySelector("#Receipt-header .css-8atqhb");
    if (receiptBlock) {
        receiptBlock.innerHTML = `
            <p class="css-1gh8bh5">Receipt</p>
            <p class="css-71ar21">${parkingData.email || 'No email provided'}</p>
        `;
    }

    // Таймер зворотного відліку
    function updateTimer() {
        const now = new Date();
        const diff = endTime - now;
        
        const timeBlock = document.querySelector(".css-roducp");
        if (!timeBlock) return;
        
        if (diff <= 0) {
            timeBlock.innerHTML = `
                <span class="MuiTypography-root MuiTypography-body1 css-m81iil">Session expired</span>
            `;
            localStorage.removeItem('parkingSession');
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timeBlock.innerHTML = `
            <span class="MuiTypography-root MuiTypography-body1 css-m81iil">${hours}h ${minutes}m ${seconds}s Remaining</span>
            <p class="MuiTypography-root MuiTypography-body1 css-6fz2wu">Parking Expires at ${formattedEndTime}</p>
        `;
        
        setTimeout(updateTimer, 1000);
    }
    
    updateTimer();

    // Очищаємо localStorage при закритті сторінки, якщо час вийшов
    window.addEventListener('beforeunload', function() {
        if (new Date() > endTime) {
            localStorage.removeItem('parkingSession');
        }
    });
});
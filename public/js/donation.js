var map = L.map('map').setView([49.25, -123.00], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function addFoodBankMarkers() {
    try {
        const response = await axios.get('/foodBanks');
        const foodBanks = response.data;
        foodBanks.forEach(bank => {
            const popup = `<div class="fw-semibold">${bank.name}</div>
                <div>${bank.location}</div><div class="mb-1">${bank.details}</div>
                <button type="button" class="btn btn-success" onclick="selectFoodBank('${bank._id}', '${bank.name}')">Donate Here</button>
            `;
            L.marker([bank.coordinates.latitude, bank.coordinates.longitude]).addTo(map)
                .bindPopup(popup);
        });
    } catch (error) {
        console.error('Error fetching food banks:', error);
    }
}

function selectFoodBank(foodBankId, foodBankName) {
    document.getElementById('foodBankId').value = foodBankId;
    alert(`Selected food bank: ${foodBankName}`);
}

// Call the async function
addFoodBankMarkers();

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".oval-button").forEach(function(button) {
        button.addEventListener("click", function() {
            document.querySelector(".popup").style.display = "flex";
        });
    });

    document.querySelectorAll(".close, .addNote").forEach(function(button) {
        button.addEventListener("click", function(){
            document.querySelector(".popup").style.display = "none";
        });
    });

    document.querySelectorAll(".addToDB").forEach(function(button) {
        button.addEventListener("click", function(){
            var itemName = button.getAttribute("data-item");
            var amountInput = document.querySelector(`input[name="amount"][data-item="${itemName}"]`);
            var amount = amountInput ? amountInput.value : 0;
            var note = document.querySelector(".popUpInput").value;
            var searchInput = document.querySelector('input[name="search"]').value;
            var urlInput = document.querySelector(`input[name="url"][data-item="${itemName}"]`).value;

            fetch('/addSearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({itemName: itemName, amount: amount, note: note, input: searchInput, url: urlInput}),
            })
        });
    });
});
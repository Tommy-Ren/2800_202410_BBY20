const selectIngredients = document.getElementById('selectIngredients');
const generateRecipes = document.getElementById('generateRecipes');

selectIngredients.addEventListener('click', function(e) {
    e.preventDefault();
    const selectedIngredients = document.querySelectorAll('.form-check-input.ingredient');
    for (const cb of selectedIngredients) {
        if (cb.hasAttribute('hidden')) {
            cb.removeAttribute('hidden');
        } else {
            cb.setAttribute('hidden', 'true');
        }
    }
    if (generateRecipes.style.display === 'none') {
        generateRecipes.style.display = 'block';
        const navbar = document.querySelector('.navbar');
        navbar.remove();
    } else {
        generateRecipes.style.display = 'none';
        generateRecipes.insertAdjacentHTML('afterend', `<nav class="navbar fixed-bottom d-flex justify-content-evenly">
        <a href="/home" class="nav-icon">
            <span class="material-symbols-outlined">
                kitchen
            </span> 
            Inventory
        </a>
        <a href="/shopping" class="nav-icon active">
            <span class="material-symbols-outlined">
                shopping_cart
            </span> 
            Cart
        </a>
        <a href="/setting" class="nav-icon">
            <span class="material-symbols-outlined">
                settings
            </span> 
            Setting
        </a>
    </nav>`);
    }
});

const readCheckboxValue = async () => {
    const ingredients = document.querySelectorAll('.form-check-input.ingredient:checked');
    const selectedIngredients = Array.from(ingredients).map(checkbox => checkbox.value);
    // console.log(selectedIngredients);
    
    // Fetch recipeCollection from MongoDB
    // const response = await fetch('/api/recipeCollection');
    // const recipeCollection = await response.json();
    
    // Filter recipes based on selected ingredients
    // const filteredRecipes = recipeCollection.filter(recipe => {
    //     return selectedIngredients.every(ingredient => recipe.ingredients.includes(ingredient));
    // });
    
    // Redirect to /recipe page with filtered recipes
    // window.location.href = '/recipe?recipes=' + encodeURIComponent(JSON.stringify(filteredRecipes));
    window.location.href = '/recipes'
};

// Call the function when a button is clicked or any other event triggers
// For example:
generateRecipes.addEventListener('click', readCheckboxValue);
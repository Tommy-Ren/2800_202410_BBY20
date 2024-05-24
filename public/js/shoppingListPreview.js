document.querySelector('.toggle').addEventListener('dblclick', function() {
    var slider = document.querySelector('.slider');
    
    
    var div = document.querySelector('.easterEggChange');
    var newText = div.innerHTML.replace('Shopping List', 'Fun, right babe? 😘');
    div.innerHTML = newText;
    
    setTimeout(function() {
        var originalText = newText.replace('Fun, right babe? 😘', 'Shopping List');
        div.innerHTML = originalText;
    }, 800);
    slider.style.display = 'block';
    return;
});

document.querySelector('.toggle').addEventListener('click', function() {
    this.classList.toggle('clicked');
    var slider = document.querySelector('.slider');
    if (slider.style.transform == 'translateX(-500px)') {
        slider.style.transition = '1.8s ease';
        slider.style.transform = 'translateX(0)';
    } else {
        slider.style.transition = '1.8s ease';
        slider.style.transform = 'translateX(-500px)';
    }
});


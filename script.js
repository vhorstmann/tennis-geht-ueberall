
document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Filter: ' + button.textContent);
        });
    });
});

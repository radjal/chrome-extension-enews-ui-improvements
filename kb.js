  const searchBox = document.getElementById('searchBox');
  const sections = document.querySelectorAll('section.doc-section');

  searchBox.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    sections.forEach(sec => {
      const text = sec.innerText.toLowerCase();
      if (!query || text.includes(query)) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });
  });

  // Active nav highlight on scroll
  const navLinks = document.querySelectorAll('#sideNav a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (!sec.classList.contains('hidden')) {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
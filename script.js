// AuraGame: small client-side interactions.
document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector("#game-search");
  const cards = [...document.querySelectorAll(".game-card")];
  const filters = [...document.querySelectorAll(".filter-btn")];
  const count = document.querySelector("#game-count");
  const empty = document.querySelector(".no-results");
  let activeCategory = "all";

  function filterGames() {
    const query = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
      const matchesSearch = card.textContent.toLowerCase().includes(query);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = visible + (visible === 1 ? " GAME" : " GAMES");
    if (empty) empty.style.display = visible ? "none" : "block";
  }

  search?.addEventListener("input", filterGames);
  filters.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterGames();
  }));
  if (cards.length) filterGames();
});
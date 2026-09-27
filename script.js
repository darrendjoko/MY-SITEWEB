/* ==========================================================================
   Emtop Cameroun — Logique Client
   Catalogue, recherche instantanée, panier dynamique, WhatsApp et animations
   ========================================================================== */

// Numéro WhatsApp officiel configuré
const WHATSAPP_PHONE = "237699118478";

// Échantillon représentatif du catalogue avec les références et la marge appliquée
const PRODUCTS_DATA = [
  {
    id: "EM-PER650",
    name: "Perceuse à percussion 650 W",
    ref: "EM-PER650",
    category: "electroportatif",
    price: 45000,
    specs: "Mandrin 13 mm, vitesse variable, béton et bois",
    badge: "Populaire"
  },
  {
    id: "EM-MEU115",
    name: "Meuleuse d'angle 115 mm 900 W",
    ref: "EM-MEU115",
    category: "electroportatif",
    price: 38000,
    specs: "Poignée réglable, carter de protection renforcé",
    badge: "Top Vente"
  },
  {
    id: "EM-VIS20",
    name: "Visseuse sans fil 20 V Li-Ion",
    ref: "EM-VIS20",
    category: "electroportatif",
    price: 62000,
    specs: "2 batteries fournies avec chargeur rapide et coffret",
    badge: "Pack Pro"
  },
  {
    id: "EM-COF46",
    name: "Coffret de clés à douille 46 pièces",
    ref: "EM-COF46",
    category: "outils-main",
    price: 29000,
    specs: "Acier chrome-vanadium haute résistance",
    badge: "Atelier"
  },
  {
    id: "EM-TOR10",
    name: "Jeu de tournevis isolés 1000 V",
    ref: "EM-TOR10",
    category: "outils-main",
    price: 12500,
    specs: "6 tournevis plats et cruciformes certifiés électricien",
    badge: "Sécurité"
  },
  {
    id: "EM-MUL01",
    name: "Multimètre digital professionnel",
    ref: "EM-MUL01",
    category: "mesure",
    price: 19500,
    specs: "Mesure tension, courant, résistance et continuité",
    badge: "Électronique"
  },
  {
    id: "EM-TEL40",
    name: "Télémètre laser portée 40 m",
    ref: "EM-TEL40",
    category: "mesure",
    price: 34000,
    specs: "Précision millimétrique, calcul surfaces et volumes",
    badge: "Chantier"
  },
  {
    id: "EM-DIS115",
    name: "Lot de 10 disques à tronçonner 115 mm",
    ref: "EM-DIS115",
    category: "accessoires",
    price: 8000,
    specs: "Spécial découpe inox et acier",
    badge: "Consommable"
  }
];

// État du panier
let cart = JSON.parse(localStorage.getItem("emtop_cart_store") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(PRODUCTS_DATA);
  setupFiltersAndSearch();
  setupCartDrawer();
  setupAccordion();
  setupScrollReveal();
  setupContactForm();
  updateCartUI();
});

/* ---------- 1. Rendu des Cartes Produits ---------- */
function renderProducts(list) {
  const container = document.getElementById("products-container");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 0;">
        <p>Aucun produit ne correspond à votre recherche.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <article class="product-card reveal is-visible">
      <div class="product-thumb">
        <span class="product-category-tag">${item.category.toUpperCase()}</span>
        <span class="product-icon-brand">EMTOP</span>
      </div>
      <h3>${item.name}</h3>
      <div class="product-ref">Réf : ${item.ref}</div>
      <p class="product-specs">${item.specs}</p>
      <div class="product-bottom">
        <span class="product-price">${formatCurrency(item.price)}</span>
        <button class="btn-add-cart" onclick="addToCart('${item.id}')">
          Ajouter +
        </button>
      </div>
    </article>
  `).join("");
}

/* ---------- 2. Filtrage & Recherche Instantanée ---------- */
function setupFiltersAndSearch() {
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let currentCategory = "all";
  let currentQuery = "";

  function applyFilters() {
    const filtered = PRODUCTS_DATA.filter(prod => {
      const matchCat = currentCategory === "all" || prod.category === currentCategory;
      const matchQuery = prod.name.toLowerCase().includes(currentQuery) || 
                         prod.ref.toLowerCase().includes(currentQuery);
      return matchCat && matchQuery;
    });
    renderProducts(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });
}

/* ---------- 3. Gestion du Panier ---------- */
window.addToCart = function(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: prod.id,
      name: prod.name,
      ref: prod.ref,
      price: prod.price,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${prod.name} ajouté au panier !`);
};

window.changeQty = function(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartUI();
};

function saveCart() {
  localStorage.setItem("emtop_cart_store", JSON.stringify(cart));
}

function updateCartUI() {
  const badge = document.getElementById("cart-badge");
  const itemsContainer = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("cart-total");

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (badge) badge.textContent = totalCount;
  if (totalDisplay) totalDisplay.textContent = formatCurrency(totalPrice);

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="empty-cart-msg">Votre panier est vide pour le moment.</p>';
    return;
  }

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>Réf : ${item.ref} · ${formatCurrency(item.price)}</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join("");
}

/* ---------- 4. Tiroir Panier & Commande WhatsApp ---------- */
function setupCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const openBtn = document.getElementById("cart-btn");
  const closeBtn = document.getElementById("cart-close");
  const whatsappBtn = document.getElementById("checkout-whatsapp-btn");

  function openCart() {
    drawer.classList.add("open");
    backdrop.classList.add("open");
  }

  function closeCart() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
  }

  if (openBtn) openBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (backdrop) backdrop.addEventListener("click", closeCart);

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Votre panier est vide.");
        return;
      }

      // Construction du message WhatsApp formatté
      let message = "Bonjour Emtop Cameroun, je souhaite passer la commande suivante :\n\n";
      let total = 0;

      cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `${index + 1}. *${item.name}* (Réf: ${item.ref})\n   Qté : ${item.qty} x ${formatCurrency(item.price)} = ${formatCurrency(subtotal)}\n`;
      });

      message += `\n*TOTAL ESTIMÉ : ${formatCurrency(total)}*`;
      message += "\n\nMerci de me confirmer la disponibilité et le délai de livraison.";

      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  }
}

/* ---------- 5. Accordéon FAQ ---------- */
function setupAccordion() {
  const items = document.querySelectorAll(".accordion-item");
  items.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    if (trigger) {
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        items.forEach(i => i.classList.remove("active"));
        if (!isOpen) item.classList.add("active");
      });
    }
  });
}

/* ---------- 6. Animations d'Apparition au Scroll ---------- */
function setupScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- 7. Formulaire de Contact ---------- */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("c-name").value;
    const phone = document.getElementById("c-phone").value;
    const msg = document.getElementById("c-msg").value;

    const text = `Demande de contact via le site :\nNom : ${name}\nTéléphone : ${phone}\nMessage : ${msg}`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  });
}

/* ---------- Utilitaires ---------- */
function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

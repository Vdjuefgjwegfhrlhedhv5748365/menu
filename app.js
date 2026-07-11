let cart = [];

function getSectionId(section) {
    const map = {
        'cold': 'coldStarters',
        'hotstarter': 'hotStarters',
        'soup': 'soups',
        'main': 'mainDishes',
        'grill': 'grill',
        'side': 'sides',
        'dessert': 'desserts',
        'sauce': 'sauces'
    };
    return map[section] || section;
}

function getCountId(section) { return 'count-' + section; }

function renderAll() {
    const sections = ['cold', 'hotstarter', 'soup', 'main', 'grill', 'side', 'dessert', 'sauce'];
    sections.forEach(sec => {
        const container = document.getElementById(getSectionId(sec));
        if (!container) return;
        const items = dishesData.filter(d => d.section === sec);
        container.innerHTML = '';
        items.forEach((dish) => {
            const isInCart = cart.some(item => item.dishName === dish.name);
            const card = document.createElement('div');
            card.className = 'card';
            if (dish.allergens) card.classList.add('allergen-bg');
            if (dish.spicy) card.classList.add('spicy-bg');
            if (isInCart) card.classList.add('in-cart');

            const header = document.createElement('div');
            header.className = 'card-header';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'dish-name';
            nameSpan.textContent = dish.name;
            header.appendChild(nameSpan);

            const badgeGroup = document.createElement('div');
            badgeGroup.className = 'badge-group';
            if (dish.allergens) {
                const b = document.createElement('span');
                b.className = 'badge allergen';
                b.textContent = '⚠️ аллерген';
                badgeGroup.appendChild(b);
            }
            if (dish.spicy) {
                const b = document.createElement('span');
                b.className = 'badge spicy';
                b.textContent = '🌶️ острое';
                badgeGroup.appendChild(b);
            }
            header.appendChild(badgeGroup);
            card.appendChild(header);

            const desc = document.createElement('div');
            desc.className = 'description';
            desc.textContent = dish.desc;
            card.appendChild(desc);

            if (dish.note) {
                const note = document.createElement('div');
                note.className = 'note';
                note.textContent = '📌 ' + dish.note;
                card.appendChild(note);
            }

            const noteWrapper = document.createElement('div');
            noteWrapper.className = 'guest-note-wrapper';
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = '📝 Заметка для гостя';
            const existing = cart.find(item => item.dishName === dish.name);
            if (existing && existing.note) input.value = existing.note;
            input.addEventListener('input', (e) => {
                const found = cart.find(item => item.dishName === dish.name);
                if (found) found.note = e.target.value;
                updateCartUI();
            });
            noteWrapper.appendChild(input);
            card.appendChild(noteWrapper);

            const actions = document.createElement('div');
            actions.className = 'card-actions';

            if (isInCart) {
                const btnRemove = document.createElement('button');
                btnRemove.className = 'btn btn-remove';
                btnRemove.textContent = '✕ Убрать';
                btnRemove.addEventListener('click', () => {
                    cart = cart.filter(item => item.dishName !== dish.name);
                    updateCartUI();
                    renderAll();
                });
                actions.appendChild(btnRemove);
            } else {
                const btnAdd = document.createElement('button');
                btnAdd.className = 'btn btn-add';
                btnAdd.textContent = '➕ В корзину';
                btnAdd.addEventListener('click', () => {
                    const noteVal = input.value.trim();
                    cart.push({ dishName: dish.name, note: noteVal });
                    updateCartUI();
                    renderAll();
                    card.classList.add('just-added');
                    setTimeout(() => card.classList.remove('just-added'), 300);
                });
                actions.appendChild(btnAdd);
            }
            card.appendChild(actions);
            container.appendChild(card);
        });
    });
    updateCartUI();
    updateSectionCounts();
}

function updateCartUI() {
    const count = cart.length;
    document.getElementById('selectedCount').textContent = count;
    document.getElementById('cartBadge').textContent = '🛒 ' + count;
    renderCartList();
    updateSectionCounts();
}

function renderCartList() {
    const list = document.getElementById('cartList');
    if (cart.length === 0) {
        list.innerHTML = '<div style="color:#aaa69a; text-align:center; padding:30px 0;">Пока пусто</div>';
        document.getElementById('cartTotal').textContent = 'Итого: 0 блюд';
        return;
    }
    let html = '';
    cart.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.dishName}</div>
                    ${item.note ? `<span class="cart-item-note">📝 ${item.note}</span>` : ''}
                </div>
                <button class="cart-item-remove" data-index="${index}">✕ Убрать</button>
            </div>
        `;
    });
    list.innerHTML = html;
    document.getElementById('cartTotal').textContent = `Итого: ${cart.length} блюд`;

    list.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            cart.splice(idx, 1);
            updateCartUI();
            renderAll();
        });
    });
}

function updateSectionCounts() {
    const sections = ['cold', 'hotstarter', 'soup', 'main', 'grill', 'side', 'dessert', 'sauce'];
    sections.forEach(sec => {
        const items = dishesData.filter(d => d.section === sec);
        const countEl = document.getElementById(getCountId(sec));
        if (countEl) {
            const inCart = items.filter(item => cart.some(c => c.dishName === item.name)).length;
            countEl.textContent = inCart;
        }
    });
}

const overlay = document.getElementById('cartOverlay');
document.getElementById('cartBadge').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('openCartBtn').addEventListener('click', () => overlay.classList.add('open'));
document.getElementById('cartClose').addEventListener('click', () => overlay.classList.remove('open'));
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
document.getElementById('cartClear').addEventListener('click', () => {
    cart = [];
    updateCartUI();
    renderAll();
    overlay.classList.remove('open');
});

renderAll();
